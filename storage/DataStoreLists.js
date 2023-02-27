const DataStore = require('./DataStore');
const { findIndex, remove, find, filter, isObject, pull } = require('lodash');
const { STORAGES } = require('./constants');

class DataStoreLists extends DataStore {
  constructor(config) {
    super(config);

    this.current = STORAGES.IN_FUTURE;
  }

  set currentList(value) {
    this.current = value;
  }

  has(id) {
    const index = findIndex(this.items, { id: String(id) });
    return index !== -1;
  }

  findItem(id) {
    return find(this.items, (x) => x.id === id);
  }

  createOrUpdate(item, category) {
    const findItem = find(this.items, (x) => x.id === item.id);
    const cat = category || this.current || STORAGES.IN_FUTURE;

    if (findItem) {
      if (findItem.entries.includes(cat)) {
        if (findItem.entries.length < 2) {
          this.deleteById(findItem.id);
        } else {
          const result = pull(findItem.entries, cat);
          findItem.entries = result;
        }
      } else {
        findItem.entries.push(cat);
      }
    } else {
      this.items.push({ ...item, entries: [ cat ] });
    }

    this.save();
  }

  getList() {
    return filter(this.items, (x) => (this.current === STORAGES.IN_FUTURE && !x.entries) || (x.entries && x.entries.includes(this.current)));
  }
}

module.exports = DataStoreLists;
