const { default: axios } = require('axios');

const baseUrl = 'https://tinfoil.media';

class Request {
  static async titles() {
    const randomCacheNumber = Math.floor(Math.random() * 2000000000000);

    try {
      const { data: { data } } = await axios.get(`${ baseUrl }/Title/ApiJson/?_=${ randomCacheNumber }`);

      return data;
    } catch (err) {
      throw err;
    }
  }

  static async title(id) {
    try {
      const { data } = await axios.get(`${ baseUrl }/Title/${ id }`);

      return data;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Request;
