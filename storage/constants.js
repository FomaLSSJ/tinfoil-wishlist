const { pick } = require('lodash');

const STORAGES = {
  TITLES: 'titles',
  WISHLIST: 'wishlist',
  IN_FUTURE: 'in_future',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  DROPPED: 'dropped'
};

const LISTS = {
  IN_FUTURE: 'in_future',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  DROPPED: 'dropped'
};

module.exports = {
  STORAGES,
  LISTS
}
