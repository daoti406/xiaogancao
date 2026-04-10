<template>
  <div class="constitution-report">
    <!-- 骨架屏加载 -->
    <div v-if="loading" class="skeleton-container">
      <el-skeleton :rows="10" animated />
    </div>

    <template v-else>
      <!-- 顶部标题 -->
      <div class="report-header">
        <div class="celebration">🎉</div>
        <h1>体质辨识完成！</h1>
        <p class="report-date">{{ formatDate(result.answeredAt) }}</p>
      </div>

      <!-- 主要体质卡片 -->
      <div class="main-constitution">
        <div class="constitution-badge-large" :style="{ background: gradientColor }">
          <span class="badge-icon">{{ constitutionIcon }}</span>
          <div class="badge-content">
            <span class="badge-label">你的体质类型</span>
            <span class="badge-text">{{ result.constitution }}</span>
          </div>
        </div>

        <!-- 体质描述 -->
        <div class="constitution-description">
          <h3>你属于 {{ result.constitution }}，所以平时可能会...</h3>
          <ul class="characteristics-list">
            <li v-for="char in characteristics" :key="char">
              <span class="check-icon">✓</span>
              {{ char }}
            </li>
          </ul>
        </div>

        <!-- 生活化例子 -->
        <div class="life-examples">
          <div class="example-card" v-if="lifeExamples.length">
            <div class="example-header">
              <span class="example-icon">💭</span>
              <span>看看说的是不是你</span>
            </div>
            <div class="examples-list">
              <p v-for="(example, idx) in lifeExamples" :key="idx" class="example-item">
                "{{ example }}"
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 雷达图 -->
      <div class="chart-section">
        <h2>📊 体质得分分布</h2>
        <p class="section-desc">这九种体质在你的身体上都有体现，看看哪些比较明显</p>
        <RadarChart :scores="result.scores" height="350px" />
      </div>

      <!-- 历史对比 -->
      <div class="history-section">
        <div class="history-header">
          <h2>📈 历史对比</h2>
          <el-select v-model="selectedConstitution" placeholder="选择体质类型" size="small">
            <el-option
              v-for="type in constitutionTypes"
              :key="type"
              :label="type"
              :value="type"
            />
          </el-select>
        </div>
        <div class="history-chart" ref="historyChartRef"></div>
        <p v-if="!historyData.length" class="no-history">暂无历史记录，完成多次测试后将显示趋势</p>
        <p v-else class="history-summary">{{ historySummary }}</p>
      </div>

      <!-- 详细得分 -->
      <div class="scores-section">
        <h2>📋 详细得分</h2>
        <div class="score-bars">
          <div
            v-for="item in sortedScores"
            :key="item.type"
            class="score-item"
            :class="{ 'is-main': item.type === result.constitution }"
          >
            <div class="score-header">
              <span class="score-label">
                <span v-if="item.type === result.constitution" class="main-tag">主要</span>
                {{ item.type }}
              </span>
              <span class="score-value">{{ item.score }}分</span>
            </div>
            <div class="score-bar">
              <div
                class="score-fill"
                :style="{ width: `${(item.score / 10) * 100}%`, background: getConstitutionColor(item.type) }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 养生建议 -->
      <div class="recommendations-section">
        <h2>💡 养生建议</h2>
        <div class="recommendation-grid">
          <div class="recommendation-card" v-for="(advice, key) in recommendations" :key="key">
            <div class="card-header">
              <img :src="advice.icon" class="card-icon" alt="" />
              <span class="card-title">{{ advice.title }}</span>
            </div>
            <p class="card-content">{{ advice.content }}</p>
          </div>
        </div>
      </div>

      <!-- 行动按钮区域 -->
      <div class="action-buttons-section">
        <h2>🚀 接下来怎么做？</h2>
        <div class="action-buttons">
          <div class="action-btn primary-action" @click="viewWellnessPlan">
            <div class="btn-icon">📋</div>
            <div class="btn-content">
              <span class="btn-title">帮我制定养生方案</span>
              <span class="btn-desc">基于你的体质，推荐专属方案</span>
            </div>
            <span class="btn-arrow">→</span>
          </div>

          <div class="action-btn secondary-action" @click="toggleReminderPreview">
            <div class="btn-icon">🔔</div>
            <div class="btn-content">
              <span class="btn-title">添加养生提醒</span>
              <span class="btn-desc">帮你养成健康习惯</span>
            </div>
            <span class="btn-arrow">→</span>
          </div>
        </div>

        <!-- 推荐的提醒内容预览 -->
        <div class="reminder-preview" v-if="showReminderPreview">
          <div class="preview-header">
            <span class="preview-icon">💡</span>
            <span>根据你的{{ result.constitution }}，推荐这个提醒：</span>
          </div>
          <div class="preview-content">
            {{ suggestedReminder }}
          </div>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="actions">
        <el-button @click="retake" class="retry-btn">重新测试</el-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useConstitutionStore } from '@/stores/constitution';
import { CONSTITUTION_INFO } from '@/data/quizQuestions';
import RadarChart from '@/components/constitution/RadarChart.vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';

const router = useRouter();
const constitutionStore = useConstitutionStore();

const loading = ref(true);
const historyChartRef = ref(null);
let historyChart = null;

// 提醒相关
const showReminderPreview = ref(false);
const suggestedReminder = computed(() => {
  const reminders = {
    '阳虚质': '每天早上喝一杯温姜茶，驱散体内寒气',
    '阴虚质': '晚上10点前入睡，养阴润燥',
    '气虚质': '每天适度运动30分钟，补气养身',
    '痰湿质': '晚餐清淡，避免生冷油腻食物',
    '湿热质': '多喝绿豆汤，清热祛湿',
    '血瘀质': '每天按摩足三里，活血化瘀',
    '气郁质': '每天保持心情愉悦，适当户外活动',
    '特禀质': '注意观察过敏源，保持环境清洁',
    '平和质': '保持规律作息，均衡饮食'
  };
  return reminders[result.value.constitution] || '每天保持健康生活习惯';
});

// 生活化例子数据
const lifeExamplesData = {
  '阳虚质': [
    '冬天总是比身边的人穿得多，还是觉得冷',
    '手脚经常是冰凉的',
    '夏天不太敢吹空调',
    '喝凉水容易不舒服'
  ],
  '阴虚质': [
    '总是口干舌燥，想喝水',
    '皮肤比较干燥',
    '晚上容易失眠，睡着了也容易醒',
    '手心脚心经常发热'
  ],
  '气虚质': [
    '容易疲劳，稍微活动就累',
    '说话声音比较轻',
    '容易感冒',
    '爬楼梯容易气喘吁吁'
  ],
  '痰湿质': [
    '身体总是感觉沉甸甸的',
    '脸上或头发容易出油',
    '腹部有赘肉',
    '大便粘滞，不容易冲干净'
  ],
  '湿热质': [
    '脸上总是油光光的',
    '容易长痘痘',
    '口苦或有异味',
    '大便干结或粘滞'
  ],
  '血瘀质': [
    '面色比较晦暗',
    '容易出现淤青',
    '身体某处偶尔会刺痛',
    '嘴唇颜色偏暗'
  ],
  '气郁质': [
    '经常闷闷不乐',
    '容易胡思乱想',
    '总是忍不住叹气',
    '喉咙有异物感'
  ],
  '特禀质': [
    '换季时容易打喷嚏',
    '对某些食物或药物过敏',
    '皮肤容易瘙痒',
    '容易起红疹'
  ],
  '平和质': [
    '精力充沛，不容易疲劳',
    '睡眠质量好',
    '食欲正常',
    '适应能力很强'
  ]
};

const lifeExamples = computed(() => {
  return lifeExamplesData[result.value.constitution] || [];
});

const characteristics = computed(() => {
  return CONSTITUTION_INFO[result.value.constitution]?.characteristics || [];
});

// 历史数据
const historyData = ref([]);
const selectedConstitution = ref('阳虚质');

const historySummary = computed(() => {
  if (!historyData.value.length) return '';
  const latest = historyData.value[historyData.value.length - 1];
  const first = historyData.value[0];
  const change = latest.score - first.score;
  if (change > 0) {
    return `太棒了！你的${selectedConstitution.value}指数比第一次测试上升了${change.toFixed(1)}分，继续保持！`;
  } else if (change < 0) {
    return `你的${selectedConstitution.value}指数下降了${Math.abs(change).toFixed(1)}分，要加油调理哦！`;
  }
  return `你的${selectedConstitution.value}指数保持稳定，继续保持健康生活！`;
});

const constitutionTypes = [
  '平和质', '阳虚质', '阴虚质', '气虚质', '痰湿质',
  '湿热质', '血瘀质', '气郁质', '特禀质'
];

// 获取历史数据（mock）
const fetchHistoryData = async () => {
  // TODO: 实际调用后端 API
  // const { data } = await axios.get('/api/constitution/history');

  // Mock 数据
  setTimeout(() => {
    historyData.value = [
      { date: '2024-01-15', score: 6.5 },
      { date: '2024-02-20', score: 7.0 },
      { date: '2024-03-10', score: 6.8 },
      { date: '2024-04-05', score: 7.2 }
    ];
    initHistoryChart();
  }, 500);
};

// 初始化历史对比折线图
const initHistoryChart = () => {
  if (!historyChartRef.value || !historyData.value.length) return;

  historyChart = echarts.init(historyChartRef.value);

  const dates = historyData.value.map(item => item.date.slice(5));
  const scores = historyData.value.map(item => item.score);

  const option = {
    grid: {
      left: '15%',
      right: '10%',
      top: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#E8E2D9' } },
      axisLabel: { color: '#8A9A8B', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 10,
      axisLine: { show: false },
      axisLabel: { color: '#8A9A8B' },
      splitLine: { lineStyle: { color: '#F0EBE3' } }
    },
    series: [{
      type: 'line',
      data: scores,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: '#4A7C59', width: 2 },
      itemStyle: { color: '#4A7C59' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(74, 124, 89, 0.3)' },
          { offset: 1, color: 'rgba(74, 124, 89, 0.05)' }
        ])
      }
    }],
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const item = params[0];
        return `${item.name}<br/>得分: <strong>${item.value}</strong>`;
      }
    }
  };

  historyChart.setOption(option);
};

// 监听体质选择变化
watch(selectedConstitution, () => {
  initHistoryChart();
});

// 监听窗口变化
const resizeHistoryChart = () => {
  historyChart?.resize();
};

const result = computed(() => {
  return constitutionStore.currentResult || {
    constitution: '平和质',
    scores: {},
    answeredAt: new Date().toISOString()
  };
});

const sortedScores = computed(() => {
  if (!result.value.scores) return [];
  return Object.entries(result.value.scores)
    .map(([type, score]) => ({ type, score }))
    .sort((a, b) => b.score - a.score);
});

const constitutionColor = computed(() =>
  CONSTITUTION_INFO[result.value.constitution]?.color || '#7CE89C'
);

const gradientColor = computed(() => {
  const color = constitutionColor.value;
  return `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`;
});

const constitutionIcon = computed(() =>
  CONSTITUTION_INFO[result.value.constitution]?.icon || '✨'
);

const recommendations = computed(() => {
  const info = CONSTITUTION_INFO[result.value.constitution];
  return {
    diet: {
      icon: new URL('@/assets/icons/diet-icon.svg', import.meta.url).href,
      title: '饮食建议',
      content: info?.diet?.join('、') || '均衡饮食'
    },
    lifestyle: {
      icon: new URL('@/assets/icons/lifestyle-icon.svg', import.meta.url).href,
      title: '起居建议',
      content: '规律作息，保持良好生活习惯'
    },
    exercise: {
      icon: new URL('@/assets/icons/exercise-icon.svg', import.meta.url).href,
      title: '运动建议',
      content: '适度运动，增强体质'
    },
    avoid: {
      icon: new URL('@/assets/icons/warning-icon.svg', import.meta.url).href,
      title: '注意事项',
      content: info?.avoid?.join('、') || '避免过度劳累'
    }
  };
});

const getConstitutionColor = (type) => CONSTITUTION_INFO[type]?.color || '#4A7C59';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('zh-CN');
};

const retake = () => {
  constitutionStore.resetAnswers();
  router.push('/constitution');
};

const viewWellnessPlan = () => {
  router.push('/wellness');
};

const toggleReminderPreview = () => {
  showReminderPreview.value = !showReminderPreview.value;
  if (showReminderPreview.value) {
    // 提示用户可以跳转到提醒页面
    ElMessage.success('已为你推荐适合的养生提醒');
  }
};

// 跳转到提醒页面并创建提醒
const goToReminder = () => {
  router.push({
    path: '/reminders',
    query: { suggestion: suggestedReminder.value }
  });
};

onMounted(async () => {
  if (!constitutionStore.currentResult) {
    await constitutionStore.fetchResult();
  }
  loading.value = false;

  // 加载历史数据
  await fetchHistoryData();

  window.addEventListener('resize', resizeHistoryChart);
});
</script>

<style scoped>
.constitution-report {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.report-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.celebration {
  font-size: 48px;
  margin-bottom: var(--spacing-sm);
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.report-header h1 {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-sm);
  color: #2E7D32;
}

.report-date {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.main-constitution {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.constitution-badge-large {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl) var(--spacing-2xl);
  border-radius: var(--radius-lg);
  color: white;
  margin-bottom: var(--spacing-xl);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.badge-icon {
  font-size: 48px;
}

.badge-content {
  text-align: left;
}

.badge-label {
  display: block;
  font-size: var(--font-size-sm);
  opacity: 0.9;
}

.badge-text {
  font-size: var(--font-size-2xl);
  font-weight: 600;
}

/* 体质描述 */
.constitution-description {
  background: linear-gradient(135deg, #FAF6F1 0%, #FFF8E1 100%);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-lg);
  text-align: left;
}

.constitution-description h3 {
  color: #5D4037;
  margin-bottom: var(--spacing-md);
}

.characteristics-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.characteristics-list li {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
  color: #5D4037;
}

.check-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: #4CAF50;
  color: white;
  border-radius: 50%;
  font-size: 12px;
}

/* 生活化例子 */
.life-examples {
  margin-bottom: var(--spacing-lg);
}

.example-card {
  background: var(--bg-card);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  border-left: 4px solid #FF9800;
}

.example-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: #E65100;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.example-icon {
  font-size: 20px;
}

.examples-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.example-item {
  color: var(--text-secondary);
  font-style: italic;
  margin: 0;
  padding-left: var(--spacing-md);
  border-left: 2px solid #FFE0B2;
}

.chart-section,
.scores-section,
.recommendations-section,
.history-section,
.action-buttons-section {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.section-desc {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-top: calc(-1 * var(--spacing-sm));
  margin-bottom: var(--spacing-lg);
}

.chart-section h2,
.scores-section h2,
.recommendations-section h2,
.history-section h2,
.action-buttons-section h2 {
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-xl);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.history-chart {
  height: 200px;
}

.no-history,
.history-summary {
  text-align: center;
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  padding: var(--spacing-md);
}

.history-summary {
  color: #4CAF50;
  font-weight: 500;
}

.score-bars {
  display: grid;
  gap: var(--spacing-md);
}

.score-item {
  background: var(--bg-secondary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.score-item.is-main {
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  border: 1px solid #4CAF50;
}

.score-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.score-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.main-tag {
  background: #4CAF50;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
}

.score-value {
  font-weight: 600;
}

.score-bar {
  height: 8px;
  background: var(--border-color);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.score-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.recommendation-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.recommendation-card {
  background: var(--bg-secondary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.card-icon {
  width: 24px;
  height: 24px;
}

.card-title {
  font-weight: 600;
}

.card-content {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}

/* 行动按钮区域 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.primary-action {
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  color: white;
}

.secondary-action {
  background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%);
  color: #5D4037;
}

.btn-icon {
  font-size: 32px;
}

.btn-content {
  flex: 1;
  text-align: left;
}

.btn-title {
  display: block;
  font-weight: 600;
  font-size: var(--font-size-md);
}

.btn-desc {
  display: block;
  font-size: var(--font-size-sm);
  opacity: 0.8;
}

.btn-arrow {
  font-size: 24px;
  opacity: 0.6;
}

/* 提醒预览 */
.reminder-preview {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: #E8F5E9;
  border-radius: var(--radius-md);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: #2E7D32;
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-sm);
}

.preview-icon {
  font-size: 16px;
}

.preview-content {
  color: #388E3C;
  font-size: var(--font-size-md);
}

.actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-2xl);
}

.retry-btn {
  background: var(--bg-secondary);
}

@media (max-width: 768px) {
  .recommendation-grid {
    grid-template-columns: 1fr;
  }

  .action-btn {
    padding: var(--spacing-md);
  }

  .badge-icon {
    font-size: 32px;
  }

  .badge-text {
    font-size: var(--font-size-xl);
  }
}
</style>
