const { ipcRenderer, remote } = require('electron');
const { Menu, MenuItem } = remote;
const { isEmpty, get, lowerCase, startCase } = require('lodash');
const Templates = require('../templates');
const { LISTS } = require('../storage/constants');

class DOM {
  static menuWishlistButton(params) {
    const { id, name, size } = params;
    const current = ipcRenderer.sendSync('get-title-current');

    if (!id) return;

    const item = ipcRenderer.sendSync('get-wishlist-item', id);
    const menu = new Menu();

    Object.keys(LISTS).forEach((key) => {
      if (get(item, 'entries', []).includes(LISTS[ key ])) return;

      const menuItem = new MenuItem({
        label: `To "${ LISTS[ key ].replace('_', ' ') }"`,
        click: () => {
          ipcRenderer.sendSync('has-title', id)
            ? ipcRenderer.sendSync('add-item-to-list', id, LISTS[ key ])
            : ipcRenderer.sendSync('add-wishlist-item', { id, name, size }, LISTS[ key ]);

          if (get(current, 'id') === id) DOM.toggleWishlistButtonLabel(true);
          DOM.replaceWishlistLinkHtml();
          DOM.updateImageButtonClass();
        }
      });

      menu.append(menuItem);
    });

    return menu;
  }

  static handlerSearchKeydown() {
    const input = document.querySelector('#search');
    if (!input) return;

    input.onkeydown = (event) => {
      if(event.keyCode === 13) {
        DOM.toggleLoaderClass(true);
        DOM.toggleShowAllButtonDisabled(false);

        const input = event.target.value;
        if (isEmpty(input));

        ipcRenderer.send('search-titles-items', input);
      }
    };
  }

  static handlerImageButtonClick() {
    const buttons = document.querySelectorAll('.nav-image-button')
    if (isEmpty(buttons)) return;

    buttons.forEach(((elem) => {
      elem.addEventListener('click', async (event) => {
        event.preventDefault();

        DOM.toggleLoaderClass(true);

        const id = event.target.getAttribute('title-id')
          || event.target.parentElement.getAttribute('title-id')
          || event.target.parentElement.parentElement.getAttribute('title-id')        

        ipcRenderer.send('request-title', id);
      });
    }));
  }

  static handlerWishlistLinkClick() {
    const links = document.querySelectorAll('.nav-wishlist-item');
    if (isEmpty(links)) return;

    links.forEach((elem) => {
      elem.addEventListener('click', async (event) => {
        event.preventDefault();

        DOM.toggleLoaderClass(true);

        const id = event.target.getAttribute('title-id');

        ipcRenderer.send('request-title', id);
      });

      elem.addEventListener('contextmenu', (event) => {
        event.preventDefault();

        const id = event.target.getAttribute('title-id');
        const item = ipcRenderer.sendSync('get-wishlist-item', id);

        DOM.menuWishlistButton(item).popup(remote.getCurrentWindow());
      });
    });
  }

  static handlerShowAllButtonClick() {
    const button = document.querySelector('#show-all');
    if (!button) return;

    button.addEventListener('click', (event) => {
      event.preventDefault();

      DOM.toggleLoaderClass(true);
      DOM.toggleShowAllButtonDisabled(true);

      ipcRenderer.send('get-titles-items');
    });
  }

  static handleNavigationButtonClick() {
    const buttonToWishlist = document.querySelector('#add-wishlist');
    const buttonSpoiler = document.querySelector('.js-container-target');
    const buttonPrevious = document.querySelector('#prev-title');
    const buttonNext = document.querySelector('#next-title');

    if (buttonToWishlist) {
      buttonToWishlist.addEventListener('click', (event) => {
        event.preventDefault();

        DOM.eventToWishlist();
      });

      buttonToWishlist.addEventListener('contextmenu', (event) => {
        event.preventDefault();

        const item = ipcRenderer.sendSync('get-title-current');

        DOM.menuWishlistButton(item).popup(remote.getCurrentWindow());
      });
    }

    if (buttonPrevious) {
      buttonPrevious.addEventListener('click', (event) => {
        event.preventDefault();

        DOM.eventTitlePrevious();
      });
    }

    if (buttonNext) {
      buttonNext.addEventListener('click', (event) => {
        event.preventDefault();

        DOM.eventTitleNext();
      });
    }

    if (buttonSpoiler) {
      buttonSpoiler.addEventListener('click', (event) => {
        event.preventDefault();

        event.target.parentElement.classList.toggle('is-open');
      });
    };
  }

  static handlerSelectItemClick() {
    const select = document.querySelector('.nav-select-list #select');

    if (!select) return;

    select.selectedIndex = 0;
    select.addEventListener('change', (event) => {
      ipcRenderer.sendSync('set-wishlist-list', select.value);
      
      DOM.replaceWishlistLinkHtml();
    });
  }

  static toggleShowAllButtonDisabled(value) {
    const button = document.querySelector('#show-all');
    if (!button) return;
    button.disabled = value;
  }

  static toggleWishlistButtonLabel(has) {
    const button = document.querySelector('#add-wishlist');
    if (!button) return;
    has ? button.innerHTML = 'Remove' : button.innerHTML = 'Add';
  }

  static toggleLoaderClass(value) {
    const loader = document.querySelector('#loader');
    if (!loader) return;
    value ? loader.classList.add('is-show') : loader.classList.remove('is-show');
  }

  static replaceNavTitlesHtml(data) {
    const navbar = document.getElementById('nav-titles');
    if (!navbar) return;
    navbar.innerHTML = data;

    DOM.handlerImageButtonClick();
    DOM.updateImageButtonClass();
    DOM.toggleLoaderClass(false);
  }

  static replaceContentTitleHtml(data, hasTitle) {
    const content = document.getElementById('content');
    if (!content) return;
    content.innerHTML = data;

    DOM.toggleWishlistButtonLabel(hasTitle);
    DOM.handleNavigationButtonClick();
    DOM.toggleLoaderClass(false);
  }

  static replaceWishlistLinkHtml() {
    const container = document.getElementById('wishlist');
    if (!container) return;
    const items = ipcRenderer.sendSync('get-list-items');
    container.innerHTML = Templates.wishlist({ items });

    DOM.handlerWishlistLinkClick();
  }

  static replaceSelectListHtml() {
    const container = document.getElementById('select');
    if (!container) return;
    
    const items = Object.keys(LISTS).map((x) => {
      return { name: startCase(lowerCase(x)), value: LISTS[ x ] };
    });

    container.innerHTML = Templates.select({ items });

    DOM.handlerSelectItemClick();
  }
  
  static updateImageButtonClass() {
    const current = ipcRenderer.sendSync('get-title-current');
    const items = ipcRenderer.sendSync('get-wishlist-items');
    const ids = items.map((x) => x.id);
    const buttons = document.querySelectorAll('.nav-image-button');
    if (isEmpty(buttons)) return;
    
    buttons.forEach((elem) => {
      current && elem.id === current.id
        ? elem.classList.add('is-selected')
        : elem.classList.remove('is-selected');

      ids.includes(elem.id)
        ? elem.classList.add('added')
        : elem.classList.remove('added');
    });
  }

  static updateImageButtonSelected(id) {
    const button = document.getElementById(id);
    const selected = document.querySelector('.nav-image-button.is-selected');

    if (selected) {
      selected.classList.remove('is-selected');
    }

    if (button) {
      button.classList.add('is-selected');
    }
  }

  static eventToWishlist() {
    const { id, name, size } = ipcRenderer.sendSync('get-title-current');
    if (!id) return;
    const has = ipcRenderer.sendSync('has-title', id);
    has ? ipcRenderer.sendSync('delete-wishlist-item', (id)) : ipcRenderer.sendSync('add-wishlist-item', { id, name, size });

    DOM.toggleWishlistButtonLabel(!has);
    DOM.replaceWishlistLinkHtml();
    DOM.updateImageButtonClass();
  }

  static eventTitlePrevious() {
    const selected = document.querySelector('.nav-image-button.is-selected');
    if (!selected) return;
    const previous = selected.previousSibling;
    if (!previous) return;

    DOM.toggleLoaderClass(true);

    ipcRenderer.send('request-title', previous.getAttribute('title-id'));
  }

  static eventTitleNext() {
    const selected = document.querySelector('.nav-image-button.is-selected');
    if (!selected) return;
    const next = selected.nextSibling;
    if (!next) return;

    DOM.toggleLoaderClass(true);

    ipcRenderer.send('request-title', next.getAttribute('title-id'));
  }
}

module.exports = DOM;
