// const Crawler = require('./crawler');
// const Indexer = require('./indexer');
import DebugConsole from "../common/debug-console";
import Crawler from "./crawler";
import Server from "./server";
import Elasticsearch from "elasticsearch";
import asyncRedis from "async-redis";
import mongoose from "mongoose";

// TODO:
// 디비에서 데이터 꺼내오기
// 꺼내온 데이터는 서버에 마킹하기
// 처리 후 완료 처리
// 처리중 에러 발생시 원상복구

class App {
    _console = new DebugConsole();
    _elasticsearch = null;
    _mongoose = null;

    constructor({ config }) {
        const context = this;

        this._config = config;
        this._initMongodb();
        this._initElasticsearch();
        this._initRedis();
        this._crawler = new Crawler({ context });
        this._server = new Server({ context });
    }

    get console() {
        return this._console;
    }

    get elasticsearch() {
        return this._elasticsearch;
    }

    get mongoose() {
        return this._mongoose;
    }

    get config() {
        return this._config;
    }

    _initElasticsearch() {
        this._elasticsearch = new Elasticsearch.Client({
            host: this._config.elasticsearch.host,
            log: "error"
        })

        const context = this;
        this._elasticsearch.ping(
            {
                requestTimeout: 1000,
            },
            function (error) {
                if (error) {
                    context._console.log('Elasticsearch cluster is down!')
                } else {
                    context._console.log('Elasticsearch okay.')
                }
            },
        )
    }

    async _initMongodb() {
        const context = this;
        this._mongoose = mongoose;
        this._mongoose.connection.on('error', err => {
            context.console.log('db connection error: ', err)
        })
        this._mongoose.connection.once('open', () => {
            context.console.log('Connected to mongod server')
        })

        await this._mongoose.connect(this._config.mongodb.uri)
    }

    _initRedis() {
        const context = this;
        this.redisClient = asyncRedis.createClient(this._config.redis.url)
        this.redisClient.on('error', function (err) {
            context._console.log('Error ' + err)
        })
    }

    start() {
        // this._indexer.start();
        this._crawler.start();
        this._server.start();
    }
}

export default App;
