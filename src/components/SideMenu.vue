<template>
  <aside class="side-menu" :class="{ closed: !open }">
    <nav v-if="open">
      <div
        v-for="menu in visibleMenus"
        :key="menu.path"
        class="menu-item"
        :class="{ active: isActive(menu.path) }"
        @click="go(menu.path)"
      >
        <span class="menu-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path :d="menu.icon" />
          </svg>
        </span>
        <span class="menu-label">{{ menu.label }}</span>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps({
  open: {
    type: Boolean,
    default: true,
  },
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const baseMenus = [
  {
    label: 'Approval Requests',
    path: '/approvals',
    icon: 'M5 5h4v4H5V5zm5 0h4v4h-4V5zm5 0h4v4h-4V5zM5 10h4v4H5v-4zm5 0h4v4h-4v-4zm5 0h4v4h-4v-4zM5 15h4v4H5v-4zm5 0h4v4h-4v-4zm5 0h4v4h-4v-4z',
    hidden: () => authStore.can('approval:approve'),
  },
  {
    label: 'Pending Approvals',
    path: '/main/waiting',
    icon: 'M12 3.75A8.25 8.25 0 1 0 20.25 12 8.26 8.26 0 0 0 12 3.75zm0 1.5A6.75 6.75 0 1 1 5.25 12 6.76 6.76 0 0 1 12 5.25zm.75 2.5h-1.5V12a.75.75 0 0 0 .75.75H16v-1.5h-3.25V7.75z',
    hidden: () => authStore.hasRole('Requester'),
  },
  {
    label: 'Approval History',
    path: '/main/history',
    icon: 'M12 3.75A8.25 8.25 0 1 0 20.25 12h-1.5A6.75 6.75 0 1 1 12 5.25v3l4-2.5-4-2.5v1.5zm.75 4h-1.5V12c0 .41.34.75.75.75H16v-1.5h-3.25v-3.5z',
    hidden: () => false,
  },
  {
    label: 'User Manual',
    path: '/main/manual',
    icon: 'M7 4.5h8.25A2.75 2.75 0 0 1 18 7.25v11a.75.75 0 0 1-1.09.67 4.42 4.42 0 0 0-2.01-.42H7A2.75 2.75 0 0 1 4.25 15.75V7.25A2.75 2.75 0 0 1 7 4.5zm0 1.5c-.69 0-1.25.56-1.25 1.25v8.5c0 .69.56 1.25 1.25 1.25h7.47c.69 0 1.35.13 2.03.4V7.25c0-.69-.56-1.25-1.25-1.25H7zm1.5 2h6v1.5h-6V8zm0 3h6v1.5h-6V11z',
    hidden: () => false,
  },
]

const visibleMenus = computed(() => baseMenus.filter((menu) => !menu.hidden()))

const isActive = (path) => route.path.startsWith(path)
const go = (path) => router.push(path)
</script>

<style scoped>
.side-menu {
  width: 220px;
  background: #e9f6ee;
  padding-top: 20px;
  transition: width 0.25s ease;
  flex-shrink: 0;
  overflow: auto;
  position: fixed;
  top: 64px;
  left: 0;
  bottom: 0;
  z-index: 30;
  height: auto;
}

.side-menu.closed {
  width: 0;
  padding: 0;
  overflow: hidden;
}

.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 48px;
  padding: 12px 22px;
  cursor: pointer;
  color: #1f5130;
  font-weight: 600;
  background: transparent;
  border: 0;
  border-radius: 0;
  transition: background 0.2s ease, color 0.2s ease;
}

.menu-item::after {
  content: '';
  position: absolute;
  left: 68px;
  bottom: 6px;
  width: calc(100% - 94px);
  height: 1px;
  background: rgba(31, 81, 48, 0.25);
  transition: all 0.25s ease;
}

.menu-item:hover {
  background: #d6efdf;
}

.menu-item:hover::after {
  background: rgba(31, 81, 48, 0.5);
  height: 2px;
}

.menu-item.active {
  background: #cfeedd;
  color: #145c35;
}

.menu-item.active::after {
  background: #178f43;
  height: 2px;
}

.menu-icon {
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1a8f45;
  line-height: 1;
}

.menu-icon svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.menu-label {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
  font-size: 16px;
  font-weight: 600;
}

@media (max-width: 900px) {
  .side-menu {
    position: fixed;
    top: 64px;
    left: 0;
    bottom: 0;
    width: min(78vw, 300px);
    z-index: 40;
    box-shadow: 0 18px 36px rgba(0, 0, 0, 0.12);
    transition: transform 0.25s ease;
  }

  .side-menu.closed {
    width: min(78vw, 300px);
    padding-top: 20px;
    overflow: auto;
    transform: translateX(-100%);
  }
}

@media (max-width: 640px) {
  .menu-item {
    min-height: 46px;
    padding: 11px 20px;
    gap: 12px;
  }

  .menu-item::after {
    left: 62px;
    width: calc(100% - 84px);
  }

  .menu-icon {
    flex-basis: 18px;
    width: 18px;
    height: 18px;
  }

  .menu-icon svg {
    width: 18px;
    height: 18px;
  }

  .menu-label {
    font-size: 15px;
  }
}
</style>
