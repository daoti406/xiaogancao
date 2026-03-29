<template>
  <div class="chat-page">
    <!-- 侧边栏 -->
    <SessionSidebar
      class="sidebar hide-mobile"
      :sessions="chatStore.sessions"
      :current-id="chatStore.currentSessionId"
      @create="handleCreateSession"
      @select="handleSelectSession"
      @delete="handleDeleteSession"
    />

    <!-- 主对话区域 -->
    <div class="chat-main">
      <!-- 顶部栏 -->
      <div class="chat-header">
        <div class="chat-title" v-if="chatStore.currentSession">
          {{ chatStore.currentSession.title }}
        </div>
        <!-- 数字人控制按钮 -->
        <button class="avatar-toggle-btn" @click="showDigitalHuman = !showDigitalHuman">
          {{ showDigitalHuman ? '👤' : '🤖' }} 数字人
        </button>
      </div>

      <!-- 对话内容区 -->
      <div class="chat-content">
        <!-- 对话列表 -->
        <MessageList
          ref="messageListRef"
          :messages="chatStore.messages"
          @send="handleSendMessage"
        />

        <!-- 数字人面板 -->
        <div class="digital-human-panel" :class="{ visible: showDigitalHuman }">
          <DigitalHuman
            ref="digitalHumanRef"
            :autoSpeak="autoSpeak"
            @voice-change="handleVoiceChange"
            @speaking-change="handleSpeakingChange"
          />
        </div>
      </div>

      <!-- 输入区域 -->
      <MessageInput
        ref="messageInputRef"
        :sending="chatStore.streaming"
        @send="handleSendMessage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useChatStore } from '@/stores/chat';
import { ElMessageBox } from 'element-plus';
import SessionSidebar from '@/components/chat/SessionSidebar.vue';
import MessageList from '@/components/chat/MessageList.vue';
import MessageInput from '@/components/chat/MessageInput.vue';
import DigitalHuman from '@/components/chat/DigitalHuman.vue';
import digitalHumanService from '@/utils/digitalHumanService';

const chatStore = useChatStore();

const messageListRef = ref(null);
const messageInputRef = ref(null);
const digitalHumanRef = ref(null);
const showDigitalHuman = ref(true); // 默认显示数字人
const autoSpeak = ref(true); // 自动语音开关

let lastMessageCount = 0;

// 设置数字人服务回调
digitalHumanService.setCallbacks({
  onStart: () => {
    digitalHumanRef.value?.startSpeaking();
  },
  onEnd: () => {
    digitalHumanRef.value?.stopSpeaking();
  },
  onError: (error) => {
    console.error('数字人错误:', error);
    digitalHumanRef.value?.stopSpeaking();
  }
});

// 监听新消息，触发语音朗读和数字人动画
watch(
  () => chatStore.messages.length,
  () => {
    const messages = chatStore.messages;
    if (!messages.length) return;

    // 获取最新消息
    const latestMessage = messages[messages.length - 1];

    // 如果是助手回复且未朗读过
    if (
      latestMessage.role === 'assistant' &&
      latestMessage.content &&
      !latestMessage.spoken
    ) {
      // 调用语音合成（会自动驱动数字人动画）
      digitalHumanService.speak(latestMessage.content);

      // 标记为已朗读
      nextTick(() => {
        latestMessage.spoken = true;
      });
    }

    lastMessageCount = messages.length;
  }
);

// 语音开关变化
const handleVoiceChange = (enabled) => {
  autoSpeak.value = enabled;
};

// 说话状态变化
const handleSpeakingChange = (speaking) => {
  // 可以在这里处理其他 UI 状态
};

onMounted(async () => {
  await chatStore.fetchSessions();

  // 如果有会话，选择第一个
  if (chatStore.sessions.length > 0) {
    await chatStore.selectSession(chatStore.sessions[0].id);
  }
});

const handleCreateSession = async () => {
  await chatStore.createSession();
};

const handleSelectSession = async (sessionId) => {
  await chatStore.selectSession(sessionId);
};

const handleDeleteSession = async (sessionId) => {
  try {
    await ElMessageBox.confirm('确定删除此对话吗？', '提示', {
      type: 'warning'
    });
    await chatStore.deleteSession(sessionId);
  } catch {
    // 取消删除
  }
};

const handleSendMessage = async (message) => {
  if (!chatStore.currentSessionId) {
    await chatStore.createSession();
  }
  await chatStore.sendMessage(message);
  messageInputRef.value?.focus();
};
</script>

<style scoped>
.chat-page {
  display: flex;
  height: calc(100vh - var(--header-height));
  background: var(--bg-primary);
}

.sidebar {
  width: 280px;
  border-right: 1px solid var(--border-color);
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* 顶部栏 */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
}

.chat-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

/* 数字人切换按钮 */
.avatar-toggle-btn {
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid #E8E2D9;
  background: #fff;
  color: #4A7C59;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.avatar-toggle-btn:hover {
  background: #4A7C59;
  color: #fff;
  border-color: #4A7C59;
}

/* 对话内容区 */
.chat-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

/* 数字人面板 */
.digital-human-panel {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 100;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateX(20px);
  pointer-events: none;
}

.digital-human-panel.visible {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

/* 桌面端数字人面板样式 */
@media (min-width: 1024px) {
  .chat-content {
    padding-right: 304px; /* 为数字人面板留出空间 */
  }

  .digital-human-panel {
    position: static;
    opacity: 1;
    transform: none;
    pointer-events: auto;
    flex-shrink: 0;
    width: 280px;
    height: 350px;
    margin: 12px;
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .chat-page {
    height: calc(100vh - var(--header-height) - var(--mobile-nav-height));
  }

  .chat-header {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .chat-title {
    font-size: var(--font-size-md);
  }

  .avatar-toggle-btn {
    font-size: 12px;
    padding: 4px 8px;
  }

  .chat-content {
    padding-right: 0;
  }

  .digital-human-panel {
    position: fixed;
    top: auto;
    bottom: 80px;
    right: 12px;
    left: 12px;
    width: auto !important;
    height: 240px !important;
  }

  /* 消息气泡移动端 */
  .message-bubble {
    max-width: 80%;
  }
}
</style>
