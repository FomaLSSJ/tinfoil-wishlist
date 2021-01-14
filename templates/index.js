const { template } = require('lodash');
const path = require('path');
const fs = require('fs');

const buttonTemplate = fs.readFileSync(path.join(__dirname, 'html', 'button.html'), { encoding: 'utf8' });
const titleTemplate = fs.readFileSync(path.join(__dirname, 'html', 'title.html'), { encoding: 'utf8' });
const wishlistTemplate = fs.readFileSync(path.join(__dirname, 'html', 'wishlist.html'), { encoding: 'utf8' });
const selectTemplate = fs.readFileSync(path.join(__dirname, 'html', 'select.html'), { encoding: 'utf8' });

class Templates {
  static button(params) {
    return template(buttonTemplate)(params);
  }

  static listButton(data) {
    return data.map((item) => this.button(item)).join('');
  }

  static title(params) {
    return template(titleTemplate)(params);
  }

  static wishlist(params) {
    return template(wishlistTemplate)(params);
  }

  static select(params) {
    return template(selectTemplate)(params);
  }
}

module.exports = Templates;
