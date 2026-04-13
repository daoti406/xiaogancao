<template>
  <div class="app-container" v-loading="globalLoading" element-loading-background="rgba(250, 248, 245, 0.9)">
    <!-- 顶部导航 -->
    <header class="app-header" v-if="showHeader">
      <Header />
    </header>
    <!-- 主体内容 -->
    <main class="app-main" :class="{ 'no-header': !showHeader, 'no-footer': !showFooter }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 底部 -->
    <footer class="app-footer" v-if="showFooter">
      <Footer />
    </footer>

    <!-- 移动端底部导航 -->
    <nav class="mobile-nav hide-desktop" v-if="showMobileNav">
      <MobileNav />
    </nav>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Header from './components/layout/Header.vue';
import Footer from './components/layout/Footer.vue';
import MobileNav from './components/layout/MobileNav.vue';

const route = useRoute();

// 全局 loading 状态（通过 provide/inject 或 store 管理）
const globalLoading = ref(false);

// 不显示Header的页面
const noHeaderPages = ['/auth', '/login', '/register'];
const showHeader = computed(() => !noHeaderPages.includes(route.path));

// 不显示Footer的页面
const noFooterPages = ['/auth', '/login', '/register', '/chat'];
const showFooter = computed(() => !noFooterPages.includes(route.path));

// 显示移动端导航的页面
const mobileNavPages = ['/', '/health', '/wellness', '/reminders'];
const showMobileNav = computed(() => mobileNavPages.includes(route.path));
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  z-index: var(--z-sticky);
}

.app-main {
  flex: 1;
  margin-top: var(--header-height);
  padding-bottom: var(--spacing-lg);
}

.app-main.no-header {
  margin-top: 0;
}

.app-main.no-footer {
  padding-bottom: 0;
}

.app-footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: var(--spacing-lg) 0;
}

.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--mobile-nav-height);
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  z-index: var(--z-fixed);
}

/* 页面过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .app-main {
    padding-bottom: calc(var(--mobile-nav-height) + var(--spacing-md));
  }
}
</style>
