import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import ErrorBoundary from '@/components/errorBoundary/ErrorBoundary.vue'
import Title from '@/components/title/Title.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

app.config.errorHandler = (err, vm, info) => {
  console.error('Global Error Handler:', { err, vm, info })
}
app.component('ErrorBoundary', ErrorBoundary)
app.component('Title', Title)
