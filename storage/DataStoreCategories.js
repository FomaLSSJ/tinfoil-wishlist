const DataStore = require('./DataStore');
const { findIndex, remove, find, filter, map, merge } = require('lodash');
const { CATEGORIES } = require('./constants');

class DataStoreCategories extends DataStore {
  constructor(config) {
    super(config);

    this.defaultCategories = DataStoreCategories.parseCategories;
  }

  static get parseCategories() {
    return map(CATEGORIES, (value, key) => {
      return {
        id: key,
        name: value,
      };
    });
  }

  getAll() {
    return this.defaultCategories.concat(this.items);
  }

  getById(id) {
    const items = this.defaultCategories.concat(this.items);
    const index = findIndex(items, { id: String(id) });
    if (index === -1) return null;
    return Object.assign(items[ index ], { index });
  }

  create(item) {
    if (find(DataStoreCategories.parseCategories, item.id)) return;
    super.create(item);
  }
}

module.exports = DataStoreCategories;
