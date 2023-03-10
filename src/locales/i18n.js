import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { getLocal, setLocal } from '@/utils/local';
import { LANG } from '@/config/constants/app';
/* eslint-disable */
Vue.use(VueI18n);
/* eslint-disable */
import en from './lang/en.json';
import zh from './lang/zh.json';
import pt from './lang/pt.json';
function loadLocaleMessages() {
  const locales = require.context('@/locales/lang/', true, /[A-Za-z0-9-_,\s]+\.json$/i);
  const messages = {};
  locales.keys().forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales(key);
    }
  });
  return messages;
}

function getLocalLang() {
  let localLang = getLocal(LANG);
  if (!localLang) {
    let defaultLang = navigator.language;
    if (defaultLang) {
      // eslint-disable-next-line prefer-destructuring
      defaultLang = defaultLang.split('-')[0];
      // eslint-disable-next-line prefer-destructuring
      localLang = defaultLang.split('-')[0];
    }
    setLocal(LANG, defaultLang);
  }
  return localLang;
}
const lang = getLocalLang();
export default new VueI18n({
  locale: lang,
  fallbackLocale: lang,
  messages: {
    en: en,
    zh: zh,
    pt: pt,
  },
});
