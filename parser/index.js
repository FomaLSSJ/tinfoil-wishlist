const cheerio = require('cheerio');
const moment = require('moment');
const { map } = require('lodash');

class Parser {
  static titles(data) {
    return map(data, (item) => {
      const name = cheerio.load(item.name)('a').text();
      const icon = cheerio.load(item.icon)('div').attr('style');
      const timestamp = item.release_date ? moment(item.release_date) : 0;

      return {
        id: item.id,
        name: name,
        publisher: item.publisher,
        timestamp: timestamp,
        release_date: item.release_date,
        size: item.size,
        icon: icon
      };
    });
  }

  static title(data) {
    const $ = cheerio.load(data);
    const description = $('#title > div > div.container > div:nth-child(3) > p').text();
    const images = []
    
    $('ul.screenshots li').each((i, li) => {
      images.push($(li).find('img').attr('src'));
    });

    return {
      description: description,
      images: images
    };
  }
};

module.exports = Parser;
