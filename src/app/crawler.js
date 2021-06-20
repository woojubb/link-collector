import models, { Link, LinkInfo, UrlOrigin } from '../common/models';
import { getLinkRule, getCategory, getCleanLink, getLinks, getLinkInfo } from '../common/utils/link';
import { addDocument } from "../common/utils/elasticsearch";
import { getInfoFromHtml, requestUrl, getHostnameByUrl } from '../common/utils';
import { crawling } from '../common/utils/crawling';

const TIMER_INTERVAL = 60000;
const MAX_LINK_LIST_COUNT = 100;

class Crawler {
    _context = null;
    _workerId = null
    _timerId = null
    _working = false
    _status = {
        count: {
            last: 0,
            total: 0,
        },
    }
    
    constructor({context}) {
        this._context = context;
    }

    async start() {
        this._initWorker()
        this._initTimer()
    }

    _initWorker() {
        this._workerId = setInterval(async () => {
            if (this._working) {
                return
            }
            this._working = true
            const links = await getLinks({
                filterQuery: { checked: false },
                count: MAX_LINK_LIST_COUNT
            });
            try {
                await this._crawlingAll(links);
            } catch (e) {
                this._context.console.log(e);
            }
            // for (let i = 0; i < links.length; i++) {
            //     await this._crawling(links[i])
            // }
            this._working = false
        }, 500)
    }

    _initTimer() {
        this._timerId = setInterval(() => {
            const diff = this._status.count.total - this._status.count.last
            const speed = diff / (TIMER_INTERVAL / 1000)
            this._context.console.log(`last = ${this._status.count.last}, total = ${this._status.count.total}, ${speed.toFixed(2)} links/s`)
            this._status.count.last = this._status.count.total
            // if (diff === 0) {
            //     this._context.console.log('Process is hang')
            //     process.exit()
            // }
        }, TIMER_INTERVAL)
    }

    async _crawling(linkModel) {
        this._status.count.total++;

        return await crawling(linkModel, this._context.elasticsearch);
    }

    _crawlingAll(links) {
        if (!links.length) {
            return Promise.resolve();
        }

        return Promise.all(links.map(link => this._crawling(link)));
    }

    async _getLinkInfo(url) {
        try {
            return await getLinkInfo({ "alias.url": url });
        } catch (e) {
            this._context.console.log('LinkInfo.findOne error', e)
        }
    }
}

module.exports = Crawler
