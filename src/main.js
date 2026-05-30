import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import 'vue3-toastify/dist/index.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
