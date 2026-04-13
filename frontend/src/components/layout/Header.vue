<template>
  <header class="header">
    <div class="header-container">
      <!-- Logo -->
      <div class="header-logo" @click="goHome">
        <img :src="logoSrc" alt="小甘草" class="logo-img" />
        <span class="logo-text"></span>
      </div>
      <!-- 导航菜单（桌面端） -->
      <nav class="header-nav hide-mobile">
        <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
          <img :src="iconHome" class="nav-icon" alt="首页" />
          <span>首页</span>
        </router-link>
        <router-link to="/constitution" class="nav-item" :class="{ active: $route.path.includes('/constitution') }">
          <img :src="iconConstitution" class="nav-icon" alt="体质" />
          <span>体质辨识</span>
        </router-link>
        <router-link to="/chat" class="nav-item" :class="{ active: $route.path === '/chat' }">
          <img :src="iconChat" class="nav-icon" alt="问诊" />
          <span>智能问诊</span>
        </router-link>
        <router-link to="/community" class="nav-item" :class="{ active: $route.path.includes('/community') }">
          <img :src="iconCommunity" class="nav-icon" alt="社区" />
          <span>养生社区</span>
        </router-link>
        <router-link to="/wellness" class="nav-item" :class="{ active: $route.path === '/wellness' }">
          <img :src="iconWellness" class="nav-icon" alt="养生" />
          <span>养生方案</span>
        </router-link>
        <router-link to="/health" class="nav-item" :class="{ active: $route.path === '/health' }">
          <img :src="iconProfile" class="nav-icon" alt="我的" />
          <span>健康档案</span>
        </router-link>
      </nav>
      <!-- 用户区域 -->
      <div class="header-user">
        <template v-if="authStore.isLoggedIn">
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-avatar">
              <el-avatar :size="32" :src="authStore.userAvatar" class="avatar">
                {{ authStore.userName?.charAt(0) }}
              </el-avatar>
              <span class="user-name hide-mobile">{{ authStore.userName }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人档案
                </el-dropdown-item>
                <el-dropdown-item command="community">
                  <el-icon><ChatDotRound /></el-icon>
                  养生社区
                </el-dropdown-item>
                <el-dropdown-item command="wellness">
                  <el-icon><Document /></el-icon>
                  养生方案
                </el-dropdown-item>
                <el-dropdown-item command="reminders">
                  <el-icon><Bell /></el-icon>
                  提醒设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" @click="goLogin" class="login-btn">
            登录 / 注册
          </el-button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { User, Document, Bell, SwitchButton, ChatDotRound } from '@element-plus/icons-vue';

// 图标导入
import logoSrc from '@/assets/title-logo.png';
import iconHome from '@/assets/icons/gouqi.svg'; // 枸杞 - 首页
import iconConstitution from '@/assets/icons/renshen.svg'; // 人参 - 体质辨识
import iconChat from '@/assets/icons/gancao.svg'; // 甘草 - 智能问诊
import iconCommunity from '@/assets/icons/chat.svg'; // 聊天 - 养生社区
import iconWellness from '@/assets/icons/fuling.svg'; // 茯苓 - 养生方案
import iconProfile from '@/assets/icons/herb-icon.svg'; // 草药 - 健康档案

const router = useRouter();
const authStore = useAuthStore();

const goHome = () => {
  if (router.currentRoute.value.path !== '/') {
    router.push('/').catch(() => {});
  }
};

const goLogin = () => {
  router.push('/auth');
};

const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/health');
      break;
    case 'community':
      router.push('/community');
      break;
    case 'wellness':
      router.push('/wellness');
      break;
    case 'reminders':
      router.push('/reminders');
      break;
    case 'logout':
      await authStore.logout();
      router.push('/');
      break;
  }
};
</script>

<style scoped>
.header {
  height: var(--header-height);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
}

.header-container {
  max-width: var(--content-max-width);
  height: 100%;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.header-logo:hover {
  opacity: 0.8;
}

.logo-img {
  height: 32px;
  width: auto;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--primary-color);
}

.header-nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
  font-size: var(--font-size-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  position: relative;
  transition: all var(--transition-fast);
}

.nav-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.nav-item:hover,
.nav-item.active {
  color: var(--primary-color);
  background: var(--bg-secondary);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary-color);
  border-radius: var(--radius-full);
}

.header-user {
  display: flex;
  align-items: center;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  transition: background var(--transition-fast);
}

.user-avatar:hover {
  background: var(--bg-secondary);
}

.avatar {
  background: var(--primary-color);
  color: white;
}

.user-name {
  font-size: var(--font-size-md);
  color: var(--text-primary);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.login-btn {
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 var(--spacing-md);
  }

  .logo-text {
    font-size: var(--font-size-lg);
  }
}
</style>
