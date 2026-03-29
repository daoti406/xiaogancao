<template>
  <div class="constitution-report">
    <!-- 骨架屏加载 -->
    <div v-if="loading" class="skeleton-container">
      <el-skeleton :rows="10" animated />
    </div>

    <template v-else>
      <div class="report-header">
        <h1>体质辨识报告</h1>
        <p class="report-date">{{ formatDate(result.answeredAt) }}</p>
      </div>

      <!-- 主要体质 -->
      <div class="main-constitution">
        <div class="constitution-badge" :style="{ background: constitutionColor }">
          <span class="badge-icon">{{ constitutionIcon }}</span>
          <span class="badge-text">{{ result.constitution }}</span>
        </div>
        <p class="constitution-desc">
          {{ constitutionStore.getConstitutionDescription(result.constitution) }}
        </p>
      </div>

      <!-- 雷达图 -->
      <div class="chart-section">
        <h2>体质得分分布</h2>
        <RadarChart :scores="result.scores" height="350px" />
      </div>

      <!-- 历史对比 -->
      <div class="history-section">
        <div class="history-header">
          <h2>历史对比</h2>
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
      </div>

      <!-- 详细得分 -->
      <div class="scores-section">
        <h2>详细得分</h2>
        <div class="score-bars">
          <div
            v-for="item in sortedScores"
            :key="item.type"
            class="score-item"
          >
            <div class="score-header">
              <span class="score-label">{{ item.type }}</span>
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
        <h2>养生建议</h2>
        <div class="recommendation-grid">
          <div class="recommendation-card" v-for="(advice, key) in recommendations" :key="key">
            <div class="card-header">
              <span class="card-icon">{{ advice.icon }}</span>
              <span class="card-title">{{ advice.title }}</span>
            </div>
            <p class="card-content">{{ advice.content }}</p>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <el-button @click="retake">重新测试</el-button>
        <el-button type="primary" @click="viewWellnessPlan">查看我的养生方案</el-button>
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

const router = useRouter();
const constitutionStore = useConstitutionStore();

const loading = ref(true);
const historyChartRef = ref(null);
let historyChart = null;

// 历史数据
const historyData = ref([]);
const selectedConstitution = ref('阳虚质');

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

const constitutionIcon = computed(() => 
  CONSTITUTION_INFO[result.value.constitution]?.icon || '✨'
);

const recommendations = computed(() => {
  const info = CONSTITUTION_INFO[result.value.constitution];
  return {
    diet: {
      icon: '🍎',
      title: '饮食建议',
      content: info?.diet?.join('、') || '均衡饮食'
    },
    lifestyle: {
      icon: '🌙',
      title: '起居建议',
      content: '规律作息，保持良好生活习惯'
    },
    exercise: {
      icon: '🏃',
      title: '运动建议',
      content: '适度运动，增强体质'
    },
    avoid: {
      icon: '⚠️',
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

.report-header h1 {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-sm);
}

.report-date {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.main-constitution {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.constitution-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-2xl);
  border-radius: var(--radius-full);
  color: white;
  margin-bottom: var(--spacing-lg);
}

.badge-icon {
  font-size: 32px;
}

.badge-text {
  font-size: var(--font-size-2xl);
  font-weight: 600;
}

.constitution-desc {
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: var(--line-height-relaxed);
}

.chart-section,
.scores-section,
.recommendations-section,
.history-section {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
}

.chart-section h2,
.scores-section h2,
.recommendations-section h2,
.history-section h2 {
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

.no-history {
  text-align: center;
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  padding: var(--spacing-lg);
}

.score-bars {
  display: grid;
  gap: var(--spacing-md);
}

.score-item {
  background: var(--bg-secondary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}

.score-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
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
  font-size: 24px;
}

.card-title {
  font-weight: 600;
}

.card-content {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}

.actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-2xl);
}

@media (max-width: 768px) {
  .recommendation-grid {
    grid-template-columns: 1fr;
  }
}
</style>
