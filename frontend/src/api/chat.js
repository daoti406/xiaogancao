/**
 * 对话API
 */
import request from './request';

/**
 * 创建新会话
 */
export const createSession = (title = '新对话') => {
  return request.post('/chat/sessions', { title });
};

/**
 * 获取会话列表
 */
export const getSessions = () => {
  return request.get('/chat/sessions');
};

/**
 * 删除会话
 */
export const deleteSession = (sessionId) => {
  return request.delete(`/chat/sessions/${sessionId}`);
};

/**
 * 获取历史消息
 */
export const getMessages = (sessionId) => {
  return request.get(`/chat/sessions/${sessionId}/messages`);
};

/**
 * 发送消息（流式响应）
 * @param {string} message - 用户消息
 * @param {string} sessionId - 会话ID
 * @param {Function} onMessage - 消息回调
 * @param {Function} onComplete - 完成回调
 * @param {Function} onError - 错误回调
 * @param {Object} options - 额外选项
 * @param {Object} options.inputs - 额外参数
 * @param {Array} options.files - 文件列表 [{ type: 'image', transfer_method: 'remote_url', url: '...' }]
 */
export const streamMessage = (message, sessionId, onMessage, onComplete, onError, options = {}) => {
  const token = localStorage.getItem('xiaogancao_token');
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

  const { inputs = {}, files = [] } = options;

  fetch(`${baseUrl}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify({
      message,
      sessionId,
      inputs,
      files
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.body.getReader();
    })
    .then(reader => {
      const decoder = new TextDecoder();
      let buffer = '';

      const readChunk = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            onComplete?.();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                onMessage?.(data);
              } catch (e) {
                // 忽略解析错误
              }
            }
          }

          readChunk();
        });
      };

      readChunk();
    })
    .catch(err => {
      onError?.(err);
    });
};

/**
 * 发送消息（新的流式响应，带步骤）
 * @param {string} message - 用户消息
 * @param {Function} onMessage - 消息回调
 * @param {Function} onComplete - 完成回调
 * @param {Function} onError - 错误回调
 */
export const streamMessageWithSteps = (message, onMessage, onComplete, onError) => {
  // 调用后端的chat/message接口
  const apiUrl = '/api/chat/message';
  const token = localStorage.getItem('xiaogancao_token');

  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify({
      message,
      userId: 'user_123' // 暂时硬编码，后续从登录状态获取
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // 模拟流式输出
      const reply = data.reply;
      const sentences = reply.split(/(?<=[。！？])/);
      
      let index = 0;
      const sendNextSentence = () => {
        if (index < sentences.length) {
          const sentence = sentences[index];
          if (sentence.trim()) {
            onMessage?.({
              type: 'token',
              content: sentence
            });
          }
          index++;
          setTimeout(sendNextSentence, 100); // 模拟打字效果
        } else {
          onMessage?.({
            type: 'done'
          });
          onComplete?.();
        }
      };
      
      sendNextSentence();
    })
    .catch(err => {
      onError?.(err);
    });
};
