<template>
  <div class="react-steps">
    <div v-if="steps.length === 0" class="empty-steps">
      <p>暂无步骤数据</p>
    </div>
    <div v-else class="steps-container">
      <div class="step-item step-completed">
        <div class="step-icon">🧠</div>
        <div class="step-content">
          <div class="step-title">思考过程</div>
          <div class="step-description">正在分析您的问题，为您提供专业的中医养生建议...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  steps: {
    type: Array,
    default: () => []
  }
});
</script>

<style scoped>
.react-steps {
  margin: 20px 0;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.empty-steps {
  text-align: center;
  color: #666;
  padding: 40px 0;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.step-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.step-item.step-completed {
  border-left: 4px solid #4CAF50;
}

.step-icon {
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.step-content {
  flex: 1;
}

.step-title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.step-description {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .react-steps {
    padding: 12px;
  }
  
  .step-item {
    padding: 12px;
  }
  
  .step-icon {
    font-size: 20px;
  }
  
  .step-title {
    font-size: 13px;
  }
  
  .step-description {
    font-size: 12px;
  }
}
</style>