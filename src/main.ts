import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Detect if we're on admin.html and redirect to /admin route
router.isReady().then(() => {
  if (window.location.pathname.includes('admin.html') && router.currentRoute.value.path !== '/admin') {
    router.replace('/admin')
  }
})

app.mount('#app')
