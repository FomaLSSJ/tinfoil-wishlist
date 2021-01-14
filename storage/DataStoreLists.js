const DataStore = require('./DataStore');
const { findIndex, remove, find, filter } = require('lodash');
const { STORAGES, LISTS } = require('./constants');

class DataStoreLists extends DataStore {
  constructor(config) {
    super(config);

    this.current = LISTS.IN_FUTURE;
  }

  set currentList(value) {
    this.current = value;
  }

  has(id) {
    const index = findIndex(this.items, { id: String(id) });
    return index !== -1;
  }

  create(item, list) {
    const has = find(this.items, (x) => x.id === item.id);
    if (has) return;  
    this.items.push({ ...item, entries: [ list || STORAGES.IN_FUTURE ] });
    return this.save();
  }

  addTo(id, list) {
    const has = find(this.items, (x) => x.id === id);
    if (!has) return;
    remove(has.entries, (x) => Object.values(STORAGES).includes(x));
    const toList = list || STORAGES.IN_FUTURE;
    (!has.entries) ? has.entries = [ toList ] : has.entries.push(toList);
    delete has.index;
    return this.save();
  }

  getList() {
    return filter(this.items, (x) => (this.current === LISTS.IN_FUTURE && !x.entries) || (x.entries && x.entries.includes(this.current)));
  }
}

module.exports = DataStoreLists;
