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
        <div class="chat-actions">
          <el-button size="small" @click="clearChat" icon="Delete">
            清空
          </el-button>
        </div>
      </div>

      <!-- 对话内容区 -->
      <div class="chat-content">
        <!-- 对话列表 -->
        <MessageList
          ref="messageListRef"
          :messages="chatStore.messages"
          @send="handleSendMessage"
          @add-reminder="handleAddReminder"
        />
      </div>

      <!-- 快捷问题区域 -->
      <div class="quick-questions" v-if="showQuickQuestions">
        <div class="quick-header">
          <span class="quick-icon">💡</span>
          <span>常见问题</span>
        </div>
        <div class="quick-bubbles">
          <button
            v-for="question in quickQuestions"
            :key="question"
            class="quick-bubble"
            @click="handleQuickQuestion(question)"
          >
            {{ question }}
          </button>
        </div>
      </div>

      <!-- 输入区域 -->
      <MessageInput
        ref="messageInputRef"
        :sending="chatStore.streaming"
        @send="handleSendMessage"
        @focus="showQuickQuestions = true"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useChatStore } from '@/stores/chat';
import { useConstitutionStore } from '@/stores/constitution';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';
import SessionSidebar from '@/components/chat/SessionSidebar.vue';
import MessageList from '@/components/chat/MessageList.vue';
import MessageInput from '@/components/chat/MessageInput.vue';

const router = useRouter();
const chatStore = useChatStore();
const constitutionStore = useConstitutionStore();

const messageListRef = ref(null);
const messageInputRef = ref(null);
const showQuickQuestions = ref(true); // 显示快捷问题

// 快捷问题列表
const quickQuestions = [
  '最近睡不好怎么办？',
  '感觉最近很累',
  '眼睛干涩怎么办？',
  '最近胃口不好',
  '经常头晕怎么回事？',
  '手脚冰凉怎么调理？'
];

// 处理快捷问题
const handleQuickQuestion = (question) => {
  handleSendMessage(question);
  showQuickQuestions.value = false;
};

// 处理添加提醒
const handleAddReminder = async (content) => {
  try {
    // 跳转到提醒页面并传递建议内容
    router.push({
      path: '/reminders',
      query: { suggestion: content }
    });
  } catch (err) {
    ElMessage.error('添加提醒失败');
  }
};

// 清空对话
const clearChat = async () => {
  try {
    await ElMessageBox.confirm('确定清空当前对话吗？', '提示', {
      type: 'warning'
    });
    await chatStore.clearMessages();
    ElMessage.success('对话已清空');
  } catch {
    // 取消清空
  }
};

// 添加开场白
const addGreeting = async () => {
  // 检查是否已经有消息，如果没有则添加开场白
  if (chatStore.messages.length === 0) {
    const greetingMessage = {
      id: Date.now(),
      role: 'assistant',
      content: '您好！我是小甘草智能助手，很高兴为您提供健康咨询服务。请问有什么可以帮助您的吗？',
      timestamp: new Date().toISOString(),
      streaming: false
    };
    chatStore.messages.push(greetingMessage);
  }
};

onMounted(async () => {
  try {
    await chatStore.fetchSessions();

    // 如果有会话，选择第一个
    if (chatStore.sessions.length > 0) {
      await chatStore.selectSession(chatStore.sessions[0].id);
    }
    
    // 添加开场白
    await nextTick();
    addGreeting();
  } catch (err) {
    console.error('获取会话列表失败:', err);
  }
});

const handleCreateSession = async () => {
  await chatStore.createSession();
  // 新会话添加开场白
  await nextTick();
  addGreeting();
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
  background: var(--bg-card);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg-card);
  border-radius: 12px;
  margin: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* 顶部栏 */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  border-radius: 12px 12px 0 0;
}

.chat-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.chat-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* 对话内容区 */
.chat-content {
  flex: 1;
  overflow: hidden;
  padding: var(--spacing-lg);
}

/* 快捷问题区域 */
.quick-questions {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.quick-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.quick-icon {
  font-size: 14px;
}

.quick-bubbles {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.quick-bubble {
  padding: var(--spacing-xs) var(--spacing-md);
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  border: none;
  border-radius: 20px;
  font-size: var(--font-size-sm);
  color: #2E7D32;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.quick-bubble:hover {
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .chat-page {
    height: calc(100vh - var(--header-height) - var(--mobile-nav-height));
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    margin: 0;
    border-radius: 0;
  }

  .chat-main {
    flex: 1;
    margin: 0;
    border-radius: 0;
  }

  .chat-header {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .chat-title {
    font-size: var(--font-size-md);
  }

  .chat-content {
    padding: var(--spacing-md);
  }

  /* 消息气泡移动端 */
  .message-bubble {
    max-width: 85%;
  }
}
</style>
