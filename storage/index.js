const DataStore = require('./DataStore');
const DataStoreLists = require('./DataStoreLists');

const { STORAGES } = require('./constants');

module.exports = {
  StoreTitles: new DataStore({ name: STORAGES.TITLES }),
  StoreWishlist: new DataStoreLists({ name: STORAGES.WISHLIST }),
};
