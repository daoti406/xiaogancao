<template>
  <nav class="mobile-nav">
    <router-link
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="nav-item"
      :class="{ active: isActive(item.path) }"
    >
      <img :src="item.icon" class="nav-icon-img" :alt="item.label" />
      <span class="nav-label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router';
import iconHome from '@/assets/icons/home.svg';
import iconGancao from '@/assets/icons/gancao.svg';
import iconFuling from '@/assets/icons/fuling.svg';
import iconGouqi from '@/assets/icons/gouqi.svg';
import iconRenshen from '@/assets/icons/renshen.svg';

const route = useRoute();

// 使用中草药图标的新版导航
const navItems = [
  { path: '/', icon: iconHome, label: '小憩' },
  { path: '/constitution', icon: iconGancao, label: '识己' },
  { path: '/chat', icon: iconFuling, label: '问安' },
  { path: '/community', icon: iconHome, label: '社区' },
  { path: '/wellness', icon: iconGouqi, label: '养身' },
  { path: '/health', icon: iconRenshen, label: '吾斋' }
];

const isActive = (path) => {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path);
};
</script>

<style scoped>
.mobile-nav {
  display: none;
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  padding: var(--spacing-sm) 0;
  padding-bottom: calc(var(--spacing-sm) + env(safe-area-inset-bottom));
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--spacing-xs) 0;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  transition: color var(--transition-fast);
}

.nav-item.active {
  color: var(--primary-color);
}

.nav-icon-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.nav-icon {
  font-size: 20px;
}

.nav-label {
  font-weight: 500;
}

@media (max-width: 768px) {
  .mobile-nav {
    display: flex;
  }
}
</style>
