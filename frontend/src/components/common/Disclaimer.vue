<template>
  <div class="disclaimer-component" :class="type">
    <div class="disclaimer-icon">{{ iconMap[type] }}</div>
    <div class="disclaimer-content">
      <h4 v-if="title">{{ title }}</h4>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'warning', // warning, info, danger
    validator: v => ['warning', 'info', 'danger'].includes(v)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: '本平台提供的养生建议仅供参考，不构成医疗诊断或处方。如有身体不适，请及时就医。'
  }
});

const iconMap = {
  warning: '⚠️',
  info: 'ℹ️',
  danger: '🚫'
};
</script>

<style scoped>
.disclaimer-component {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  background: var(--warning-bg);
  border-left: 4px solid var(--warning-color);
}

.disclaimer-component.info {
  background: var(--info-bg);
  border-left-color: var(--info-color);
}

.disclaimer-component.danger {
  background: var(--error-bg);
  border-left-color: var(--error-color);
}

.disclaimer-icon {
  font-size: 24px;
}

.disclaimer-content h4 {
  margin-bottom: var(--spacing-xs);
}

.disclaimer-content p {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}
</style>
