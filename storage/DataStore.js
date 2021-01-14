const Store = require('electron-store');
const moment = require('moment');
const { find, findIndex, filter, orderBy, slice, remove, isEmpty } = require('lodash');

class DataStore extends Store {
  constructor(config) {
    super(config);

    this.name = config.name;
    this.current = {};
    this.items = this.get(this.name, []);
  }

  get ready() {
    return !isEmpty(this.items);
  }

  save() {
    this.set(this.name, this.items);
    return this.items;
  }

  put(items) {
    this.items = orderBy(items, [ 'timestamp' ], [ 'desc' ]);
    return this.save();
  }

  create(item) {
    const has = find(this.items, (x) => x.id === item.id);
    if (has) return;
    delete item.index;
    this.items.push(item);
    return this.save();
  }

  getAll() {
    return this.items;
  }

  getById(id) {
    const index = findIndex(this.items, { id: String(id) });
    if (index === -1) return null;
    return Object.assign(this.items[ index ], { index });
  }

  has(id) {
    const index = findIndex(this.items, { id: String(id) });
    return index !== -1;
  }

  previous(index) {
    if (index === 0) return { id: null };
    return this.items[ index - 1 ];
  }

  next(index) {
    if (index === (this.items.length - 1)) return { id: null };
    return this.items[ index + 1 ];
  }

  deleteById(id) {
    remove(this.items, { id: String(id) });
    return this.save();
  }

  search(name) {
    const [ tag, req ] = name.split(':');
    let dateStart;
    let dateEnd;

    switch (tag) {
      case 'pub':
        return filter(this.items, (item) => item.publisher && item.publisher.search(new RegExp(req, 'i')) !== -1);
      case 'id':
        return filter(this.items, (item) => item.id && item.id.search(new RegExp(req, 'i')) !== -1);
      case 'rel':
        return filter(this.items, (item) => item.release_date && item.release_date.search(new RegExp(req, 'i')) !== -1);
      case 'lmt':
        const [ limit, offset ] = req.split(',');
        if (!limit) return;
        return this.limit(Number(limit), Number(offset || 0));
      case 'from':
        dateStart = moment(req);
        return filter(this.items, (item) => moment(item.timestamp) >= dateStart);
      case 'to':
        dateEnd = moment(req);
        return filter(this.items, (item) => moment(item.timestamp) <= dateEnd);
      case 'fromto':
        const [ from, to ] = req.split(',');
        dateStart = moment(from);
        dateEnd = moment(to);
        return filter(this.items, (item) => {
          const date = moment(item.timestamp);
          return date >= dateStart && date <= dateEnd;
        });
      default:
        return filter(this.items, (item) => item.name && item.name.search(new RegExp(name, 'i')) !== -1);
    }
  }

  limit(limit = 100, offset = 0) {
    this.items = this.get(this.name, []);
    return slice(this.items, offset, limit + offset);
  }
}

module.exports = DataStore;
