import Vue from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios'
import ViewUI from 'view-design';
import VueClipboard from 'vue-clipboard2'
import svgIcon from '@/components/svgIcon/index.js';
import 'view-design/dist/styles/iview.css';
import '@/assets/fonts/font.css';
import i18n from "./i18n";
import ptBR from 'view-design/dist/locale/pt-BR';
import enUS from 'view-design/dist/locale/pt-BR';
import zhCN from 'view-design/dist/locale/pt-BR';

const LANGMAP = {
  'ch': zhCN,
  'pt': ptBR,
  'en': enUS
}

Vue.use(ViewUI, { locale: LANGMAP[i18n.locale] || zhCN });
Vue.use(VueClipboard);
Vue.use(svgIcon);

Vue.prototype.$http = axios
Vue.config.productionTip = false;

new Vue({
  router,
  i18n,
  render: (h) => h(App),
}).$mount('#app');
