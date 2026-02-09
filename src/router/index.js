// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import Main from '../pages/MainPage.vue'

// import Report from '../views/ReportPage.vue'

// --- ตรวจสถานะล็อกอินแบบเข้ม ---
const isAuthenticated = () => {
  try {
    const token =
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('authToken') ||
      null

    const userStr =
      localStorage.getItem('user') ||
      sessionStorage.getItem('user') ||
      null

    if (!token || !userStr) return false
    if (!token.startsWith('ok.')) return false

    const user = JSON.parse(userStr)
    if (!user || !user.username) return false

    // ดึง username จาก token โดย "ตัดหลังจุดตัวที่สอง"
    // รูปแบบ token: ok.<ts>.<username-possibly-with-dots>
    const firstDot = token.indexOf('.')
    if (firstDot === -1) return false
    const secondDot = token.indexOf('.', firstDot + 1)
    if (secondDot === -1) return false
    const encodedUserInToken = token.slice(secondDot + 1) // ส่วนที่เหลือทั้งหมดคือ username (อาจมี '.')
    const uFromToken = decodeURIComponent(encodedUserInToken)

    if (!uFromToken || uFromToken !== String(user.username)) return false
    return true
  } catch {
    return false
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Login', component: Login },
    { path: '/main', name: 'Main', component: Main, meta: { requiresAuth: true } },   
    // { path: '/report', name: 'Report', component: Report, meta: { requiresAuth: true } },
    // { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior () { return { top: 0 } }
})

// ===== Global Route Guard =====
router.beforeEach((to, from, next) => {
  const authed = isAuthenticated()

  if (to.meta?.requiresAuth && !authed) {
    return next({ path: '/', query: { redirect: to.fullPath } })
  }
  if (to.name === 'Login' && authed) {
    return next({ path: '/main' })
  }
  return next()
})

export default router
