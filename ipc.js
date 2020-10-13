const { dialog, ipcMain } = require('electron');

const { StoreTitles, StoreWishlist } = require('./storage');
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
    event.returnValue = StoreTitles.getAll();
  });

  ipcMain.on('get-title-current', (event) => {
    event.returnValue = StoreTitles.current;
  });

  ipcMain.on('limit-titles-items', (event, offset) => {
    event.returnValue = StoreTitles.limit(offset);
  });

  ipcMain.on('search-titles-items', (event, name) => {
    event.returnValue = StoreTitles.search(name);
  });

  ipcMain.on('get-wishlist-items', (event) => {
    event.returnValue = StoreWishlist.getAll();
  });

  ipcMain.on('get-wishlist-item', (event, id) => {
    event.returnValue = StoreWishlist.getById(id);
  });

  ipcMain.on('add-wishlist-item', (event, item) => {
    event.returnValue = StoreWishlist.create(item);
  });

  ipcMain.on('delete-wishlist-item', (event, id) => {
    event.returnValue = StoreWishlist.delete(id);
  });

  ipcMain.on('update-database', async (event) => {
    const titlesJson = await Request.titles();
    const titlesParse = Parser.titles(titlesJson);

    StoreTitles.put(titlesParse);

    event.reply('put-titles');
    event.reply('loader', false);
  });
}

module.exports = {
  init,
};