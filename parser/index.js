const cheerio = require('cheerio');
const moment = require('moment');
const { map, isEmpty } = require('lodash');

class Parser {
  static titles(data) {
    return map(data, (item) => {
      const name = cheerio.load(item.name)('a').text();
      const icon = cheerio.load(item.icon)('div').attr('style');

      return {
        id: item.id,
        name: name,
        publisher: item.publisher,
        timestamp: item.release_date ? moment(item.release_date) : 0,
        release_date: item.release_date,
        size: item.size,
        icon: icon
      };
    });
  }

  static title(data) {
    const $ = cheerio.load(data);
    const version = $('#title > div > div.container > ul > li:nth-child(3) > div').text();
    const languages = $('#title > div > div.container > ul > li:nth-child(9) > div').text();
    const description = $('#title > div > div.container > div:nth-child(3) > p').text();
    const images = []
    
    $('ul.screenshots li').each((i, li) => images.push($(li).find('img').attr('src')));

    return {
      description: description,
      images: images,
      version: isEmpty(version) ? '-' : version,
      languages: isEmpty(languages) ? '-' : languages.replace(/\s/g, '').toUpperCase(),
    };
  }
};

module.exports = Parser;
