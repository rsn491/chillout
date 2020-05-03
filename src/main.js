import Vue from 'vue'
import App from './App.vue'

import CircularCountDownTimer from "vue-circular-count-down-timer";

Vue.use(CircularCountDownTimer);
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
