import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import PrimeVue from 'primevue/config';

import { router } from './router/router'

import 'primeicons/primeicons.css'
import Lara from '@primevue/themes/lara';

createApp(App)
    .use(router)
    .use(PrimeVue, {
        theme: {
            preset: Lara,
            options: {
                prefix: 'p',
                darkModeSelector: 'system',
                cssLayer: false
            }
        }
    })
    .mount('#app')
