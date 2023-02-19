const { ipcRenderer } = require('electron');

const DOM = require('./dom');
const Templates = require('./templates');

ipcRenderer.on('is-ready', () => {
  DOM.handlerSearchKeydown();
  DOM.handlerShowAllButtonClick();
  DOM.replaceSelectListHtml();
});

ipcRenderer.on('loader', (_, value) => {
  DOM.toggleLoaderClass(value);
});

ipcRenderer.on('update-titles', (_, titles) => {
  const titlesHtml = Templates.listButton(titles);

  DOM.replaceNavTitlesHtml(titlesHtml);
});

ipcRenderer.on('response-title', (_, titleJson) => {
    const titleHtml = Templates.title(titleJson);
    const hasTitle = ipcRenderer.sendSync('has-title', titleJson.id);

    DOM.replaceContentTitleHtml(titleHtml, hasTitle);
});

ipcRenderer.on('update-wishlist', (_) => {
  const wishlistJson = ipcRenderer.sendSync('get-wishlist-items');

  DOM.replaceWishlistLinkHtml(wishlistJson);
});

ipcRenderer.on('update-database', async () => {
  DOM.toggleLoaderClass(true);
  ipcRenderer.send('update-database')
});

ipcRenderer.on('select-title', (_, id) => {
  DOM.updateImageButtonSelected(id);
});

ipcRenderer.on('add-title-wishlist', () => {
  DOM.eventToWishlist();
});

ipcRenderer.on('change-title-next', () => {
  DOM.eventTitleNext();
});

ipcRenderer.on('change-title-previous', () => {
  DOM.eventTitlePrevious();
});
