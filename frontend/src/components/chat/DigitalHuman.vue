<template>
  <div class="digital-human-container" :class="{ minimized: isMinimized }">
    <!-- 百度数字人容器 -->
    <div class="digital-human-wrapper" ref="sdkContainer">
      <!-- SDK 会在这里渲染数字人 -->
    </div>

    <!-- 控制栏 -->
    <div class="controls">
      <button class="control-btn" @click="toggleVoice" :title="autoSpeak ? '关闭语音' : '开启语音'">
        {{ autoSpeak ? '🔊' : '🔇' }}
      </button>
      <button class="control-btn" @click="toggleMinimize" :title="isMinimized ? '展开' : '最小化'">
        {{ isMinimized ? '↗' : '−' }}
      </button>
    </div>

    <!-- 状态提示 -->
    <div v-if="isSpeaking" class="status-badge">
      数字人播报中...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import digitalHumanService from '@/utils/digitalHumanService';

const props = defineProps({
  autoSpeak: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['voice-change', 'speaking-change']);

// Refs
const sdkContainer = ref(null);
const isMinimized = ref(false);
const isSpeaking = ref(false);
const autoSpeak = ref(props.autoSpeak);

// 检查配置
const isConfigured = ref(!!(
  import.meta.env.VITE_APPBUILDER_APP_ID &&
  import.meta.env.VITE_APPBUILDER_CODE
));

// 初始化数字人 SDK
const initDigitalHuman = () => {
  if (!isConfigured.value) {
    console.warn('百度数字人未配置');
    return;
  }

  if (sdkContainer.value) {
    digitalHumanService.initSDK(sdkContainer.value);
  }
};

// 回调设置
const setupCallbacks = () => {
  digitalHumanService.setCallbacks({
    onStart: () => {
      isSpeaking.value = true;
      emit('speaking-change', true);
    },
    onEnd: () => {
      isSpeaking.value = false;
      emit('speaking-change', false);
    },
    onError: (error) => {
      console.error('数字人错误:', error);
      isSpeaking.value = false;
      emit('speaking-change', false);
    }
  });
};

/**
 * 开始说话 - 由父组件调用
 */
const startSpeaking = (text) => {
  if (!autoSpeak.value) return;

  if (text) {
    digitalHumanService.speak(text);
  }
};

/**
 * 停止说话 - 由父组件调用
 */
const stopSpeaking = () => {
  digitalHumanService.stop();
};

/**
 * 切换语音开关
 */
const toggleVoice = () => {
  autoSpeak.value = !autoSpeak.value;
  emit('voice-change', autoSpeak.value);

  if (!autoSpeak.value && isSpeaking.value) {
    stopSpeaking();
  }
};

/**
 * 切换最小化
 */
const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value;
};

// 暴露方法给父组件
defineExpose({
  startSpeaking,
  stopSpeaking,
  autoSpeak,
  isSpeaking
});

// Lifecycle
onMounted(() => {
  nextTick(() => {
    setupCallbacks();
    initDigitalHuman();
  });
});

onUnmounted(() => {
  // 清理
});
</script>

<style scoped>
.digital-human-container {
  position: relative;
  width: 280px;
  height: 350px;
  border-radius: 16px;
  overflow: hidden;
  background: #F8F6F2;
  border: 1px solid #E8E2D9;
  box-shadow: 0 4px 20px rgba(74, 124, 89, 0.15);
  transition: all 0.3s ease;
}

.digital-human-container.minimized {
  width: 60px;
  height: 60px;
}

/* 数字人容器 */
.digital-human-wrapper {
  width: 100%;
  height: 100%;
}

.digital-human-wrapper :deep(iframe) {
  width: 100%;
  height: 100%;
  border: none;
}

/* 控制栏 */
.controls {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
  z-index: 10;
}

.control-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: #4A7C59;
  color: white;
  transform: scale(1.1);
}

.minimized .controls {
  position: static;
  padding: 8px;
  justify-content: center;
}

.status-badge {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  background: rgba(74, 124, 89, 0.9);
  color: white;
  border-radius: 12px;
  font-size: 12px;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.minimized .status-badge {
  display: none;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .digital-human-container {
    width: 100%;
    height: 300px;
  }

  .digital-human-container.minimized {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }
}
</style>
