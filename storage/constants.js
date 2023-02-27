const { pick } = require('lodash');

const STORAGES = Object.freeze({
  TITLES: 'titles',
  WISHLIST: 'wishlist',
  CATEGORIES: 'categories',
  IN_FUTURE: 'in_future',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
});

const CATEGORIES = Object.freeze({
  in_future: 'In future',
  in_progress: 'In progress',
  completed: 'Completed',
  dropped: 'Dropped',
});

module.exports = {
  STORAGES,
  CATEGORIES,
}
