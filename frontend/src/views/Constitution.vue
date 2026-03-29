<template>
  <div class="constitution-page">
    <div class="page-header">
      <h1>中医体质辨识</h1>
      <p>根据《中医体质分类与判定》标准，通过17道题目识别您的体质类型</p>
    </div>

    <!-- 进度条 -->
    <div class="progress-section">
      <div class="progress-info">
        <span>已完成 {{ answeredCount }} / {{ questions.length }} 题</span>
        <span class="progress-percent">{{ progress }}%</span>
      </div>
      <el-progress 
        :percentage="progress" 
        :stroke-width="8"
        :show-text="false"
        :color="progressColor"
      />
    </div>

    <!-- 问卷区域 -->
    <div class="quiz-container">
      <QuizQuestion
        v-for="(question, index) in visibleQuestions"
        :key="question.id"
        :question="question"
        v-model="answers[index + startIndex]"
        :show-description="currentStep === index"
        class="question-item"
        :class="{ active: currentStep === index }"
      />

      <!-- 导航按钮 -->
      <div class="navigation">
        <el-button 
          v-if="currentStep > 0"
          @click="prevStep"
        >
          上一题
        </el-button>
        
        <el-button 
          v-if="currentStep < questions.length - 1"
          type="primary"
          @click="nextStep"
          :disabled="!answers[currentStep]"
        >
          下一题
        </el-button>

        <el-button 
          v-if="currentStep === questions.length - 1"
          type="primary"
          @click="handleSubmit"
          :disabled="!allAnswered"
          :loading="submitting"
        >
          提交问卷
        </el-button>
      </div>
    </div>

    <!-- 提示信息 -->
    <div class="tips-section">
      <div class="tip-card">
        <div class="tip-icon">💡</div>
        <div class="tip-content">
          <h4>填写提示</h4>
          <p>请根据您近一年的实际情况如实作答，这样才能获得准确的体质辨识结果</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useConstitutionStore } from '@/stores/constitution';
import { QUIZ_QUESTIONS } from '@/data/quizQuestions';
import { ElMessage } from 'element-plus';
import QuizQuestion from '@/components/constitution/QuizQuestion.vue';

const router = useRouter();
const constitutionStore = useConstitutionStore();

const questions = QUIZ_QUESTIONS;
const answers = ref(new Array(questions.length).fill(null));
const currentStep = ref(0);
const submitting = ref(false);

// 计算属性
const answeredCount = computed(() => 
  answers.value.filter(a => a !== null).length
);

const progress = computed(() => {
  const count = answeredCount.value;
  return Math.round((count / questions.length) * 100);
});

const allAnswered = computed(() => 
  answers.value.every(a => a !== null)
);

const progressColor = computed(() => {
  if (progress.value < 30) return '#E87C7C';
  if (progress.value < 70) return '#E8C87C';
  return '#7CE89C';
});

// 移动端每页显示一道题
const visibleQuestions = computed(() => {
  return [questions[currentStep.value]];
});

const startIndex = computed(() => currentStep.value);

// 方法
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const nextStep = () => {
  if (currentStep.value < questions.length - 1 && answers.value[currentStep.value]) {
    currentStep.value++;
  }
};

const handleSubmit = async () => {
  alert('开始提交');
  if (!allAnswered.value) {
    ElMessage.warning('请完成所有题目');
    return;
  }

  console.log('提交答案:', answers.value);
  submitting.value = true;
  try {
    const result = await constitutionStore.submit(answers.value);
    console.log('提交结果:', result);
    alert('提交成功，准备跳转');
    router.push('/constitution/report');
  } catch (error) {
    console.error('提交失败:', error);
    alert('提交失败: ' + (error.message || '未知错误'));
    ElMessage.error(error.message || '提交失败');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.constitution-page {
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

.page-header p {
  color: var(--text-secondary);
}

.progress-section {
  margin-bottom: var(--spacing-xl);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.progress-percent {
  font-weight: 600;
  color: var(--primary-color);
}

.quiz-container {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
}

.question-item {
  margin-bottom: var(--spacing-lg);
}

.navigation {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

.tips-section {
  margin-top: var(--spacing-lg);
}

.tip-card {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.tip-icon {
  font-size: 32px;
}

.tip-content h4 {
  margin-bottom: var(--spacing-xs);
}

.tip-content p {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .constitution-page {
    padding: var(--spacing-md);
  }
}
</style>
