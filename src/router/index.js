import Vue from 'vue';
import VueRouter from 'vue-router';
import HomeView from '../views/home/index.vue';

Vue.use(VueRouter);
const { BASE_URL } = import.meta.env;

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: BASE_URL,
  routes,
});

export default router;
