/**
 * 对话状态管理
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as chatApi from '@/api/chat';

export const useChatStore = defineStore('chat', () => {
  // 状态
  const sessions = ref([]);
  const currentSessionId = ref(null);
  const messages = ref([]);
  const loading = ref(false);
  const streaming = ref(false);
  const error = ref(null);
  const steps = ref([]);

  // 计算属性
  const currentSession = computed(() => 
    sessions.value.find(s => s.id === currentSessionId.value)
  );
  
  const hasSessions = computed(() => sessions.value.length > 0);

  /**
   * 创建新会话
   */
  const createSession = async (title = '新对话') => {
    try {
      // 使用 mock 数据，避免调用不存在的 API 端点
      const mockSession = {
        id: `session_${Date.now()}`,
        title,
        created_at: new Date().toISOString()
      };
      sessions.value.unshift(mockSession);
      currentSessionId.value = mockSession.id;
      messages.value = [];
      steps.value = [];
      return mockSession;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  /**
   * 获取会话列表
   */
  const fetchSessions = async () => {
    loading.value = true;
    try {
      // 使用 mock 数据，避免调用不存在的 API 端点
      const mockSessions = [
        {
          id: 'session_1',
          title: '新对话',
          created_at: new Date().toISOString()
        }
      ];
      sessions.value = mockSessions;
      return mockSessions;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 删除会话
   */
  const deleteSession = async (sessionId) => {
    try {
      // 直接从本地删除，避免调用不存在的 API 端点
      sessions.value = sessions.value.filter(s => s.id !== sessionId);
      if (currentSessionId.value === sessionId) {
        currentSessionId.value = sessions.value[0]?.id || null;
        messages.value = [];
        steps.value = [];
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  /**
   * 选择会话
   */
  const selectSession = async (sessionId) => {
    currentSessionId.value = sessionId;
    await fetchMessages(sessionId);
    steps.value = [];
  };

  /**
   * 获取历史消息
   */
  const fetchMessages = async (sessionId) => {
    if (!sessionId) return;
    
    loading.value = true;
    try {
      // 使用 mock 数据，避免调用不存在的 API 端点
      messages.value = [];
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 发送消息
   */
  const sendMessage = async (content) => {
    if (!content.trim()) return;

    // 添加用户消息
    const userMessage = {
      role: 'user',
      content,
      created_at: new Date().toISOString()
    };
    messages.value.push(userMessage);

    // 添加AI消息占位
    const assistantMessage = {
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
      streaming: true
    };
    messages.value.push(assistantMessage);

    // 清空之前的步骤
    steps.value = [];
    streaming.value = true;

    try {
      // 调用新的流式API（带步骤）
      await chatApi.streamMessageWithSteps(
        content,
        // onMessage: 处理流式数据
        (data) => {
          if (data.type === 'step') {
            // 添加步骤数据
            steps.value.push({
              type: data.step,
              content: data.content,
              completed: true
            });
          } else if (data.type === 'token') {
            // 处理流式回答的每个字符
            assistantMessage.content += data.content;
          } else if (data.type === 'done') {
            // 完成信号，不做处理
          }
        },
        // onComplete: 流式结束
        () => {
          assistantMessage.streaming = false;
          streaming.value = false;
        },
        // onError: 错误处理
        (err) => {
          assistantMessage.content = '抱歉，服务暂时不可用，请稍后重试。';
          assistantMessage.streaming = false;
          streaming.value = false;
          error.value = err.message;
        }
      );
    } catch (err) {
      assistantMessage.content = '抱歉，发送消息失败，请稍后重试。';
      assistantMessage.streaming = false;
      streaming.value = false;
      error.value = err.message;
    }
  };

  /**
   * 清空当前会话消息
   */
  const clearMessages = () => {
    messages.value = [];
    steps.value = [];
  };

  return {
    // 状态
    sessions,
    currentSessionId,
    messages,
    loading,
    streaming,
    error,
    steps,
    // 计算属性
    currentSession,
    hasSessions,
    // 方法
    createSession,
    fetchSessions,
    deleteSession,
    selectSession,
    fetchMessages,
    sendMessage,
    clearMessages
  };
});
