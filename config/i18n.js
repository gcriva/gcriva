'use strict';

const i18n = require('i18n');
const path = require('path');

module.exports = function configureI18n(app) {
  i18n.configure({
    locales: ['pt-BR'],
    defaultLocale: 'pt-BR',
    api: {
      __: 't',  // req.__ becomes req.t
      __n: 'tn' // req.__n can be called as req.tn
    },
    objectNotation: true, // allows using nested translations, e.g. 'greetings.formal'
    directory: path.join(__dirname, '../locales')
  });

  app.use(i18n.init);
};
