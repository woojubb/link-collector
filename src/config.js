require("dotenv").config();
import config from "../config.json";

export default {
    elasticsearch: {
        host: process.env.ELASTICSEARCH_HOST,
        index: process.env.ELASTICSEARCH_INDEX
    },
    mongodb: {
        uri: process.env.MONGODB_URI
    },
    server: {
        httpPort: process.env.HTTP_PORT || 3000
    },
    redis: {
        url: process.env.REDIS_URL
    },
    ...config
};
