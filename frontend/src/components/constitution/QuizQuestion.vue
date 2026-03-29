<template>
  <div class="quiz-question">
    <div class="question-header">
      <span class="question-number">{{ question.id }}</span>
      <span class="question-category">{{ question.category }}</span>
    </div>
    
    <h3 class="question-text">{{ question.text }}</h3>
    
    <p class="question-description" v-if="question.description && showDescription">
      {{ question.description }}
    </p>

    <div class="answer-options">
      <div
        v-for="option in ANSWER_OPTIONS"
        :key="option.value"
        class="answer-option"
        :class="{ selected: modelValue === option.value }"
        @click="selectAnswer(option.value)"
      >
        <span class="option-label">{{ option.label }}</span>
        <span class="option-dot"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ANSWER_OPTIONS } from '@/data/quizQuestions';

const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  modelValue: {
    type: Number,
    default: null
  },
  showDescription: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const selectAnswer = (value) => {
  emit('update:modelValue', value);
};
</script>

<style scoped>
.quiz-question {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.question-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.question-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.question-category {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  background: var(--bg-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.question-text {
  font-size: var(--font-size-lg);
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  line-height: var(--line-height-relaxed);
}

.question-description {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-lg);
}

.answer-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.answer-option {
  flex: 1;
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-secondary);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.answer-option:hover {
  background: var(--primary-lighter);
  border-color: var(--primary-light);
}

.answer-option.selected {
  background: var(--primary-lighter);
  border-color: var(--primary-color);
}

.answer-option.selected .option-label {
  color: var(--primary-color);
  font-weight: 500;
}

.option-label {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
}

.option-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: transparent;
}

.answer-option.selected .option-dot {
  background: var(--primary-color);
}

@media (max-width: 480px) {
  .answer-options {
    flex-direction: column;
  }
  
  .answer-option {
    min-width: auto;
  }
}
</style>
