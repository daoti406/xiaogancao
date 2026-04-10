<template>
  <div class="wellness-plan-page">
    <!-- 顶部横幅 -->
    <div class="page-header">
      <div class="header-content">
        <h1>今日养生任务</h1>
        <p v-if="plan">针对你的{{ plan.constitution }}体质定制的每日任务</p>
        <p v-else>完成体质辨识后，为你定制专属方案</p>
      </div>
      <!-- 连续打卡天数 -->
      <div class="streak-badge" v-if="streakDays > 0">
        <span class="streak-icon">🔥</span>
        <span class="streak-count">{{ streakDays }}天</span>
      </div>
    </div>

    <!-- 无方案状态 -->
    <div v-if="!plan && !loading" class="empty-state">
      <img src="@/assets/icons/herb-icon.svg" alt="中草药" class="empty-icon" />
      <h3>暂无养生方案</h3>
      <p>完成体质辨识后，即可生成个性化养生方案</p>
      <el-button type="primary" @click="goToConstitution">开始体质辨识</el-button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading" :size="48"><Loading /></el-icon>
      <p>正在加载你的养生任务...</p>
    </div>

    <!-- 每日任务清单 -->
    <div v-if="plan && !loading" class="plan-content" ref="planContentRef">
      <!-- 今日进度 -->
      <div class="today-progress">
        <div class="progress-info">
          <span class="progress-label">今日完成进度</span>
          <span class="progress-value">{{ completedCount }} / {{ dailyTasks.length }}</span>
        </div>
        <el-progress
          :percentage="progressPercent"
          :stroke-width="10"
          :show-text="false"
          :color="progressColor"
        />
      </div>

      <!-- 任务分类标签 -->
      <div class="task-tabs">
        <div
          v-for="tab in taskTabs"
          :key="tab.id"
          class="task-tab"
          :class="{ 'is-active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <img :src="`@/assets/icons/${tab.icon}.svg`" class="tab-icon" :alt="tab.name" />
          <span class="tab-name">{{ tab.name }}</span>
          <span class="tab-count">{{ getTabCount(tab.id) }}</span>
        </div>
      </div>

      <!-- 任务列表 -->
      <div class="task-list">
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="task-item"
          :class="{ 'is-completed': task.completed }"
          @click="toggleTask(task)"
        >
          <div class="task-checkbox">
            <span v-if="task.completed" class="check-mark">✓</span>
          </div>
          <img :src="`@/assets/icons/${getTaskIcon(task.categoryType)}.svg`" class="task-icon" :alt="task.category" />
          <div class="task-content">
            <h4 class="task-title">{{ task.title }}</h4>
            <p class="task-desc">{{ task.description }}</p>
            <span class="task-category">{{ task.category }}</span>
          </div>
          <div class="task-action">
            <el-button
              size="small"
              :type="task.completed ? 'default' : 'primary'"
              :icon="task.completed ? 'Check' : 'Plus'"
              circle
              @click.stop="toggleTask(task)"
            />
          </div>
        </div>
      </div>

      <!-- 完成反馈 -->
      <transition name="fade">
        <div v-if="isAllCompleted" class="completion-feedback">
          <div class="feedback-icon">🎉</div>
          <h3>太棒了！今日任务全部完成！</h3>
          <p>你已连续打卡 {{ streakDays }} 天</p>
          <!-- 徽章展示 -->
          <div class="badges" v-if="earnedBadges.length">
            <div v-for="badge in earnedBadges" :key="badge.id" class="badge-item">
              <span class="badge-icon">{{ badge.icon }}</span>
              <span class="badge-name">{{ badge.name }}</span>
            </div>
          </div>
        </div>
      </transition>

      <!-- 全部方案查看 -->
      <div class="view-all-section">
        <el-button @click="showAllPlan = !showAllPlan">
          {{ showAllPlan ? '收起' : '查看完整方案' }}
        </el-button>
      </div>

      <!-- 完整方案（默认收起） -->
      <transition name="slide">
        <div v-if="showAllPlan" class="full-plan">
          <h3>📋 完整养生方案</h3>
          <div class="plan-cards">
            <!-- 饮食建议 -->
            <div class="plan-card">
              <div class="card-header">
                <img src="@/assets/icons/diet-icon.svg" alt="饮食" class="card-icon" />
                <h3>饮食建议</h3>
              </div>
              <div class="card-content">
                <div v-html="formatAdvice(plan.diet_advice)"></div>
              </div>
            </div>

            <!-- 起居建议 -->
            <div class="plan-card">
              <div class="card-header">
                <img src="@/assets/icons/lifestyle-icon.svg" alt="起居" class="card-icon" />
                <h3>起居建议</h3>
              </div>
              <div class="card-content">
                <div v-html="formatAdvice(plan.lifestyle_advice)"></div>
              </div>
            </div>

            <!-- 运动建议 -->
            <div class="plan-card">
              <div class="card-header">
                <img src="@/assets/icons/exercise-icon.svg" alt="运动" class="card-icon" />
                <h3>运动建议</h3>
              </div>
              <div class="card-content">
                <div v-html="formatAdvice(plan.exercise_advice)"></div>
              </div>
            </div>

            <!-- 穴位保健 -->
            <div class="plan-card">
              <div class="card-header">
                <img src="@/assets/icons/acupoint-icon.svg" alt="穴位" class="card-icon" />
                <h3>穴位保健</h3>
              </div>
              <div class="card-content">
                <div v-html="formatAdvice(plan.acupoint_advice)"></div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- 操作按钮 -->
      <div class="actions">
        <el-button @click="regeneratePlan" :loading="regenerating">
          重新生成方案
        </el-button>
        <el-button @click="sharePlan" :icon="Share">分享给朋友</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { marked } from 'marked';
import { Loading, Share, Check, Plus } from '@element-plus/icons-vue';
import { CONSTITUTION_INFO } from '@/data/quizQuestions';
import { useConstitutionStore } from '@/stores/constitution';
import request from '@/api/request';
import { ElMessage } from 'element-plus';

const router = useRouter();
const constitutionStore = useConstitutionStore();

const plan = ref(null);
const loading = ref(false);
const regenerating = ref(false);
const isFavorited = ref(false);
const planContentRef = ref(null);

// 每日任务相关状态
const dailyTasks = ref([]);
const activeTab = ref('all');
const showAllPlan = ref(false);

// 打卡相关
const streakDays = ref(0);
const completedTasksToday = ref([]);

// 徽章数据
const badges = [
  { id: 'newbie', name: '养生新手', icon: '🌱', days: 3 },
  { id: 'warrior', name: '阳虚勇士', icon: '⚔️', days: 5 },
  { id: 'master', name: '养生达人', icon: '🏆', days: 7 }
];

const earnedBadges = computed(() => {
  return badges.filter(b => streakDays.value >= b.days);
});

// 任务分类标签
const taskTabs = [
  { id: 'all', name: '全部', icon: 'calendar-icon' },
  { id: 'diet', name: '饮食', icon: 'diet-icon' },
  { id: 'exercise', name: '运动', icon: 'exercise-icon' },
  { id: 'lifestyle', name: '起居', icon: 'lifestyle-icon' },
  { id: 'acupoint', name: '穴位', icon: 'acupoint-icon' }
];

// 根据方案生成每日任务
const generateDailyTasks = () => {
  const tasks = [];

  // 从饮食建议生成任务
  if (plan.value?.diet_advice) {
    const dietItems = extractTasksFromAdvice(plan.value.diet_advice, 'diet', '饮食');
    tasks.push(...dietItems);
  }

  // 从运动建议生成任务
  if (plan.value?.exercise_advice) {
    const exerciseItems = extractTasksFromAdvice(plan.value.exercise_advice, 'exercise', '运动');
    tasks.push(...exerciseItems);
  }

  // 从起居建议生成任务
  if (plan.value?.lifestyle_advice) {
    const lifestyleItems = extractTasksFromAdvice(plan.value.lifestyle_advice, 'lifestyle', '起居');
    tasks.push(...lifestyleItems);
  }

  // 从穴位建议生成任务
  if (plan.value?.acupoint_advice) {
    const acupointItems = extractTasksFromAdvice(plan.value.acupoint_advice, 'acupoint', '穴位');
    tasks.push(...acupointItems);
  }

  // 限制每天的任务数量
  return tasks.slice(0, 8);
};

// 从建议文本中提取任务
const extractTasksFromAdvice = (advice, category, categoryName) => {
  const tasks = [];
  if (!advice) return tasks;

  // 解析文本，提取可执行的任务
  const lines = advice.split('\n').filter(line => line.trim());

  lines.forEach((line, index) => {
    // 清理文本
    const cleanText = line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
    if (cleanText.length > 5 && cleanText.length < 50) {
      tasks.push({
        id: `${category}-${index}`,
        title: cleanText,
        description: `${categoryName}任务`,
        category: categoryName,
        categoryType: category,
        completed: completedTasksToday.value.includes(`${category}-${index}`)
      });
    }
  });

  return tasks.slice(0, 2); // 每个类别最多2个任务
};

// 过滤任务
const filteredTasks = computed(() => {
  if (activeTab.value === 'all') {
    return dailyTasks.value;
  }
  return dailyTasks.value.filter(task => task.categoryType === activeTab.value);
});

// 获取分类任务数量
const getTabCount = (tabId) => {
  if (tabId === 'all') return dailyTasks.value.length;
  return dailyTasks.value.filter(task => task.categoryType === tabId).length;
};

// 获取任务图标
const getTaskIcon = (categoryType) => {
  const icons = {
    diet: 'diet-icon',
    exercise: 'exercise-icon',
    lifestyle: 'lifestyle-icon',
    acupoint: 'acupoint-icon'
  };
  return icons[categoryType] || 'calendar-icon';
};

// 完成数量
const completedCount = computed(() => {
  return dailyTasks.value.filter(task => task.completed).length;
});

// 进度百分比
const progressPercent = computed(() => {
  if (!dailyTasks.value.length) return 0;
  return Math.round((completedCount.value / dailyTasks.value.length) * 100);
});

// 进度条颜色
const progressColor = computed(() => {
  if (progressPercent.value < 30) return '#E87C7C';
  if (progressPercent.value < 70) return '#E8C87C';
  return '#4CAF50';
});

// 是否全部完成
const isAllCompleted = computed(() => {
  return dailyTasks.value.length > 0 && completedCount.value === dailyTasks.value.length;
});

// 切换任务状态
const toggleTask = (task) => {
  task.completed = !task.completed;

  // 保存到已完成列表
  if (task.completed) {
    if (!completedTasksToday.value.includes(task.id)) {
      completedTasksToday.value.push(task.id);
    }
    // 播放完成音效
    playCompleteSound();
    // 显示反馈
    if (isAllCompleted.value) {
      ElMessage.success('🎉 太棒了！今日任务全部完成！');
    } else {
      ElMessage.success('真棒！又完成了一个任务');
    }
  } else {
    completedTasksToday.value = completedTasksToday.value.filter(id => id !== task.id);
  }

  // 保存到本地存储
  saveProgress();
};

// 播放完成音效
const playCompleteSound = () => {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQ0A');
    audio.volume = 0.3;
    audio.play();
  } catch (e) {
    // 忽略音频错误
  }
};

// 保存进度
const saveProgress = () => {
  const today = new Date().toDateString();
  localStorage.setItem('wellness_tasks_' + today, JSON.stringify(completedTasksToday.value));

  // 更新连续打卡天数
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const lastDate = localStorage.getItem('wellness_last_date');
  const lastStreak = parseInt(localStorage.getItem('wellness_streak') || '0');

  if (lastDate === yesterdayStr) {
    streakDays.value = lastStreak;
  } else if (lastDate !== today) {
    streakDays.value = 0;
  }
};

// 加载进度
const loadProgress = () => {
  const today = new Date().toDateString();
  const saved = localStorage.getItem('wellness_tasks_' + today);
  if (saved) {
    completedTasksToday.value = JSON.parse(saved);
  }

  // 计算连续打卡
  const lastDate = localStorage.getItem('wellness_last_date');
  const lastStreak = parseInt(localStorage.getItem('wellness_streak') || '0');

  if (lastDate === today) {
    streakDays.value = lastStreak;
  }
};

const constitutionColor = computed(() =>
  CONSTITUTION_INFO[plan.value?.constitution]?.color || '#4A7C59'
);

const formatAdvice = (text) => {
  if (!text) return '<p class="no-content">暂无建议</p>';
  // 确保text是字符串
  if (typeof text !== 'string') {
    console.warn('formatAdvice 收到的不是字符串:', typeof text, text);
    // 如果是数组，尝试转换为字符串
    if (Array.isArray(text)) {
      text = text.join('\n');
    } else {
      return '<p class="no-content">暂无建议</p>';
    }
  }
  try {
    return marked.parse(text);
  } catch (e) {
    console.error('marked.parse 错误:', e);
    return text;
  }
};

const fetchPlan = async () => {
  loading.value = true;
  try {
    const res = await request.get('/wellness/plan');
    console.log('获取到的方案数据:', res.data);
    plan.value = res.data;
  } catch (err) {
    console.error('获取养生方案失败:', err);
  } finally {
    loading.value = false;
  }
};

const generatePlan = async () => {
  loading.value = true;
  try {
    // 从体质store获取体质类型
    const constitutionType = constitutionStore.currentResult?.constitution;
    console.log('生成方案，体质类型:', constitutionType);

    const res = await request.post('/wellness/generate', {
      constitutionType,
      constitutionResult: constitutionStore.currentResult
    });
    plan.value = res.data;
    ElMessage.success('养生方案生成成功');
  } catch (err) {
    ElMessage.error(err.message || '生成失败');
  } finally {
    loading.value = false;
  }
};

const regeneratePlan = async () => {
  regenerating.value = true;
  try {
    const constitutionType = constitutionStore.currentResult?.constitution;
    const res = await request.post('/wellness/generate', {
      constitutionType,
      constitutionResult: constitutionStore.currentResult
    });
    plan.value = res.data;
    ElMessage.success('方案已更新');
  } catch (err) {
    ElMessage.error(err.message || '重新生成失败');
  } finally {
    regenerating.value = false;
  }
};

const goToConstitution = () => {
  router.push('/constitution');
};

const sharePlan = () => {
  // TODO: 实现分享功能
  ElMessage.info('分享功能开发中');
};

// 收藏方案
const favoritePlan = async () => {
  try {
    // TODO: 实际调用后端 API
    // await request.post('/wellness/plan/favorite', { planId: plan.value.id });

    // Mock
    console.log('调用 /api/wellness/plan/favorite', { plan: plan.value });

    isFavorited.value = !isFavorited.value;
    ElMessage.success(isFavorited.value ? '方案已收藏' : '已取消收藏');
  } catch (err) {
    ElMessage.error('收藏失败');
  }
};

// 导出 PDF
const exportPDF = async () => {
  if (!planContentRef.value) return;

  try {
    ElMessage.info('正在生成PDF...');

    const element = planContentRef.value;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FAF8F5'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`小甘草养生方案_${plan.value.constitution}.pdf`);

    ElMessage.success('PDF下载成功');
  } catch (err) {
    console.error('PDF导出失败:', err);
    ElMessage.error('PDF导出失败');
  }
};

onMounted(async () => {
  try {
    // 先加载进度
    loadProgress();

    await fetchPlan();

    // 如果没有方案但有体质结果，自动生成
    if (!plan.value && constitutionStore.hasResult) {
      await generatePlan();
    }

    // 生成每日任务
    if (plan.value) {
      dailyTasks.value = generateDailyTasks();
    }
  } catch (err) {
    console.error('获取养生方案失败:', err);
  }
});
</script>

<style scoped>
.wellness-plan-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  border-radius: var(--radius-lg);
}

.header-content {
  text-align: left;
}

.page-header h1 {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-xs);
  color: #2E7D32;
}

.page-header p {
  color: #388E3C;
}

.streak-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: white;
  border-radius: var(--radius-full);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.streak-icon {
  font-size: 24px;
}

.streak-count {
  font-weight: 600;
  color: #E65100;
}

/* 今日进度 */
.today-progress {
  background: var(--bg-card);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-lg);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.progress-label {
  color: var(--text-secondary);
}

.progress-value {
  font-weight: 600;
  color: #4CAF50;
}

/* 任务标签 */
.task-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  overflow-x: auto;
  padding-bottom: var(--spacing-xs);
}

.task-tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-card);
  border-radius: var(--radius-full);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.task-tab:hover {
  background: var(--bg-secondary);
}

.task-tab.is-active {
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  color: white;
}

.tab-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.tab-count {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
}

.task-tab.is-active .tab-count {
  background: rgba(255, 255, 255, 0.2);
}

/* 任务列表 */
.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.task-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.task-item.is-completed {
  background: #E8F5E9;
  border-color: #4CAF50;
}

.task-checkbox {
  width: 28px;
  height: 28px;
  border: 2px solid #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.task-item.is-completed .task-checkbox {
  background: #4CAF50;
  border-color: #4CAF50;
}

.check-mark {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.task-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.task-content {
  flex: 1;
}

.task-title {
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}

.task-item.is-completed .task-title {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.task-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.task-category {
  display: inline-block;
  font-size: 10px;
  padding: 2px 8px;
  background: var(--bg-secondary);
  border-radius: 10px;
  margin-top: var(--spacing-xs);
}

/* 完成反馈 */
.completion-feedback {
  text-align: center;
  padding: var(--spacing-2xl);
  background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-xl);
}

.feedback-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-md);
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.completion-feedback h3 {
  color: #E65100;
  margin-bottom: var(--spacing-sm);
}

.completion-feedback p {
  color: #FF9800;
  font-weight: 500;
}

/* 徽章 */
.badges {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  flex-wrap: wrap;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: white;
  border-radius: var(--radius-full);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.badge-icon {
  font-size: 20px;
}

.badge-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

/* 查看全部 */
.view-all-section {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

/* 完整方案 */
.full-plan {
  background: var(--bg-card);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-xl);
}

.full-plan h3 {
  margin-bottom: var(--spacing-lg);
}

.empty-state,
.loading-state {
  text-align: center;
  padding: var(--spacing-2xl);
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: var(--spacing-lg);
}

.plan-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

.plan-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.card-icon {
  width: 28px;
  height: 28px;
}

.card-header h3 {
  font-size: var(--font-size-lg);
}

.card-content {
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}

.card-content :deep(p) {
  margin-bottom: var(--spacing-sm);
}

.no-content {
  color: var(--text-tertiary);
  font-style: italic;
}

.actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }

  .header-content {
    text-align: center;
  }

  .task-tabs {
    justify-content: flex-start;
  }

  .plan-cards {
    grid-template-columns: 1fr;
  }
}
</style>
