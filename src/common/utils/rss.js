const RSS = require('rss');

function generateRss(data) {
  let items = data.map((item) => {
    const info = (item.info || [])[0] || {};
    const { thumbnail, hostname, title, description } = info;
    return {
      title: title || item._id,
      description: (thumbnail ? '<img src="' + thumbnail + '">' : '') + (description ? '<p>' + description + '</p>' : ''),
      date: item.inserted_at,
      guid: item._id,
      url: item._id,
    };
  });
  //last_time_insert

  var feed = new RSS({
    title: 'Link collector',
    link: 'https://',
    site_url: 'http://',
    generator: 'link-collector',
    description: 'link collector',
    language: 'en',
    ttl: '60',
    lastBuildDate: new Date(),
    pubDate: new Date(),
  });
  for (let item of items) {
    feed.item(item);
  }

  var xml = feed.xml({ indent: true });
  return xml;
}

module.exports = {
  generateRss,
};
