import {createRouter, createWebHistory} from 'vue-router';
import Home from './views/Home.vue';
import Room from './views/Room.vue';

export default createRouter({
  base: process.env.BASE_URL,
  history: createWebHistory(),
  routes: [
    {
      path: '/room',
      component: Room,
    },
    {
      path: '/',
      component: Home,
    },
  ],
});
