<template>
  <div class="message-input">
    <div class="input-container">
      <el-input
        ref="inputRef"
        v-model="inputText"
        type="textarea"
        :rows="1"
        :autosize="{ minRows: 1, maxRows: 4 }"
        placeholder="输入您的健康问题..."
        :disabled="disabled || sending"
        @keydown.enter.exact="handleEnter"
        @keydown.enter.shift.exact="() => {}"
      />
      <el-button
        type="primary"
        :loading="sending"
        :disabled="!inputText.trim() || disabled"
        @click="handleSend"
        class="send-btn"
      >
        <el-icon v-if="!sending"><Promotion /></el-icon>
      </el-button>
    </div>
    
    <div class="input-tips">
      <span>按 Enter 发送，Shift + Enter 换行</span>
      <span class="disclaimer">AI回复仅供参考，不构成医疗诊断</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Promotion } from '@element-plus/icons-vue';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  sending: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['send']);

const inputRef = ref(null);
const inputText = ref('');

const handleSend = () => {
  const text = inputText.value.trim();
  if (!text || props.disabled || props.sending) return;
  
  emit('send', text);
  inputText.value = '';
};

const handleEnter = (e) => {
  if (e.shiftKey) return; // Shift+Enter 换行
  e.preventDefault();
  handleSend();
};

const focus = () => {
  inputRef.value?.focus();
};

defineExpose({ focus });
</script>

<style scoped>
.message-input {
  padding: var(--spacing-md);
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
}

.input-container {
  display: flex;
  gap: var(--spacing-sm);
  align-items: flex-end;
}

.input-container :deep(.el-textarea__inner) {
  resize: none;
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  font-size: var(--font-size-md);
  line-height: 1.5;
}

.send-btn {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.input-tips {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.disclaimer {
  color: var(--text-tertiary);
}
</style>
