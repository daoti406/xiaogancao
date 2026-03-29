<template>
  <div class="main-layout">
    <Header />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <Footer />
    <MobileNav class="hide-desktop" />
  </div>
</template>

<script setup>
import Header from './Header.vue';
import Footer from './Footer.vue';
import MobileNav from './MobileNav.vue';
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  margin-top: var(--header-height);
  padding-bottom: var(--spacing-xl);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .main-content {
    padding-bottom: calc(var(--mobile-nav-height) + var(--spacing-md));
  }
}
</style>
