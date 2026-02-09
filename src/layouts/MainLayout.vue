<template>
  <div class="layout">
    <HeaderNav
      :username="username"
      :sidebar-open="isSidebarOpen"
      @toggle-sidebar="toggleSidebar"
      @logout="logout"
    />

    <div class="body">
      <SideMenu :open="isSidebarOpen" />
      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import HeaderNav from '@/components/HeaderNav.vue'
import SideMenu from '@/components/SideMenu.vue'

const router = useRouter()

const user = JSON.parse(localStorage.getItem('user') || '{}')
const username = user.username || ''

/* ===== Sidebar State ===== */
const isSidebarOpen = ref(true)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

/* ===== Logout (ของเดิม ไม่แตะ) ===== */
const logout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('authToken')
  router.replace('/')
}
</script>

<style scoped>
.layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ===== Body ===== */
.body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ===== Content ===== */
.content {
  flex: 1;
  padding: 24px;
  background: #fff;
  transition: margin-left 0.3s ease;
}

/* ตอน sidebar ถูกซ่อน */
.content.expanded {
  margin-left: 0;
}
</style>
