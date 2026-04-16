<template>
  <div class="message-list" ref="listRef">
    <div class="message-item" v-for="(msg, index) in messages" :key="index" :class="msg.role">
      <div class="message-avatar">
        <el-avatar :size="36" v-if="msg.role === 'user'" class="avatar-user">
          {{ userInitial }}
        </el-avatar>
        <el-avatar :size="36" v-else class="avatar-assistant">
          <img src="@/assets/小甘草.png" alt="小甘草" />
        </el-avatar>
      </div>
      <div class="message-content">
        <div class="message-role">{{ msg.role === 'user' ? '我' : '小甘草' }}</div>
        <div class="message-text" :class="{ streaming: msg.streaming }">
          <StreamingText 
            v-if="msg.streaming || msg.role === 'assistant' " 
            :content="msg.content" 
            :isStreaming="msg.streaming"
          />
          <template v-else>{{ msg.content }}</template>
        </div>
        <!-- 显示步骤信息 -->
        <div class="message-steps" v-if="msg.role === 'assistant' && steps.length > 0">
          <ReactSteps :steps="steps" />
        </div>
      </div>
    </div>
    
    <div class="empty-state" v-if="messages.length === 0">
      <img src="@/assets/小甘草.png" class="empty-icon" alt="小甘草" />
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
import { useChatStore } from '@/stores/chat';
import StreamingText from './StreamingText.vue';
import ReactSteps from './ReactSteps.vue';

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
});

defineEmits(['send']);

const listRef = ref(null);
const authStore = useAuthStore();
const chatStore = useChatStore();

const userInitial = computed(() => {
  const name = authStore.userName;
  return name ? name.charAt(0).toUpperCase() : 'U';
});

const steps = computed(() => chatStore.steps);

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

// 步骤更新时自动滚动到底部
watch(() => steps.value.length, async () => {
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
  background: var(--bg-primary);
}

.message-item {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  animation: slideUp 0.3s ease;
  align-items: flex-start;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
  margin-top: var(--spacing-xs);
}

.avatar-user {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.avatar-assistant {
  background: linear-gradient(135deg, var(--secondary-color) 0%, var(--secondary-dark) 100%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message-content {
  max-width: 70%;
  min-width: 80px;
  display: flex;
  flex-direction: column;
}

.message-item.user .message-content {
  align-items: flex-end;
}

.message-role {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
}

.message-text {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  line-height: var(--line-height-relaxed);
  position: relative;
  transition: all 0.3s ease;
}

.message-item.user .message-text {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  border-bottom-right-radius: var(--radius-sm);
}

.message-item.assistant .message-text {
  border-bottom-left-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
}

.message-text.streaming {
  position: relative;
}

.message-text.streaming::after {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-secondary);
  margin-left: 4px;
  animation: pulse 1.5s infinite;
}

.message-item.user .message-text.streaming::after {
  background: rgba(255, 255, 255, 0.7);
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(0.8);
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: var(--text-secondary);
  padding: var(--spacing-2xl);
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin-bottom: var(--spacing-lg);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

.empty-state h3 {
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
}

.empty-state p {
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-md);
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  justify-content: center;
  max-width: 500px;
}

.suggestion-item {
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  border: none;
  border-radius: var(--radius-full);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #2E7D32;
}

.suggestion-item:hover {
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }
  
  .message-list {
    padding: var(--spacing-md);
  }
  
  .message-item {
    gap: var(--spacing-sm);
  }
  
  .message-text {
    padding: var(--spacing-sm);
    font-size: var(--font-size-md);
  }
  
  .empty-state {
    padding: var(--spacing-xl);
  }
  
  .empty-icon {
    width: 64px;
    height: 64px;
  }
  
  .empty-state h3 {
    font-size: var(--font-size-lg);
  }
}
</style>
