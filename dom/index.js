const { ipcRenderer } = require('electron');
const { isEmpty } = require('lodash');

const Templates = require('../templates');

class DOM {
  static handlerSearchKeydown() {
    if (!document) {
      return;
    }

    document.querySelector('#search').onkeydown = (event) => {
      if(event.keyCode === 13) {
        DOM.toggleLoaderClass(true);

        const titlesJson = ipcRenderer.sendSync('search-titles-items', event.target.value);
        const titlesHtml = Templates.listButton(titlesJson);

        DOM.replaceNavTitlesHtml(titlesHtml);
        DOM.toggleShowAllButtonDisabled(false);
        DOM.handlerImageButtonClick();
        DOM.updateImageButtonClass();
        DOM.toggleLoaderClass(false);
      }
    };
  }

  static handlerImageButtonClick() {
    if (!document) {
      return;
    }

    document.querySelectorAll('.nav-image-button').forEach(((elem) => {
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
    document.querySelectorAll('.nav-wishlist-item').forEach((elem) => {
      elem.addEventListener('click', async (event) => {
        event.preventDefault();
        DOM.toggleLoaderClass(true);

        const id = event.target.getAttribute('title-id');

        ipcRenderer.send('request-title', id);
      });
    });
  }

  static handlerShowAllButtonClick() {
    document.querySelector('#show-all').addEventListener('click', (event) => {
      event.preventDefault();

      const titlesJson = ipcRenderer.sendSync('get-titles-items');
      const titlesHtml = Templates.listButton(titlesJson);

      DOM.toggleShowAllButtonDisabled(true);
      DOM.replaceNavTitlesHtml(titlesHtml);
      DOM.updateImageButtonClass();
      DOM.handlerImageButtonClick();
    });
  }

  static toggleShowAllButtonDisabled(value) {
    if (!document) {
      return;
    }

    const button = document.querySelector('#show-all');

    button.disabled = value;
  }

  static toggleWishlistButtonLabel(has) {
    const button = document.querySelector('#add-wishlist');

    has ? button.innerHTML = 'Remove' : button.innerHTML = 'Add';
  }

  static toggleLoaderClass(value) {
    if (!document) {
      return;
    }

    const loader = document.querySelector('#loader');

    value ? loader.classList.add('is-show') : loader.classList.remove('is-show');
  }

  static replaceNavTitlesHtml(data) {
    if (!document) return;

    const navbar = document.getElementById('nav-titles');
    
    navbar.innerHTML = data;

    DOM.handlerImageButtonClick();
    DOM.updateImageButtonClass();
    DOM.toggleLoaderClass(false);
  }

  static replaceContentTitleHtml(data, hasTitle) {
    if (!document) {
      return;
    }

    const content = document.getElementById('content');

    content.innerHTML = data;

    DOM.toggleWishlistButtonLabel(hasTitle);
    DOM.handleNavigationButtonClick();
    DOM.toggleLoaderClass(false);
  }

  static replaceWishlistLinkHtml(items) {
    if (!document) {
      return;
    }

    const container = document.getElementById('wishlist');
    container.innerHTML = Templates.wishlist({ items });

    DOM.handlerWishlistLinkClick();
  }
  
  static updateImageButtonClass() {
    if (!document) {
      return;
    }

    const current = ipcRenderer.sendSync('get-title-current');
    const items = ipcRenderer.sendSync('get-wishlist-items');
    const ids = items.map((x) => x.id);

    document.querySelectorAll('.nav-image-button').forEach((elem) => {
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

  static eventToWishlist() {
    const { id, name, size } = ipcRenderer.sendSync('get-title-current');
    if (!id) return;
    const has = ipcRenderer.sendSync('has-title', id);
    const items = has
      ? ipcRenderer.sendSync('delete-wishlist-item', (id))
      : ipcRenderer.sendSync('add-wishlist-item', { id, name, size });

    DOM.toggleWishlistButtonLabel(!has);
    DOM.replaceWishlistLinkHtml(items);
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
