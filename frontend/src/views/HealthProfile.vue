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
        <img src="@/assets/icons/chat-icon.svg" class="stat-icon" alt="问诊" />
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalChats }}</div>
          <div class="stat-label">问诊次数</div>
        </div>
      </div>
      <div class="stat-card">
        <img src="@/assets/icons/constitution.svg" class="stat-icon" alt="体质检测" />
        <div class="stat-content">
          <div class="stat-number">{{ stats.constitutionRecords }}</div>
          <div class="stat-label">体质检测</div>
        </div>
      </div>
      <div class="stat-card">
        <img src="@/assets/icons/wellness.svg" class="stat-icon" alt="养生方案" />
        <div class="stat-content">
          <div class="stat-number">{{ stats.hasPlan ? '1' : '0' }}</div>
          <div class="stat-label">养生方案</div>
        </div>
      </div>
      <div class="stat-card">
        <img src="@/assets/icons/diet-icon.svg" class="stat-icon" alt="健康记录" />
        <div class="stat-content">
          <div class="stat-number">{{ stats.healthRecords }}</div>
          <div class="stat-label">健康记录</div>
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

    <!-- 健康指标 -->
    <div class="section">
      <div class="section-header">
        <h3>健康指标</h3>
        <el-button text @click="addHealthRecord">添加记录</el-button>
      </div>
      <div class="health-metrics">
        <div class="metric-card" v-for="metric in healthMetrics" :key="metric.type">
          <div class="metric-header">
            <img :src="metric.icon" class="metric-icon" alt="" />
            <h4>{{ metric.name }}</h4>
          </div>
          <div class="metric-value">{{ metric.value }}</div>
          <div class="metric-date">{{ metric.date }}</div>
        </div>
      </div>
    </div>

    <!-- 用药记录 -->
    <div class="section">
      <div class="section-header">
        <h3>用药记录</h3>
        <el-button text @click="addMedication">添加记录</el-button>
      </div>
      <div class="medication-list">
        <div class="medication-item" v-for="med in medications" :key="med.id">
          <div class="medication-info">
            <div class="medication-name">{{ med.name }}</div>
            <div class="medication-dosage">{{ med.dosage }}</div>
          </div>
          <div class="medication-period">{{ med.startDate }} 至 {{ med.endDate }}</div>
        </div>
        <div class="empty-hint" v-if="medications.length === 0">
          暂无用药记录
        </div>
      </div>
    </div>

    <!-- 生活习惯 -->
    <div class="section">
      <div class="section-header">
        <h3>生活习惯</h3>
        <el-button text @click="editLifestyle">编辑</el-button>
      </div>
      <div class="lifestyle-grid">
        <div class="lifestyle-item">
          <img src="@/assets/icons/exercise-icon.svg" class="lifestyle-icon" alt="" />
          <div class="lifestyle-content">
            <h4>运动</h4>
            <p>{{ lifestyle.exercise }}</p>
          </div>
        </div>
        <div class="lifestyle-item">
          <img src="@/assets/icons/diet-icon.svg" class="lifestyle-icon" alt="" />
          <div class="lifestyle-content">
            <h4>饮食</h4>
            <p>{{ lifestyle.diet }}</p>
          </div>
        </div>
        <div class="lifestyle-item">
          <img src="@/assets/icons/sleep-icon.svg" class="lifestyle-icon" alt="" />
          <div class="lifestyle-content">
            <h4>睡眠</h4>
            <p>{{ lifestyle.sleep }}</p>
          </div>
        </div>
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
          <img src="@/assets/icons/chat.svg" class="session-icon" alt="对话" />
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
  hasPlan: false,
  healthRecords: 0
});

// 健康指标数据
const healthMetrics = ref([
  {
    type: 'blood_pressure',
    name: '血压',
    value: '120/80 mmHg',
    date: '2024-01-01',
    icon: new URL('@/assets/icons/water-icon.svg', import.meta.url).href
  },
  {
    type: 'blood_sugar',
    name: '血糖',
    value: '5.6 mmol/L',
    date: '2024-01-01',
    icon: new URL('@/assets/icons/water-icon.svg', import.meta.url).href
  },
  {
    type: 'weight',
    name: '体重',
    value: '65 kg',
    date: '2024-01-01',
    icon: new URL('@/assets/icons/exercise-icon.svg', import.meta.url).href
  }
]);

// 用药记录
const medications = ref([
  {
    id: 1,
    name: '板蓝根颗粒',
    dosage: '一次1袋，一日3次',
    startDate: '2024-01-01',
    endDate: '2024-01-07'
  }
]);

// 生活习惯
const lifestyle = ref({
  exercise: '每周3次，每次30分钟',
  diet: '清淡饮食，多吃蔬菜水果',
  sleep: '每天7-8小时'
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
    const res = await request.get('/wellness/dashboard');
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

const addHealthRecord = () => {
  // TODO: 实现添加健康记录功能
};

const addMedication = () => {
  // TODO: 实现添加用药记录功能
};

const editLifestyle = () => {
  // TODO: 实现编辑生活习惯功能
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
  try {
    fetchDashboard();
  } catch (err) {
    console.error('获取仪表盘数据失败:', err);
  }
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
  width: 32px;
  height: 32px;
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
  width: 24px;
  height: 24px;
  object-fit: contain;
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

/* 健康指标样式 */
.health-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.metric-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  text-align: center;
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.metric-icon {
  width: 24px;
  height: 24px;
}

.metric-value {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: var(--spacing-xs);
}

.metric-date {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

/* 用药记录样式 */
.medication-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.medication-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.medication-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.medication-dosage {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.medication-period {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  white-space: nowrap;
}

/* 生活习惯样式 */
.lifestyle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.lifestyle-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.lifestyle-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.lifestyle-content h4 {
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-md);
}

.lifestyle-content p {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .health-metrics {
    grid-template-columns: 1fr;
  }
  
  .lifestyle-grid {
    grid-template-columns: 1fr;
  }
  
  .medication-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .medication-period {
    align-self: flex-end;
  }
}
</style>
