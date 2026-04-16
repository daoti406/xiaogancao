import config from '../config/index.js';

/**
 * Dify API 服务
 * 支持流式响应和文件上传
 */

/**
 * 发送消息到 Dify 并获取流式响应
 * @param {Object} options - 请求选项
 * @param {string} options.query - 用户问题
 * @param {string} options.userId - 用户ID
 * @param {Object} options.res - Express响应对象
 * @param {Object} [options.inputs={}] - 额外参数
 * @param {string} [options.conversationId=''] - 会话ID
 * @param {Array} [options.files=[]] - 文件列表
 */
export const sendMessage = async ({
  query,
  userId,
  res,
  inputs = {},
  conversationId = '',
  files = []
}) => {
  if (!config.dify.apiUrl || config.dify.apiUrl === 'your_dify_api_url') {
    throw new Error('DIFY_API_URL 未配置');
  }
  if (!config.dify.apiKey || config.dify.apiKey === 'your_dify_api_key') {
    throw new Error('DIFY_API_KEY 未配置');
  }

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // 构造请求体
  const requestBody = {
    inputs,
    query,
    response_mode: 'streaming',
    conversation_id: conversationId || undefined,
    user: userId,
    // 添加文件列表（支持图片等）
    files: files.length > 0 ? files : undefined
  };

  // 移除 undefined 字段
  Object.keys(requestBody).forEach(key => {
    if (requestBody[key] === undefined) {
      delete requestBody[key];
    }
  });

  try {
    // 调用 Dify API（流式）
    const response = await fetch(config.dify.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.dify.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Dify API error: ${response.status} - ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          if (dataStr === '[DONE]') {
            res.write('data: {"type":"done"}\n\n');
            break;
          }

          try {
            const data = JSON.parse(dataStr);
            // 转发完整消息数据
            res.write(`data: ${JSON.stringify(data)}\n\n`);
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    res.end();
  } catch (error) {
    console.error('Dify流式响应错误:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
    res.end();
  }
};

/**
 * 非流式响应（备用）
 * @param {Object} options - 请求选项
 */
export const sendMessageBlocking = async ({
  query,
  userId,
  inputs = {},
  conversationId = '',
  files = []
}) => {
  if (!config.dify.apiUrl || !config.dify.apiKey) {
    throw new Error('Dify配置不完整');
  }

  // 构造请求体
  const requestBody = {
    inputs,
    query,
    response_mode: 'blocking',
    conversation_id: conversationId || undefined,
    user: userId,
    files: files.length > 0 ? files : undefined
  };

  // 移除 undefined 字段
  Object.keys(requestBody).forEach(key => {
    if (requestBody[key] === undefined) {
      delete requestBody[key];
    }
  });

  const response = await fetch(`${config.dify.apiUrl}/v1/chat-messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.dify.apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Dify API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * 创建文件对象（用于图片等附件）
 * @param {string} type - 文件类型（如 'image'）
 * @param {string} transferMethod - 传输方式 ('remote_url' 或 'local_file')
 * @param {string} urlOrFileId - 远程URL 或 本地文件ID
 * @returns {Object} 文件对象
 */
export const createFileObject = (type, transferMethod, urlOrFileId) => {
  return {
    type,
    transfer_method: transferMethod,
    url: transferMethod === 'remote_url' ? urlOrFileId : undefined,
    upload_file_id: transferMethod === 'local_file' ? urlOrFileId : undefined
  };
};

/**
 * 获取对话历史
 * @param {string} conversationId - 会话ID
 * @param {string} userId - 用户ID
 */
export const getConversationHistory = async (conversationId, userId) => {
  if (!config.dify.apiUrl || !config.dify.apiKey) {
    throw new Error('Dify配置不完整');
  }

  const url = new URL(`${config.dify.apiUrl}/v1/chat-messages`);
  url.searchParams.append('conversation_id', conversationId);
  url.searchParams.append('user', userId);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${config.dify.apiKey}`
    }
  });

  if (!response.ok) {
    throw new Error(`Dify API error: ${response.status}`);
  }

  return await response.json();
};

/**
 * 获取会话列表
 * @param {string} userId - 用户ID
 */
export const getConversations = async (userId) => {
  if (!config.dify.apiUrl || !config.dify.apiKey) {
    throw new Error('Dify配置不完整');
  }

  const url = new URL(`${config.dify.apiUrl}/v1/chat-conversations`);
  url.searchParams.append('user', userId);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${config.dify.apiKey}`
    }
  });

  if (!response.ok) {
    throw new Error(`Dify API error: ${response.status}`);
  }

  return await response.json();
};

/**
 * 删除会话
 * @param {string} conversationId - 会话ID
 * @param {string} userId - 用户ID
 */
export const deleteConversation = async (conversationId, userId) => {
  if (!config.dify.apiUrl || !config.dify.apiKey) {
    throw new Error('Dify配置不完整');
  }

  const response = await fetch(`${config.dify.apiUrl}/v1/chat-conversations/${conversationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${config.dify.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user: userId })
  });

  if (!response.ok) {
    throw new Error(`Dify API error: ${response.status}`);
  }

  return await response.json();
};

export default {
  sendMessage,
  sendMessageBlocking,
  createFileObject,
  getConversationHistory,
  getConversations,
  deleteConversation
};
