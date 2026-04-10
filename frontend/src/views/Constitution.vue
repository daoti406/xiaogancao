<template>
  <div class="constitution-page">
    <!-- 顶部进度组别显示 -->
    <div class="group-progress">
      <div class="group-steps">
        <div
          v-for="(group, index) in quizGroups"
          :key="group.id"
          class="group-step"
          :class="{
            'is-active': currentGroupIndex === index,
            'is-completed': completedGroups.includes(group.id)
          }"
          @click="goToGroup(index)"
        >
          <div class="step-icon">{{ group.icon }}</div>
          <div class="step-info">
            <span class="step-name">{{ group.name }}</span>
            <span class="step-desc">{{ group.description }}</span>
          </div>
          <div class="step-check" v-if="completedGroups.includes(group.id)">✓</div>
        </div>
      </div>
    </div>

    <!-- 当前组别标题 -->
    <div class="current-group-header">
      <div class="group-badge">
        <span class="badge-icon">{{ currentGroup.icon }}</span>
        <span class="badge-text">{{ currentGroup.name }}</span>
      </div>
      <span class="group-progress-text">
        第 {{ currentGroupIndex + 1 }} / {{ quizGroups.length }} 组
      </span>
    </div>

    <!-- 问卷区域 - 每组题目 -->
    <div class="quiz-container">
      <!-- 组别小结提示 -->
      <transition name="fade">
        <div v-if="showGroupSummary" class="group-summary-card">
          <div class="summary-icon">📋</div>
          <div class="summary-content">
            <h4>{{ currentGroup.name }} 完成</h4>
            <p>{{ groupSummary }}</p>
          </div>
        </div>
      </transition>

      <!-- 当前组的题目 -->
      <div class="questions-in-group">
        <QuizQuestion
          v-for="(question, index) in currentGroupQuestions"
          :key="question.id"
          :question="question"
          v-model="answers[question.id - 1]"
          :show-description="true"
          class="question-item"
        />
      </div>

      <!-- 导航按钮 -->
      <div class="navigation">
        <el-button
          v-if="currentGroupIndex > 0"
          @click="prevGroup"
          class="nav-btn"
        >
          ← 上一组
        </el-button>
        <el-button
          v-if="currentGroupIndex < quizGroups.length - 1"
          type="primary"
          @click="nextGroup"
          :disabled="!isCurrentGroupCompleted"
          class="nav-btn primary-btn"
        >
          下一组 →
        </el-button>

        <el-button
          v-if="currentGroupIndex === quizGroups.length - 1"
          type="success"
          @click="handleSubmit"
          :disabled="!allAnswered"
          :loading="submitting"
          class="nav-btn submit-btn"
        >
          提交问卷 🎯
        </el-button>
      </div>
    </div>

    <!-- 底部提示 -->
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
import { QUIZ_QUESTIONS, QUIZ_GROUPS, GROUP_SUMMARIES } from '@/data/quizQuestions';
import { ElMessage } from 'element-plus';
import QuizQuestion from '@/components/constitution/QuizQuestion.vue';

const router = useRouter();
const constitutionStore = useConstitutionStore();

const questions = QUIZ_QUESTIONS;
const quizGroups = QUIZ_GROUPS;
const answers = ref(new Array(questions.length).fill(null));
const currentGroupIndex = ref(0);
const completedGroups = ref([]);
const submitting = ref(false);
const showGroupSummary = ref(false);

// 计算当前组的题目
const currentGroupQuestions = computed(() => {
  const group = quizGroups[currentGroupIndex.value];
  return questions.filter(q => group.questionIds.includes(q.id));
});

const currentGroup = computed(() => {
  return quizGroups[currentGroupIndex.value] || {};
});

// 检查当前组是否完成
const isCurrentGroupCompleted = computed(() => {
  const group = quizGroups[currentGroupIndex.value];
  return group.questionIds.every(id => answers.value[id - 1] !== null);
});

// 计算整体进度
const progress = computed(() => {
  const count = answers.value.filter(a => a !== null).length;
  return Math.round((count / questions.length) * 100);
});

const allAnswered = computed(() =>
  answers.value.every(a => a !== null)
);

// 计算组别小结
const groupSummary = computed(() => {
  const group = quizGroups[currentGroupIndex.value];
  if (!group) return '';

  // 统计该组的答案情况
  const groupAnswers = group.questionIds.map(id => answers.value[id - 1]);
  const answeredCount = groupAnswers.filter(a => a !== null && a <= 3).length;
  const totalInGroup = group.questionIds.length;

  // 根据答案情况返回小结
  if (answeredCount === totalInGroup) {
    return GROUP_SUMMARIES[group.id]?.positive || '这一组你完成得很好！';
  } else if (answeredCount >= totalInGroup / 2) {
    return GROUP_SUMMARIES[group.id]?.neutral || '你完成了这一组的题目，继续加油！';
  } else {
    return GROUP_SUMMARIES[group.id]?.negative || '这一组你还需要继续努力哦！';
  }
});

// 方法
const prevGroup = () => {
  if (currentGroupIndex.value > 0) {
    currentGroupIndex.value--;
    showGroupSummary.value = false;
  }
};

const nextGroup = () => {
  if (isCurrentGroupCompleted.value && currentGroupIndex.value < quizGroups.length - 1) {
    // 标记当前组为完成
    const currentGroupId = quizGroups[currentGroupIndex.value].id;
    if (!completedGroups.value.includes(currentGroupId)) {
      completedGroups.value.push(currentGroupId);
    }
    // 显示小结
    showGroupSummary.value = true;
    // 延迟切换到下一组
    setTimeout(() => {
      currentGroupIndex.value++;
    }, 1500);
  }
};

const goToGroup = (index) => {
  // 只能跳转到已完成或当前组
  if (index <= currentGroupIndex.value || completedGroups.value.includes(quizGroups[index].id)) {
    currentGroupIndex.value = index;
    showGroupSummary.value = false;
  } else {
    ElMessage.warning('请先完成前面的组别');
  }
};

const handleSubmit = async () => {
  if (!allAnswered.value) {
    ElMessage.warning('请完成所有题目');
    return;
  }

  submitting.value = true;
  try {
    const result = await constitutionStore.submit(answers.value);
    router.push('/constitution/report');
  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error(error.message || '提交失败，请稍后重试');
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

/* 步骤条样式 */
.group-progress {
  margin-bottom: var(--spacing-xl);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.group-steps {
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;
  padding-bottom: var(--spacing-xs);
}

.group-step {
  flex: 1;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: var(--bg-secondary);
}

.group-step:hover {
  background: var(--bg-hover);
}

.group-step.is-active {
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  box-shadow: 0 2px 8px rgba(74, 124, 89, 0.2);
}

.group-step.is-completed {
  background: linear-gradient(135deg, #E8F5E9 0%, #A5D6A7 100%);
}

.step-icon {
  font-size: 24px;
  margin-bottom: var(--spacing-xs);
}

.step-info {
  text-align: center;
}

.step-name {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.step-desc {
  display: block;
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.step-check {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  background: #4CAF50;
  color: white;
  border-radius: 50%;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 当前组别标题 */
.current-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.group-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: linear-gradient(135deg, #FAF6F1 0%, #F5F5DC 100%);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-lg);
}

.badge-icon {
  font-size: 20px;
}

.badge-text {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.group-progress-text {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

/* 问卷容器 */
.quiz-container {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* 组别小结 */
.group-summary-card {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
}

.summary-icon {
  font-size: 32px;
}

.summary-content h4 {
  margin-bottom: var(--spacing-xs);
  color: #2E7D32;
}

.summary-content p {
  color: #388E3C;
  font-size: var(--font-size-sm);
  margin: 0;
}

/* 题目样式 */
.questions-in-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.question-item {
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 4px solid #4A7C59;
}

/* 导航按钮 */
.navigation {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.nav-btn {
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-md);
}

.primary-btn {
  background: linear-gradient(135deg, #4A7C59 0%, #2E7D32 100%);
  border: none;
}

.submit-btn {
  background: linear-gradient(135deg, #66BB6A 0%, #43A047 100%);
  border: none;
  font-weight: 600;
}

/* 提示区域 */
.tips-section {
  margin-top: var(--spacing-lg);
}

.tip-card {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #FAF6F1 0%, #FFF8E1 100%);
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
  margin: 0;
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

/* 响应式 */
@media (max-width: 768px) {
  .constitution-page {
    padding: var(--spacing-md);
  }

  .group-steps {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .group-step {
    min-width: 80px;
    padding: var(--spacing-sm);
  }

  .step-desc {
    display: none;
  }

  .navigation {
    flex-wrap: wrap;
  }

  .nav-btn {
    flex: 1;
    min-width: 120px;
  }
}
</style>
