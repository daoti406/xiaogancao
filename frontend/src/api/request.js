/**
 * Axios请求封装
 */

import axios from 'axios';

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从localStorage获取token（使用正确的key）
    const token = localStorage.getItem('xiaogancao_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { data } = response;
    
    // 如果返回的是流式数据，直接返回
    if (response.config.responseType === 'stream') {
      return response;
    }
    
    // 检查业务状态码
    if (data.code === 0 || data.code === undefined) {
      return data;
    }
    
    // 业务错误
    const error = new Error(data.message || '请求失败');
    error.code = data.code;
    error.data = data.data;
    return Promise.reject(error);
  },
  (error) => {
    // HTTP错误处理
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
      case 401:
          // 未授权，清除token并跳转登录
          localStorage.removeItem('xiaogancao_token');
          localStorage.removeItem('xiaogancao_user');
          // 使用router跳转而不是window.location.href，避免刷新
          window.location.href = '/#/auth';
          error.message = '登录已过期，请重新登录';
          break;
        case 403:
          error.message = '没有权限访问';
          break;
        case 404:
          error.message = '请求的资源不存在';
          break;
        case 500:
          error.message = '服务器错误，请稍后重试';
          break;
        default:
          error.message = data?.message || `请求失败 (${status})`;
      }
    } else if (error.code === 'ECONNABORTED') {
      error.message = '请求超时，请稍后重试';
    } else if (!window.navigator.onLine) {
      error.message = '网络连接已断开';
    }
    
    console.error('响应错误:', error);
    return Promise.reject(error);
  }
);

/**
 * 流式请求（用于AI对话）
 */
export const streamRequest = async (url, data, onMessage, onComplete, onError) => {
  const token = localStorage.getItem('xiaogancao_token');
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
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
          try {
            const eventData = JSON.parse(line.slice(6));
            onMessage?.(eventData);
          } catch (e) {
            // 忽略解析错误
          }
        } else if (line.startsWith('event: ')) {
          // 处理事件类型
        }
      }
    }

    onComplete?.();
  } catch (error) {
    console.error('流式请求错误:', error);
    onError?.(error);
  }
};

export default request;
