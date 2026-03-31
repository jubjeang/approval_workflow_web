<template>
  <header class="header">
    <div class="left">
      <button
        class="toggle-btn"
        :class="{ rotated: !sidebarOpen }"
        @click="$emit('toggle-sidebar')"
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <img :src="logo" class="logo clickable" alt="GFCS" @click="goMain" />
    </div>

    <div class="right">
      <span class="username">{{ username }}</span>
      <button class="logout-btn" @click="logout">Logout</button>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import logo from '@/assets/images/gfcs_logo_green.png'

defineProps({
  username: String,
  sidebarOpen: {
    type: Boolean,
    default: true,
  },
})

const router = useRouter()

const goMain = () => {
  router.replace('/main')
}

const logout = () => {
  localStorage.clear()
  sessionStorage.clear()
  router.replace('/')
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  min-height: 64px;
  background: linear-gradient(90deg, #178f43 60%, #9be8b0);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.08);
}

.left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.toggle-btn {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: transform 0.25s ease;
}

.toggle-btn span {
  width: 22px;
  height: 2px;
  background: #ffffff;
  display: block;
  box-sizing: border-box;
}

.toggle-btn.rotated {
  transform: rotate(90deg);
}

.toggle-btn:hover {
  opacity: 0.85;
}

.logo {
  height: 38px;
}

.logo.clickable {
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.logo.clickable:hover {
  opacity: 0.9;
  transform: scale(1.03);
}

.right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username {
  color: #f1f5f2;
  font-weight: 500;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #f9fbfa;
  padding: 6px 14px;
  border-radius: 16px;
  font-weight: 600;
  cursor: pointer;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.28);
}

@media (max-width: 768px) {
  .header {
    padding: 0 14px;
  }

  .left,
  .right {
    gap: 10px;
  }

  .logo {
    height: 30px;
  }

  .username {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
  }

  .logout-btn {
    padding: 6px 10px;
  }
}

@media (max-width: 560px) {
  .username {
    display: none;
  }
}
</style>
