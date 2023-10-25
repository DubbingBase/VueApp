import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import PrimeVue from 'primevue/config';

import { router } from './router/router'

import 'primevue/resources/themes/lara-dark-blue/theme.css'
import 'primeicons/primeicons.css'

createApp(App)
    .use(router)
    .use(PrimeVue)
    .mount('#app')
