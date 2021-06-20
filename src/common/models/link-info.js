const mongoose = require('mongoose')

export const LinkInfo = mongoose.model(
    'LinkInfo',
    new mongoose.Schema({
        url: {
            type: String,
            unique: true,
        },
        hostname: {
            type: String,
            index: true,
        },
        title: String,
        thumbnail: String,
        description: String,
        alias: [{
            url: {
                type: String,
                index: true
            }
        }],
        search_index_id: {
            type: String
        },
        category: {
            type: Array,
            index: true,
        },
        updated_at: {
            type: Date,
            index: true,
        },
        inserted_at: {
            type: Date,
            index: true,
        },
    }),
);