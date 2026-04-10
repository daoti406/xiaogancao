<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <img src="@/assets/icons/herb-icon.svg" class="error-icon" alt="" />
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>您访问的页面不存在或已被移除</p>
      <div class="actions">
        <el-button type="primary" @click="goHome">返回首页</el-button>
        <el-button @click="goBack">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.not-found-page {
  min-height: calc(100vh - var(--header-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
}

.not-found-content {
  text-align: center;
}

.error-icon {
  width: 80px;
  height: 80px;
  margin-bottom: var(--spacing-lg);
  opacity: 0.6;
}

h1 {
  font-size: 72px;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

h2 {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-sm);
}

p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
}

.actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}
</style>
