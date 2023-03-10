import Vue from 'vue';
import axios from 'axios';
import ViewUI from 'view-design';
import VueClipboard from 'vue-clipboard2';
import VueLazyload from 'vue-lazyload';
// import svgIcon from '@/components/svgIcon/index';
import 'view-design/dist/styles/iview.css';
import '@/assets/fonts/font.css';

import enUS from 'view-design/dist/locale/en-US';
import zhCN from 'view-design/dist/locale/zh-CN';
import ptBR from 'view-design/dist/locale/pt-BR';
import i18n from './locales/i18n';
import router from './router';

import App from './App.vue';

const LANGMAP = {
  zh: zhCN,
  en: enUS,
  pt: ptBR,
};

Vue.use(ViewUI, { locale: LANGMAP[i18n.locale] || zhCN });
Vue.use(VueClipboard);
Vue.use(VueLazyload);
// Vue.use(svgIcon);

Vue.prototype.$http = axios;
Vue.config.productionTip = false;

new Vue({
  i18n,
  router,
  render: (h) => h(App),
}).$mount('#app');
