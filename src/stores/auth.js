// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
    const access_token = ref(
        localStorage.getItem('access_token') || localStorage.getItem('authToken') || null
    )

    const isLoggedIn = computed(() => !!access_token.value)
    const permissions = computed(() => user.value?.permissions || [])
    const roles = computed(() => user.value?.roles || [])

    const can = (perm) => permissions.value.includes(perm)
    const hasRole = (role) => roles.value.includes(role)

    const setAuth = (userData, token) => {
        user.value = userData
        access_token.value = token
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('access_token', token)
        localStorage.setItem('authToken', token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }

    const clearAuth = () => {
        user.value = null
        access_token.value = null
        localStorage.removeItem('user')
        localStorage.removeItem('access_token')
        localStorage.removeItem('authToken')
        delete axios.defaults.headers.common['Authorization']
    }

    const init = () => {
        if (!access_token.value) return
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token.value}`
    }

    return {
        user, access_token, isLoggedIn, permissions, roles,
        can, hasRole, setAuth, clearAuth, init
    }
})
