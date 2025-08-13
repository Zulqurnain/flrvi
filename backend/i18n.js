const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'locales');
const resources = {};

fs.readdirSync(localesDir).forEach(file => {
  if (file.endsWith('.json')) {
    const lang = file.split('.')[0];
    resources[lang] = {
      translation: require(path.join(localesDir, file))
    };
  }
});

i18next
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    resources,
    fallbackLng: 'en',
    preload: ['en', 'th'],
    detection: {
      order: ['header', 'querystring', 'cookie'],
      caches: ['cookie']
    }
  });

module.exports = i18next;
