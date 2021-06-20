const Url = require('url')
const queryString = require('query-string')
import { Link, LinkInfo } from '../models';
import config from "../../config";

const DEFAULT_RETURN_STRUCTURE = {
    crawling: true,
    store: true,
    allowQueryString: true,
}

export async function saveLink(url, type) {
    url = getCleanLink(url)
    const { hostname } = Url.parse(url)
    const { store } = getLinkRule(hostname)
    if (!store) {
        console.log(`Disabled link: ${url}`)
        return
    }
    const link = new Link({
        url,
        hostname,
        type,
        inserted_at: new Date(),
    })
    try {
        return await link.save()
    } catch (e) {
        console.log('save link error:', e.message)
    }
}

export async function getLinks(options) {
    const {
        filterQuery = {},
        sort = { inserted_at: -1 },
        count = 20
    } = options || {};

    return await Link
        .find(filterQuery)
        .sort(sort)
        .limit(count);
}

export async function getLinkInfos(options) {
    const {
        filterQuery = {},
        sort = { inserted_at: -1 },
        count = 20
    } = options || {};

    return await LinkInfo
        .find(filterQuery)
        .sort(sort)
        .limit(count);
}

export async function getLink(options) {
    const {
        filterQuery = {},
    } = options || {};

    return await Link
        .findOne(filterQuery);
}

export async function getLinkInfo(options) {
    const {
        filterQuery = {}
    } = options || {};
    return await LinkInfo.findOne(filterQuery);
}

export async function getLinkInfoByAlias(url) {
    const filterQuery = {alias: { $elemMatch: {url}}};

    return await getLinkInfo({filterQuery});
}

export async function deleteLinkInfo(options) {
    const {
        filterQuery = {}
    } = options || {};
    return await LinkInfo.deleteOne(filterQuery);
}

export async function deleteLink(options) {
    const {
        filterQuery = {},
    } = options || {};

    return await Link
        .deleteOne(filterQuery);
}

export function getCategory(hostname) {
    let category = []
    for (const categoryName in config.category) {
        const list = config.category[categoryName]
        for (const domain of list) {
            if ((hostname || '').endsWith(domain)) {
                category.push(categoryName)
            }
        }
    }
    return category
}

export function getLinkRule(hostname) {
    for (const domain in config.crawler) {
        if ((hostname || '').endsWith(domain)) {
            return {
                ...DEFAULT_RETURN_STRUCTURE,
                ...config.crawler[domain],
            }
        }
    }
    return DEFAULT_RETURN_STRUCTURE
}

export function getCleanLink(link) {
    if (!link) {
        return link
    }

    const { search, hostname } = Url.parse(link)
    if (!search) {
        return link
    }

    const defaultUrl = link.split('?')[0].split('#')[0]
    const { allowQueryString } = getLinkRule(hostname)
    if (!allowQueryString) {
        return defaultUrl
    }

    const parsed = queryString.parse(search)
    delete parsed.utm_campaign
    delete parsed.utm_medium
    delete parsed.utm_source
    delete parsed.utm_term
    delete parsed.utm_content
    delete parsed.ref
    const query = queryString.stringify(parsed)
    const cleanLink = `${defaultUrl}${query ? `?${query}` : ''}`
    return cleanLink
}
