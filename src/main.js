import {createApp} from 'vue';
import App from './App.vue';
import router from './router';// loads from src/router/index.js

import './assets/main.css'
import './assets/patterns.css'
import './assets/slider.css'

createApp(App).use(router).mount('#app');
