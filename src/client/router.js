import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Room from './views/Room.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/room',
      name: 'room',
      component: Room,
    },
    {
      path: '/room/:roomId',
      name: 'room',
      component: Room,
    },
  ],
});