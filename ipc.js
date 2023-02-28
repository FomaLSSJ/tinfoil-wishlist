const { dialog, ipcMain } = require('electron');

const { StoreTitles, StoreWishlist, StoreCategories } = require('./storage');
const Request = require('./request');
const Parser = require('./parser');

function init() {
  ipcMain.on('report-error', (event, err) => {
    dialog.showErrorBox('Error', err.message);
    
    event.reply('loader', false);
  });

  ipcMain.on('request-title', async (event, id) => {
    try {
      const titleHtml = await Request.title(id);
      const titleParse = Parser.title(titleHtml);

      const titleInStore = StoreTitles.getById(id);
      const titleJson = Object.assign(titleParse, titleInStore);

      StoreTitles.current = titleJson;

      event.reply('select-title', id);
      event.reply('response-title', titleJson);
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('has-title', (event, id) => {
    event.returnValue = StoreWishlist.has(id);
  });

  ipcMain.on('get-titles-items', (event) => {
    const titlesJson = StoreTitles.getAll();

    event.reply('update-titles', titlesJson);
  });

  ipcMain.on('get-title-current', (event) => {
    event.returnValue = StoreTitles.current;
  });

  ipcMain.on('limit-titles-items', (event, offset) => {
    event.returnValue = StoreTitles.limit(offset);
  });

  ipcMain.on('search-titles-items', (event, input) => {
    if (input.startsWith('lmt:')) {
      const [ _, offset ] = input.split(':');
      StoreTitles.offset = Number(offset);
    }

    const titles = StoreTitles.search(input);

    event.reply('update-titles', titles);
    event.reply('loader', false);
  });

  ipcMain.on('get-titles-more', (event) => {
    StoreTitles.offset += 100;
    
    const titles = StoreTitles.limit(StoreTitles.offset);

    event.reply('update-titles', titles);
    event.reply('loader', false);
  });

  ipcMain.on('get-titles-offset', (event) => {
    event.returnValue = StoreTitles.offset;
  });

  ipcMain.on('get-wishlist-items', (event) => {
    event.returnValue = StoreWishlist.getAll();
  });

  ipcMain.on('get-wishlist-item', (event, id) => {
    event.returnValue = StoreWishlist.getById(id);
  });

  ipcMain.on('create-or-update-wishlist-item', (event, item, list) => {
    event.returnValue = StoreWishlist.createOrUpdate(item, list);
  });

  ipcMain.on('delete-wishlist-item', (event, id) => {
    event.returnValue = StoreWishlist.deleteById(id);
  });

  ipcMain.on('set-wishlist-list', (event, value) => {
    StoreWishlist.currentList = value;
    event.returnValue = StoreWishlist.getList();
  });

  ipcMain.on('get-list-items', (event) => {
    event.returnValue = StoreWishlist.getList();
  });

  ipcMain.on('update-database', async (event) => {
    const titlesJson = await Request.titles();
    const titlesParse = Parser.titles(titlesJson);

    StoreTitles.put(titlesParse);

    event.reply('update-titles', StoreTitles.limit(100));
    event.reply('loader', false);
  });

  ipcMain.on('get-categories-items', async (event) => {
    event.returnValue = StoreCategories.getAll();
  });
}

module.exports = {
  init,
};