const detectCharacterEncoding = require('detect-character-encoding')
import iconv from "iconv-lite";
const charset = require('charset')
const cheerio = require('cheerio')
const request = require('request')
const axios = require('axios')
const metaExtractor = require('meta-extractor')
const Url = require('url')
import config from "../../config";

function isIgnoredKeyword(text) {
  return config.ignoreKeywords.includes(text)
}

async function getInfoFromHtml(destinationUrl) {
  try {
    const options = {
      uri: destinationUrl,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
        'accept-language': 'en-US,en;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 8000,
    }
    const metadata = await metaExtractor(options)
    const title = metadata.ogTitle || metadata.twitterTitle || metadata.title
    const thumbnail = metadata.ogImage || metadata.twitterImage
    const description = metadata.ogDescription || metadata.twitterDescription
    const link = metadata.ogUrl || metadata.twitterUrl || destinationUrl
    return {
      title,
      thumbnail,
      description,
      link,
    }
  } catch (e) {
    console.log('getInfoFromHtml error', e.message)
    return {}
  }
}

async function getDestinationUrl(url) {
  try {
    const response = await axios({
      url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
        'accept-language': 'en-US,en;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      maxRedirects: 10,
      timeout: 8000,
    })
    const { responseUrl } = response.request.res
    return responseUrl || url
  } catch (e) {
    console.log(e.message)
    return url
  }
}

function getEncoding(data, headers) {
  const buf = Buffer.from(data);
  let enc = detectCharacterEncoding(buf).encoding;
  if (!enc) {
    enc = charset(headers, buf);
  }

  return enc;
}

function convertString(data, enc) {
  return iconv.decode(Buffer.from(data), enc).toString()
}

async function requestUrl(url) {
  try {
    const response = await axios({
      url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
        'accept-language': 'en-US,en;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      maxRedirects: 10,
      timeout: 8000,
    })
    const { responseUrl } = response.request.res
    const { status, data, headers } = response;
    const enc = getEncoding(data, headers);
    const body = convertString(data, enc);
    return {
      responseUrl,
      headers,
      enc,
      status,
      body,
    }
  } catch (e) {
    console.log(e.message)
    return null
  }
}

function getHostnameByUrl(urlStr) {
  return (Url.parse(urlStr) || {}).hostname
}

module.exports = {
  getInfoFromHtml,
  getDestinationUrl,
  isIgnoredKeyword,
  getHostnameByUrl,
  requestUrl,
}
