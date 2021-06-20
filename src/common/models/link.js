const mongoose = require('mongoose')

export const LINK_TYPE = {
    ARTICLE: "ARTICLE",
    RSS: "RSS"
};

export const Link = mongoose.model(
    'Link',
    new mongoose.Schema({
        url: {
            type: String,
            index: true,
        },
        hostname: {
            type: String,
            index: true,
        },
        inserted_at: {
            type: Date,
            index: true,
        },
        type: {
            type: String,
            enum: [LINK_TYPE.ARTICLE, LINK_TYPE.RSS],
            default: LINK_TYPE.ARTICLE
        },
        checked: {
            type: Boolean,
            index: true,
            default: false,
        },
        enabled: {
            type: Boolean,
            default: false,
        },
    }),
)