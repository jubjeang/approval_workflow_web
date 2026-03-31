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
      <main class="content" :class="{ expanded: !isSidebarOpen }">
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

const isSidebarOpen = ref(true)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const logout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('authToken')
  localStorage.removeItem('access_token')
  router.replace('/')
}
</script>

<style scoped>
.layout {
  --app-header-height: 64px;
  --app-sidebar-width: 220px;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: var(--app-header-height);
}

.body {
  flex: 1;
  min-height: 0;
  height: calc(100dvh - var(--app-header-height));
  position: relative;
}

.content {
  height: 100%;
  min-width: 0;
  min-height: 0;
  width: calc(100% - var(--app-sidebar-width));
  margin-left: var(--app-sidebar-width);
  overflow: auto;
  padding: clamp(16px, 2vw, 24px);
  box-sizing: border-box;
  background: #fff;
  transition: margin-left 0.25s ease;
  overscroll-behavior: contain;
}

.content.expanded {
  margin-left: 0;
  width: 100%;
}

@media (max-width: 900px) {
  .layout {
    --app-sidebar-width: 0px;
  }

  .content {
    width: 100%;
    margin-left: 0;
    padding: 16px;
  }
}
</style>
