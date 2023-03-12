import { createApp } from 'vue'
import App from './App.vue';
import router from './router';
import CircularCountDownTimer from "vue-circular-count-down-timer";

const app = createApp(App)

app.use(CircularCountDownTimer);
app.use(router)

app.mount('#app')
