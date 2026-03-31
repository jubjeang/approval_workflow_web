import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import Main from '../pages/MainPage.vue'

const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('access_token')
    const userStr = localStorage.getItem('user')
    if (!token || !userStr) return false

    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      return false
    }

    const user = JSON.parse(userStr)
    return !!user?.username
  } catch {
    return false
  }
}

const hasPermission = (perm) => {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) return false
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.permissions?.includes(perm) ?? false
  } catch {
    return false
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login,
    },
    {
      path: '/main',
      name: 'Main',
      component: Main,
      meta: { requiresAuth: true },
    },
    {
      path: '/approvals',
      name: 'Approvals',
      component: () => import('@/pages/ApprovalList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/approvals/test_sendmail',
      name: 'TestSendMail',
      component: () => import('@/pages/TestSendMailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/main/waiting',
      name: 'WaitingApprovals',
      component: () => import('@/pages/WaitingApprovalList.vue'),
      meta: {
        requiresAuth: true,
        requiresPermission: 'approval:approve',
      },
    },
    {
      path: '/main/history',
      name: 'ApprovalHistory',
      component: () => import('@/pages/ApprovalHistory.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/main/manual',
      name: 'UserManual',
      component: () => import('@/pages/UserManual.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/approvals/approve/:id',
      name: 'ApproveView',
      component: () => import('@/pages/ApproveView.vue'),
      meta: {
        requiresAuth: true,
        requiresPermission: 'approval:approve',
      },
    },
    {
      path: '/public/approve/:token',
      name: 'PublicApproveView',
      component: () => import('@/pages/ApproveView.vue'),
    },
    {
      path: '/forbidden',
      name: 'Forbidden',
      component: () => import('@/pages/ForbiddenView.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  const authed = isAuthenticated()

  if (to.meta?.requiresAuth && !authed) {
    return next({ path: '/', query: { redirect: to.fullPath } })
  }

  if (to.name === 'Login' && authed) {
    return next({ path: '/main' })
  }

  if (to.meta?.requiresPermission && !hasPermission(to.meta.requiresPermission)) {
    return next({ path: '/forbidden' })
  }

  return next()
})

export default router
