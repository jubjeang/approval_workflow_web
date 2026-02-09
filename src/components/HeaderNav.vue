<template>
  <header class="header">
    <div class="left">
      <!-- Hamburger -->
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

      <img :src="logo" class="logo" alt="GFCS" />
    </div>

    <div class="right">
      <span class="username">
        {{ username }}
      </span>

      <button class="logout-btn" @click="$emit('logout')">Logout</button>
    </div>
  </header>
</template>

<script setup>
import logo from '@/assets/images/gfcs_logo_green.png'

defineProps({
  username: String,
  sidebarOpen: {
    type: Boolean,
    default: true,
  },
})
</script>

<style scoped>
/* ===== Header ===== */
.header {
  height: 64px;
  background: linear-gradient(90deg, #178f43 60%, #9be8b0);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

/* ===== Left ===== */
.left {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* ===== Hamburger ===== */
.toggle-btn {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;

  display: flex;
  flex-direction: column;
  align-items: center; /* ⭐ center ทุกเส้น */
  justify-content: center;
  gap: 4px;

  transition: transform 0.25s ease;
}

/* เส้น */
.toggle-btn span {
  width: 22px; /* ⭐ fix เท่ากันทุกเส้น */
  height: 2px;
  background: #ffffff;
  display: block;
  box-sizing: border-box;
}

/* หมุนตอน sidebar ซ่อน */
.toggle-btn.rotated {
  transform: rotate(90deg);
}

.toggle-btn:hover {
  opacity: 0.85;
}

/* Logo */
.logo {
  height: 38px;
}

/* ===== Right ===== */
.right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Username (ไม่ใช้สีขาวแล้ว) */
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
</style>
