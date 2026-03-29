/**
 * 百度 AppBuilder 数字人服务
 * 集成百度 EmbedLiteSDK 数字人驱动
 */

class DigitalHumanService {
  constructor() {
    // 从环境变量获取配置
    this.appId = import.meta.env.VITE_APPBUILDER_APP_ID || '';
    this.code = import.meta.env.VITE_APPBUILDER_CODE || '';

    this.sdk = null;
    this.isSpeaking = false;

    // 回调函数
    this.onStart = null;
    this.onEnd = null;
    this.onError = null;
    this.onMessage = null;
  }

  /**
   * 初始化 EmbedLiteSDK
   */
  initSDK(containerElement) {
    if (!this.appId || !this.code) {
      console.warn('百度数字人配置缺失');
      return;
    }

    // 加载 SDK 脚本
    const scriptSrc = 'https://agi-dev-platform-web.cdn.bcebos.com/ai_apaas/embed/output/embedLiteSDK.js';

    // 检查是否已加载
    if (!window.EmbedLiteSDK) {
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.onload = () => {
        this.createSDKInstance(containerElement);
      };
      script.onerror = () => {
        console.error('数字人 SDK 加载失败');
        if (this.onError) this.onError(new Error('SDK 加载失败'));
      };
      document.head.appendChild(script);
    } else {
      this.createSDKInstance(containerElement);
    }
  }

  /**
   * 创建 SDK 实例
   */
  createSDKInstance(containerElement) {
    try {
      this.sdk = new window.EmbedLiteSDK({
        appId: this.appId,
        code: this.code,
        container: containerElement,
        onReady: () => {
          console.log('数字人 SDK 就绪');
        },
        onStateChange: (state) => {
          console.log('数字人状态:', state);
          if (state === 'playing') {
            this.isSpeaking = true;
            if (this.onStart) this.onStart();
          } else if (state === 'idle' || state === 'ended') {
            this.isSpeaking = false;
            if (this.onEnd) this.onEnd();
          }
        },
        onMessage: (message) => {
          if (this.onMessage) {
            this.onMessage(message);
          }
        },
        onError: (error) => {
          console.error('数字人错误:', error);
          if (this.onError) this.onError(error);
        }
      });
    } catch (error) {
      console.error('数字人 SDK 初始化失败:', error);
      if (this.onError) this.onError(error);
    }
  }

  /**
   * 设置回调函数
   */
  setCallbacks({ onStart, onEnd, onError, onMessage }) {
    if (onStart) this.onStart = onStart;
    if (onEnd) this.onEnd = onEnd;
    if (onError) this.onError = onError;
    if (onMessage) this.onMessage = onMessage;
  }

  /**
   * 驱动数字人播报文本
   */
  speak(text) {
    if (!text) return;

    if (!this.sdk) {
      console.warn('数字人 SDK 未初始化');
      // 回退到 Web Speech API
      this.fallbackSpeak(text);
      return;
    }

    try {
      // 使用 SDK 发送文本
      this.sdk.sendText(text);

      if (this.onStart) this.onStart();
    } catch (error) {
      console.error('数字人驱动失败:', error);
      // 回退到 Web Speech API
      this.fallbackSpeak(text);
    }
  }

  /**
   * 回退方案：使用 Web Speech API
   */
  fallbackSpeak(text) {
    if (!('speechSynthesis' in window)) {
      if (this.onEnd) this.onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;

    utterance.onstart = () => {
      if (this.onStart) this.onStart();
    };

    utterance.onend = () => {
      if (this.onEnd) this.onEnd();
    };

    utterance.onerror = () => {
      if (this.onEnd) this.onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * 停止数字人播报
   */
  stop() {
    if (this.sdk) {
      try {
        this.sdk.stop();
      } catch (e) {
        console.warn('SDK stop 失败:', e);
      }
    }

    // 同时停止 Web Speech API
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.isSpeaking = false;
    if (this.onEnd) this.onEnd();
  }

  /**
   * 发送消息（对话）
   */
  sendMessage(text) {
    if (!text) return;

    if (!this.sdk) {
      console.warn('数字人 SDK 未初始化');
      return;
    }

    try {
      this.sdk.sendText(text);
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  }

  /**
   * 检查是否支持数字人
   */
  isSupported() {
    return !!(this.appId && this.code);
  }

  /**
   * 重置对话
   */
  resetConversation() {
    if (this.sdk) {
      try {
        this.sdk.reset();
      } catch (e) {
        console.warn('重置对话失败:', e);
      }
    }
  }
}

// 导出单例
const digitalHumanService = new DigitalHumanService();

export default digitalHumanService;
export { DigitalHumanService };
