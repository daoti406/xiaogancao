<template>
  <div class="session-sidebar">
    <div class="sidebar-header">
      <h3>对话历史</h3>
      <el-button type="primary" size="small" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新对话
      </el-button>
    </div>

    <div class="session-list">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="session-item"
        :class="{ active: session.id === currentId }"
        @click="handleSelect(session.id)"
      >
        <div class="session-info">
          <div class="session-title">{{ session.title || '新对话' }}</div>
          <div class="session-time">{{ formatTime(session.updated_at) }}</div>
        </div>
        <el-dropdown trigger="click" @command="handleCommand($event, session.id)">
          <el-button link size="small" class="session-more">
            <el-icon><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="rename">
                <el-icon><Edit /></el-icon>
                重命名
              </el-dropdown-item>
              <el-dropdown-item command="delete" style="color: var(--error-color)">
                <el-icon><Delete /></el-icon>
                删除
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div class="empty-state" v-if="sessions.length === 0">
        <p>暂无对话记录</p>
        <p class="hint">点击上方按钮开始新对话</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Plus, MoreFilled, Edit, Delete } from '@element-plus/icons-vue';

const props = defineProps({
  sessions: {
    type: Array,
    default: () => []
  },
  currentId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['create', 'select', 'rename', 'delete']);

const formatTime = (time) => {
  if (!time) return '';
  const date = new Date(time);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
  
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

const handleCreate = () => {
  emit('create');
};

const handleSelect = (sessionId) => {
  emit('select', sessionId);
};

const handleCommand = (command, sessionId) => {
  if (command === 'rename') {
    emit('rename', sessionId);
  } else if (command === 'delete') {
    emit('delete', sessionId);
  }
};
</script>

<style scoped>
.session-sidebar {
  width: 280px;
  background: var(--bg-card);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-header h3 {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm);
}

.session-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  margin-bottom: var(--spacing-xs);
  transition: background var(--transition-fast);
}

.session-item:hover {
  background: var(--bg-secondary);
}

.session-item.active {
  background: var(--primary-lighter);
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-title {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-top: 2px;
}

.session-more {
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.session-item:hover .session-more {
  opacity: 1;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-tertiary);
}

.empty-state .hint {
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-xs);
}

@media (max-width: 768px) {
  .session-sidebar {
    position: fixed;
    left: 0;
    top: var(--header-height);
    bottom: 0;
    z-index: var(--z-fixed);
    transform: translateX(-100%);
    transition: transform var(--transition-normal);
  }

  .session-sidebar.open {
    transform: translateX(0);
  }
}
</style>
