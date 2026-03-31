// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import axios from 'axios'
import { useAuthStore } from './stores/auth'
import './assets/styles/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

// ✅ restore JWT header ทุกครั้งที่ refresh
const auth = useAuthStore()
auth.init()

// ✅ 401 interceptor → logout อัตโนมัติ
axios.interceptors.response.use(
  res => res,
  err => {
    if (err?.response?.status === 401) {
      auth.clearAuth()
      router.replace('/')
    }
    return Promise.reject(err)
  }
)

app.mount('#app')