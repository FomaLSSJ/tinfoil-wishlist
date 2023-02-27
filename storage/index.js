const DataStore = require('./DataStore');
const DataStoreLists = require('./DataStoreLists');
const DataStoreCategories = require('./DataStoreCategories');

const { STORAGES } = require('./constants');

module.exports = {
  StoreTitles: new DataStore({ name: STORAGES.TITLES }),
  StoreWishlist: new DataStoreLists({ name: STORAGES.WISHLIST }),
  StoreCategories: new DataStoreCategories({ name: STORAGES.CATEGORIES }),
};
