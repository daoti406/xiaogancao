<template>
  <div class="health-profile-page">
    <div class="page-header">
      <h1>健康档案</h1>
      <p>您的个人健康信息概览</p>
    </div>

    <!-- 用户信息卡 -->
    <div class="user-card">
      <div class="user-avatar">
        <el-avatar :size="80" :src="authStore.userAvatar">
          {{ authStore.userName?.charAt(0) }}
        </el-avatar>
      </div>
      <div class="user-info">
        <h2>{{ authStore.userName }}</h2>
        <p>{{ authStore.user?.email }}</p>
        <div class="user-badge" v-if="profile?.constitution">
          <span class="badge-icon">{{ constitutionIcon }}</span>
          <span class="badge-text">{{ profile.constitution }}</span>
        </div>
      </div>
      <el-button @click="editProfile">编辑资料</el-button>
    </div>

    <!-- 统计概览 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">💬</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalChats }}</div>
          <div class="stat-label">问诊次数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.constitutionRecords }}</div>
          <div class="stat-label">体质检测</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🍵</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.hasPlan ? '1' : '0' }}</div>
          <div class="stat-label">养生方案</div>
        </div>
      </div>
    </div>

    <!-- 体质报告 -->
    <div class="section" v-if="profile?.constitution">
      <div class="section-header">
        <h3>体质报告</h3>
        <el-button text @click="goToReport">查看详情</el-button>
      </div>
      <div class="constitution-summary">
        <RadarChart :scores="profile.constitution_scores" height="250px" />
      </div>
    </div>

    <!-- 最近对话 -->
    <div class="section">
      <div class="section-header">
        <h3>最近对话</h3>
        <el-button text @click="goToChat">查看全部</el-button>
      </div>
      <div class="session-list">
        <div 
          v-for="session in recentSessions" 
          :key="session.id"
          class="session-item"
          @click="goToSession(session.id)"
        >
          <div class="session-icon">💬</div>
          <div class="session-info">
            <div class="session-title">{{ session.title || '新对话' }}</div>
            <div class="session-time">{{ formatDate(session.updated_at) }}</div>
          </div>
        </div>
        <div class="empty-hint" v-if="recentSessions.length === 0">
          暂无对话记录
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { CONSTITUTION_INFO } from '@/data/quizQuestions';
import RadarChart from '@/components/constitution/RadarChart.vue';
import request from '@/api/request';

const router = useRouter();
const authStore = useAuthStore();

const profile = ref(null);
const recentSessions = ref([]);
const stats = ref({
  totalChats: 0,
  constitutionRecords: 0,
  hasPlan: false
});

const constitutionIcon = computed(() => 
  CONSTITUTION_INFO[profile.value?.constitution]?.icon || '✨'
);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const fetchDashboard = async () => {
  try {
    const res = await request.get('/health/dashboard');
    profile.value = res.data.user;
    recentSessions.value = res.data.recentSessions || [];
    stats.value = res.data.stats || stats.value;
  } catch (err) {
    console.error('获取仪表盘数据失败:', err);
  }
};

const editProfile = () => {
  // TODO: 实现编辑资料功能
};

const goToReport = () => {
  router.push('/constitution/report');
};

const goToChat = () => {
  router.push('/chat');
};

const goToSession = (sessionId) => {
  router.push(`/chat/${sessionId}`);
};

onMounted(() => {
  fetchDashboard();
});
</script>

<style scoped>
.health-profile-page {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.page-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.page-header h1 {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-sm);
}

.user-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  background: var(--bg-card);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-lg);
}

.user-avatar {
  flex-shrink: 0;
}

.user-avatar :deep(.el-avatar) {
  background: var(--primary-color);
  color: white;
  font-size: 32px;
}

.user-info {
  flex: 1;
}

.user-info h2 {
  margin-bottom: var(--spacing-xs);
}

.user-info p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.user-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: var(--primary-lighter);
  color: var(--primary-color);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--bg-card);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
}

.stat-icon {
  font-size: 32px;
}

.stat-number {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--primary-color);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.section {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-header h3 {
  font-size: var(--font-size-lg);
}

.constitution-summary {
  display: flex;
  justify-content: center;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.session-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.session-item:hover {
  background: var(--bg-primary);
}

.session-icon {
  font-size: 24px;
}

.session-info {
  flex: 1;
}

.session-title {
  font-weight: 500;
  margin-bottom: 2px;
}

.session-time {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.empty-hint {
  text-align: center;
  color: var(--text-tertiary);
  padding: var(--spacing-lg);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
