import models, { Link, LinkInfo, LINK_TYPE, UrlOrigin } from '../models';
import { getLinkRule, getCategory, getCleanLink, getLinks, getLinkInfo, saveLink, getLinkInfoByAlias } from './link';
import { addDocument } from "./elasticsearch";
import { getInfoFromHtml, requestUrl, getHostnameByUrl } from '../utils';
import RSS from "rss-parser";

const rss = new RSS();

const TIMER_INTERVAL = 60000;
const MAX_LINK_LIST_COUNT = 100;


export async function crawling(linkModel, elasticsearch) {
    console.log(`Crawling link: ${linkModel.url}`);
    // 해당 링크에 대한 룰이 있는지 확인한다.
    const linkRule = getLinkRule(linkModel.hostname);
    if (!linkRule.store) {
        await linkModel.updateOne({
            enabled: false,
            checked: true,
        })
        throw new Error(`Disabled link: ${linkModel.url}`);
    }

    if (linkModel.type === LINK_TYPE.RSS) {
        const feed = await rss.parseURL(linkModel.url);
        await Promise.all(feed.items.map(item => saveLink(item.link)));
        return await linkModel.updateOne({
            enabled: true,
            checked: true,
        })
    }

    const currentDate = new Date()
    let destinationUrl = null
    let body = null

    let linkInfo = await getLinkInfoByAlias(linkModel.url);
    if (linkInfo) {
        const { store: isStoreEnabled } = getLinkRule(hostname)
        await linkModel.updateOne({
            enabled: isStoreEnabled,
            checked: true,
        })
        throw new Error('linkInfo already exists:', linkModel)
    }

    const response = await requestUrl(linkModel.url)
    if (!response || response._status === 404) {
        throw new Error('Request url error:', linkModel.url)
    }

    body = response.body
    destinationUrl = getCleanLink(response.responseUrl || linkModel.url)
    const hostname = getHostnameByUrl(destinationUrl)
    const { crawling: isCrawlingEnabled, store: isStoreEnabled } = getLinkRule(hostname)
    await linkModel.updateOne({
        enabled: isStoreEnabled,
        checked: true,
    })

    linkInfo = await getLinkInfoByAlias(destinationUrl);
    if (linkInfo) {
        // 있으면 alias 추가
        await linkInfo.updateOne({
            $push: {
                alias: {
                    url: linkModel.url
                }
            },
            updated_at: currentDate
        });
        return await linkModel.updateOne({
            enabled: isStoreEnabled,
            checked: true,
        })
    }

    // 없으면 새로 만들어야 함

    if (!isStoreEnabled) {
        throw new Error(`Disabled link: ${destinationUrl}`)
    }

    if (!isCrawlingEnabled) {
        throw new Error(`Crawling disabled: ${destinationUrl}`)
    }

    const metadata = await getInfoFromHtml(destinationUrl)
    const { title, thumbnail, description, url } = metadata;

    const alias = [{url: linkModel.url}];

    if (linkModel.url !== destinationUrl) {
        alias.push({url: destinationUrl});
    }

    const metaUrl = url ? getCleanLink(url) : null;
    if (metaUrl && metaUrl !== destinationUrl) {
        alias.push({url: metaUrl});
    }

    const {_id: searchIndexId} = await addDocument({
        elasticsearch,
        metadata: {
            ...metadata,
            hostname,
        },
        id: destinationUrl,
        url: destinationUrl,
        text: body,
    })

    const newLinkInfo = new LinkInfo({
        url: metaUrl || destinationUrl,
        title,
        hostname,
        category: getCategory(hostname),
        alias,
        search_index_id: searchIndexId,
        thumbnail,
        description,
        inserted_at: currentDate,
    })

    await newLinkInfo.save()
}

