const { default: axios } = require('axios');
const moment = require('moment');

class Request {
  static get baseUrl() {
    return 'https://tinfoil.media';
  }

  static get titleUrl() {
    return `${ Request.baseUrl }/Title`;
  }

  static get apiJsonUrl() {
    return `${ Request.titleUrl }/ApiJson`
  }

  static async titles() {
    const randomCacheNumber = moment().unix();

    try {
      const { data: { data } } = await axios.get(`${ Request.apiJsonUrl }/?_=${ randomCacheNumber }`);

      return data;
    } catch (err) {
      console.error(err);

      throw err;
    }
  }

  static async title(id) {
    try {
      const { data } = await axios.get(`${ Request.titleUrl }/${ id }`);

      return data;
    } catch (err) {
      console.error(err);

      throw err;
    }
  }
}

module.exports = Request;
