<template>
  <div class="message-list" ref="listRef">
    <div class="message-item" v-for="(msg, index) in messages" :key="index" :class="msg.role">
      <div class="message-avatar">
        <el-avatar :size="36" v-if="msg.role === 'user'" class="avatar-user">
          {{ userInitial }}
        </el-avatar>
        <el-avatar :size="36" v-else class="avatar-assistant">
          🌿
        </el-avatar>
      </div>
      <div class="message-content">
        <div class="message-role">{{ msg.role === 'user' ? '我' : '小甘草' }}</div>
        <div class="message-text" :class="{ streaming: msg.streaming }">
          <StreamingText 
            v-if="msg.streaming || msg.role === 'assistant'" 
            :content="msg.content" 
            :isStreaming="msg.streaming"
          />
          <template v-else>{{ msg.content }}</template>
        </div>
      </div>
    </div>
    
    <div class="empty-state" v-if="messages.length === 0">
      <div class="empty-icon">🌿</div>
      <h3>您好，我是小甘草</h3>
      <p>您的中医养生AI助手，有什么可以帮您的吗？</p>
      <div class="suggestions">
        <div class="suggestion-item" v-for="s in suggestions" :key="s" @click="$emit('send', s)">
          {{ s }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useAuthStore } from '@/stores/auth';
import StreamingText from './StreamingText.vue';

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
});

defineEmits(['send']);

const listRef = ref(null);
const authStore = useAuthStore();

const userInitial = computed(() => {
  const name = authStore.userName;
  return name ? name.charAt(0).toUpperCase() : 'U';
});

const suggestions = [
  '我最近总是失眠怎么办？',
  '如何调理脾胃虚弱？',
  '我是什么体质？'
];

// 新消息时自动滚动到底部
watch(() => props.messages.length, async () => {
  await nextTick();
  scrollToBottom();
});

const scrollToBottom = () => {
  if (listRef.value) {
    listRef.value.scrollTop = listRef.value.scrollHeight;
  }
};

defineExpose({ scrollToBottom });
</script>

<style scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.message-item {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  animation: slideUp 0.3s ease;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.avatar-user {
  background: var(--primary-color);
  color: white;
}

.avatar-assistant {
  background: var(--secondary-color);
}

.message-content {
  max-width: 70%;
  min-width: 80px;
}

.message-item.user .message-content {
  align-items: flex-end;
}

.message-role {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-xs);
}

.message-text {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  line-height: var(--line-height-relaxed);
}

.message-item.user .message-text {
  background: var(--primary-color);
  color: white;
}

.message-text.streaming {
  position: relative;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-lg);
}

.empty-state h3 {
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.empty-state p {
  margin-bottom: var(--spacing-xl);
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  justify-content: center;
  max-width: 500px;
}

.suggestion-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.suggestion-item:hover {
  background: var(--primary-lighter);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }
}
</style>
