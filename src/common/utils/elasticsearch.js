const htmlArticleExtractor = require('html-article-extractor')
const elasticsearch = require('elasticsearch')
const { JSDOM, VirtualConsole } = require('jsdom')
const { default: config } = require('../../config')

export async function addDocument({ elasticsearch, url, id, metadata, text }) {
    let article
    try {
        const pattern = /<body[^>]*>((.|[\n\r])*)<\/body>/im
        const html = (pattern.exec(text) || [])[0] || text || ''
        const virtualConsole = new VirtualConsole()
        virtualConsole.sendTo(console, { omitJSDOMErrors: true })
        let dom = new JSDOM(html, { virtualConsole })
        let body = dom.window.document.body || null
        article = htmlArticleExtractor(body)
    } catch (e) {
        console.log('error', e)
    }

    return await elasticsearch.index({
        index: config.elasticsearch.index,
        type: 'article',
        body: {
            id,
            url,
            article: article.text,
            date: new Date(),
            ...metadata,
        },
    })
}

export async function deleteDocument({ elasticsearch, id }) {
    return await elasticsearch.delete({
        index: config.elasticsearch.index,
        type: 'article',
        id
    })
}

export async function search(query) {
    const response = await elasticsearch.search({
        index: config.elasticsearch.index,
        body: {
            query: {
                function_score: {
                    query: {
                        match: {
                            article: query,
                        },
                    },
                    gauss: {
                        date: {
                            scale: '10d',
                            offset: '5d',
                            decay: 0.5,
                        },
                    },
                },
            },
            highlight: {
                fields: {
                    _all: { pre_tags: ['<em>'], post_tags: ['</em>'] },
                    article: {
                        number_of_fragments: 5,
                        order: 'score',
                        fragment_size: 150,
                    },
                },
            },
        },
    })
    return response
}
