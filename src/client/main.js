import Vue from 'vue';
import App from './App.vue';
import router from './router';

import CircularCountDownTimer from "vue-circular-count-down-timer";

Vue.use(CircularCountDownTimer);
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');