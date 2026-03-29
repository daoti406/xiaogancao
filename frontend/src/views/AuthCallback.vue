<template>
  <div class="auth-callback-page">
    <div class="loading-container">
      <el-icon class="loading-icon" :size="48"><Loading /></el-icon>
      <p>{{ statusText }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Loading } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const statusText = ref('正在处理登录...');

onMounted(async () => {
  const { token, error, error_description } = route.query;

  if (error) {
    statusText.value = error_description || '登录失败';
    ElMessage.error(error_description || '登录失败');
    setTimeout(() => {
      router.push('/auth');
    }, 2000);
    return;
  }

  if (token) {
    statusText.value = '登录成功，正在跳转...';
    authStore.handleOAuthSuccess(token);
    
    // 获取用户信息
    try {
      await authStore.fetchCurrentUser();
      ElMessage.success('登录成功');
      
      const redirect = route.query.redirect || '/';
      router.push(redirect);
    } catch (err) {
      statusText.value = '获取用户信息失败';
      ElMessage.error('登录失败，请重试');
      setTimeout(() => {
        router.push('/auth');
      }, 2000);
    }
  } else {
    statusText.value = '无效的登录响应';
    setTimeout(() => {
      router.push('/auth');
    }, 2000);
  }
});
</script>

<style scoped>
.auth-callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container {
  text-align: center;
}

.loading-icon {
  color: var(--primary-color);
  margin-bottom: var(--spacing-lg);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

p {
  color: var(--text-secondary);
}
</style>
