<template>
  <aside class="side-menu" :class="{ closed: !open }">
    <nav v-if="open">
      <div
        v-for="m in menus"
        :key="m.path"
        class="menu-item"
        :class="{ active: isActive(m.path) }"
        @click="go(m.path)"
      >
        {{ m.label }}
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

defineProps({
  open: {
    type: Boolean,
    default: true,
  },
})

const route = useRoute()
const router = useRouter()

const menus = [
  { label: 'รายการขออนุมัติ', path: '/main/pending' },
  { label: 'รายการที่รออนุมัติ', path: '/main/waiting' },
  { label: 'ประวัติการอนุมัติ', path: '/main/history' },
  { label: 'คู่มือการใช้งาน', path: '/main/manual' },
]

const isActive = (path) => route.path.startsWith(path)
const go = (path) => router.push(path)
</script>

<style scoped>
/* ===== Sidebar ===== */
.side-menu {
  width: 240px;
  background: #e9f6ee;
  padding-top: 20px;
  transition: width 0.25s ease;
}

/* ปิด = หายสนิท */
.side-menu.closed {
  width: 0;
  padding: 0;
  overflow: hidden;
}

/* ===== Menu Item ===== */
.menu-item {
  position: relative; /* ⭐ สำคัญสำหรับเส้น */
  padding: 14px 24px;
  cursor: pointer;
  color: #1f5130;
  font-weight: 600;
  transition: background 0.2s ease, color 0.2s ease;
}

/* ----- เส้นขีดใต้เมนู ----- */
.menu-item::after {
  content: '';
  position: absolute;
  left: 24px;
  bottom: 6px;
  width: calc(100% - 48px);
  height: 1px;
  background: rgba(31, 81, 48, 0.25); /* เขียวอ่อน */
  transition: all 0.25s ease;
}

/* Hover */
.menu-item:hover {
  background: #d6efdf;
}

.menu-item:hover::after {
  background: rgba(31, 81, 48, 0.5);
  height: 2px;
}

/* Active */
.menu-item.active {
  background: #178f43;
  color: #ffffff;
}

.menu-item.active::after {
  background: rgba(255, 255, 255, 0.85); /* เส้นสีขาว */
  height: 2px;
}
</style>
