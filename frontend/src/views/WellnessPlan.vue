<template>
  <div class="wellness-plan-page">
    <div class="page-header">
      <h1>个性化养生方案</h1>
      <p>基于您的体质辨识结果，为您量身定制的养生建议</p>
    </div>

    <!-- 无方案状态 -->
    <div v-if="!plan && !loading" class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>暂无养生方案</h3>
      <p>完成体质辨识后，即可生成个性化养生方案</p>
      <el-button type="primary" @click="goToConstitution">开始体质辨识</el-button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading" :size="48"><Loading /></el-icon>
      <p>正在生成您的养生方案...</p>
    </div>

    <!-- 方案内容 -->
    <div v-if="plan && !loading" class="plan-content" ref="planContentRef">
      <!-- 体质标签 -->
      <div class="constitution-badge">
        <span class="badge-label">您的体质：</span>
        <span class="badge-value" :style="{ color: constitutionColor }">
          {{ plan.constitution }}
        </span>
      </div>

      <!-- 方案卡片 -->
      <div class="plan-cards">
        <!-- 饮食建议 -->
        <div class="plan-card">
          <div class="card-header">
            <span class="card-icon">🍎</span>
            <h3>饮食建议</h3>
          </div>
          <div class="card-content">
            <div v-html="formatAdvice(plan.diet_advice)"></div>
          </div>
        </div>

        <!-- 起居建议 -->
        <div class="plan-card">
          <div class="card-header">
            <span class="card-icon">🌙</span>
            <h3>起居建议</h3>
          </div>
          <div class="card-content">
            <div v-html="formatAdvice(plan.lifestyle_advice)"></div>
          </div>
        </div>

        <!-- 运动建议 -->
        <div class="plan-card">
          <div class="card-header">
            <span class="card-icon">🏃</span>
            <h3>运动建议</h3>
          </div>
          <div class="card-content">
            <div v-html="formatAdvice(plan.exercise_advice)"></div>
          </div>
        </div>

        <!-- 穴位保健 -->
        <div class="plan-card">
          <div class="card-header">
            <span class="card-icon">💆</span>
            <h3>穴位保健</h3>
          </div>
          <div class="card-content">
            <div v-html="formatAdvice(plan.acupoint_advice)"></div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <el-button @click="regeneratePlan" :loading="regenerating">
          重新生成方案
        </el-button>
        <el-button @click="favoritePlan" :type="isFavorited ? 'success' : 'default'">
          {{ isFavorited ? '已收藏' : '收藏方案' }}
        </el-button>
        <el-button type="primary" @click="exportPDF">
          生成PDF报告
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { marked } from 'marked';
import { Loading } from '@element-plus/icons-vue';
import { CONSTITUTION_INFO } from '@/data/quizQuestions';
import { useConstitutionStore } from '@/stores/constitution';
import request from '@/api/request';
import { ElMessage } from 'element-plus';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const router = useRouter();
const constitutionStore = useConstitutionStore();

const plan = ref(null);
const loading = ref(false);
const regenerating = ref(false);
const isFavorited = ref(false);
const planContentRef = ref(null);

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
  await fetchPlan();
  
  // 如果没有方案但有体质结果，自动生成
  if (!plan.value && constitutionStore.hasResult) {
    await generatePlan();
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
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.page-header h1 {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-sm);
}

.page-header p {
  color: var(--text-secondary);
}

.empty-state,
.loading-state {
  text-align: center;
  padding: var(--spacing-2xl);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-lg);
}

.constitution-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-lg);
}

.badge-label {
  color: var(--text-secondary);
}

.badge-value {
  font-weight: 600;
}

.plan-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.plan-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
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
  font-size: 28px;
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

.card-content :deep(ul),
.card-content :deep(ol) {
  padding-left: var(--spacing-lg);
  margin-bottom: var(--spacing-sm);
}

.card-content :deep(li) {
  margin-bottom: var(--spacing-xs);
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

@media (max-width: 768px) {
  .plan-cards {
    grid-template-columns: 1fr;
  }
}
</style>
