<template>
  <div class="reminders-page">
    <div class="page-header">
      <h1>养生提醒</h1>
      <p>设置定时提醒，帮助您坚持健康习惯</p>
    </div>

    <!-- 快捷提醒 -->
    <div class="quick-reminders">
      <span class="quick-label">快捷添加：</span>
      <el-button
        v-for="quick in quickReminders"
        :key="quick.title"
        size="small"
        @click="addQuickReminder(quick)"
      >
        {{ quick.icon }} {{ quick.title }}
      </el-button>
    </div>

    <!-- 添加提醒按钮 -->
    <div class="action-bar">
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>
        添加提醒
      </el-button>
    </div>

    <!-- 提醒列表 -->
    <div class="reminder-list">
      <div 
        v-for="reminder in reminders" 
        :key="reminder.id"
        class="reminder-item"
      >
        <div class="reminder-icon">{{ getTypeIcon(reminder.type) }}</div>
        <div class="reminder-info">
          <div class="reminder-header">
            <h4>{{ reminder.title }}</h4>
            <el-switch 
              v-model="reminder.is_active"
              @change="toggleReminder(reminder)"
            />
          </div>
          <p class="reminder-content">{{ reminder.content }}</p>
          <div class="reminder-meta">
            <span class="reminder-type">{{ getTypeName(reminder.type) }}</span>
            <span class="reminder-time">{{ reminder.cron_expr || '每天提醒' }}</span>
            <span class="next-time" v-if="reminder.next_time">
              下次：{{ formatNextTime(reminder.next_time) }}
            </span>
          </div>
        </div>
        <div class="reminder-actions">
          <el-button text size="small" @click="editReminder(reminder)">编辑</el-button>
          <el-button text size="small" type="danger" @click="deleteReminder(reminder.id)">
            删除
          </el-button>
        </div>
      </div>

      <div class="empty-state" v-if="reminders.length === 0">
        <div class="empty-icon">📅</div>
        <h3>暂无提醒</h3>
        <p>添加养生提醒，帮助您养成健康习惯</p>
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible"
      :title="editingReminder ? '编辑提醒' : '添加提醒'"
      width="500px"
    >
      <el-form 
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="选择提醒类型">
            <el-option 
              v-for="type in reminderTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            >
              <span>{{ type.icon }} {{ type.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="例如：喝养生茶" />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input 
            type="textarea" 
            v-model="formData.content"
            :rows="3"
            placeholder="提醒的具体内容..."
          />
        </el-form-item>

        <el-form-item label="时间" prop="time">
          <el-time-select
            v-model="formData.time"
            start="06:00"
            step="00:30"
            end="22:00"
            placeholder="选择提醒时间"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          {{ editingReminder ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '@/api/request';

const reminders = ref([]);
const dialogVisible = ref(false);
const editingReminder = ref(null);
const submitting = ref(false);
const formRef = ref(null);
const notificationPermission = ref(Notification?.permission || 'default');

const formData = reactive({
  type: '',
  title: '',
  content: '',
  time: '08:00'
});

const formRules = {
  type: [{ required: true, message: '请选择提醒类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }]
};

const reminderTypes = [
  { value: 'solar_term', label: '节气养生', icon: '🌿' },
  { value: 'diet', label: '饮食建议', icon: '🍎' },
  { value: 'sleep', label: '作息提醒', icon: '🌙' },
  { value: 'exercise', label: '运动提醒', icon: '🏃' },
  { value: 'acupoint', label: '穴位保健', icon: '💆' }
];

// 快捷提醒预设
const quickReminders = [
  { title: '早起喝温水', content: '起床后喝一杯温水，帮助排毒养颜', time: '07:00', type: 'diet', icon: '💧' },
  { title: '午间揉腹', content: '午餐后30分钟，顺时针揉腹100圈，促进消化', time: '12:30', type: 'acupoint', icon: '👐' },
  { title: '睡前泡脚', content: '睡前30分钟泡脚15-20分钟，改善睡眠', time: '21:30', type: 'sleep', icon: '🦶' },
  { title: '八段锦', content: '练习八段锦功法，强身健体', time: '06:30', type: 'exercise', icon: '🧘' }
];

// 请求通知权限
const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    ElMessage.warning('当前浏览器不支持通知功能');
    return;
  }

  if (Notification.permission === 'granted') {
    return;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    notificationPermission.value = permission;
    if (permission === 'granted') {
      ElMessage.success('已开启通知权限');
    }
  }
};

// 发送浏览器通知
const sendNotification = (title, body) => {
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'reminder'
      });
    } catch (e) {
      console.warn('通知发送失败:', e);
    }
  }
};

// 格式化下次提醒时间
const formatNextTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date - now;

  if (diff < 0) return '已过期';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    return `${Math.floor(hours / 24)}天${hours % 24}小时后`;
  }
  if (hours > 0) {
    return `${hours}小时${minutes}分钟后`;
  }
  return `${minutes}分钟后`;
};

// 检查提醒定时器
let checkInterval = null;

const startReminderCheck = () => {
  checkInterval = setInterval(() => {
    const now = new Date();
    reminders.value.forEach(reminder => {
      if (!reminder.is_active || !reminder.cron_expr) return;

      const [hours, minutes] = reminder.cron_expr.split(':').map(Number);
      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);

      // 如果提醒时间在当前时间的前后1分钟内
      const diff = Math.abs(now - reminderTime);
      if (diff < 60000 && !reminder.notified) {
        sendNotification(reminder.title, reminder.content || '时间到了！');
        reminder.notified = true;
        // 1分钟后重置通知状态
        setTimeout(() => {
          reminder.notified = false;
        }, 60000);
      }
    });
  }, 10000); // 每10秒检查一次
};

// 添加快捷提醒
const addQuickReminder = (quick) => {
  Object.assign(formData, {
    type: quick.type,
    title: quick.title,
    content: quick.content,
    time: quick.time
  });
  editingReminder.value = null;
  dialogVisible.value = true;
};

const getTypeIcon = (type) => reminderTypes.find(t => t.value === type)?.icon || '📅';
const getTypeName = (type) => reminderTypes.find(t => t.value === type)?.label || type;

const fetchReminders = async () => {
  try {
    const res = await request.get('/reminders');
    reminders.value = res.data || [];
  } catch (err) {
    console.error('获取提醒列表失败:', err);
  }
};

const showCreateDialog = () => {
  editingReminder.value = null;
  Object.assign(formData, {
    type: '',
    title: '',
    content: '',
    time: '08:00'
  });
  dialogVisible.value = true;
};

const editReminder = (reminder) => {
  editingReminder.value = reminder;
  Object.assign(formData, {
    type: reminder.type,
    title: reminder.title,
    content: reminder.content,
    time: reminder.cron_expr || '08:00'
  });
  dialogVisible.value = true;
};

const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    if (editingReminder.value) {
      await request.put(`/reminders/${editingReminder.value.id}`, formData);
      ElMessage.success('更新成功');
    } else {
      await request.post('/reminders', {
        ...formData,
        cron_expr: formData.time
      });
      ElMessage.success('创建成功');
    }
    dialogVisible.value = false;
    fetchReminders();
  } catch (err) {
    ElMessage.error(err.message || '操作失败');
  } finally {
    submitting.value = false;
  }
};

const toggleReminder = async (reminder) => {
  try {
    await request.put(`/reminders/${reminder.id}`, {
      is_active: reminder.is_active
    });
    ElMessage.success(reminder.is_active ? '已开启' : '已关闭');
  } catch (err) {
    reminder.is_active = !reminder.is_active;
    ElMessage.error('操作失败');
  }
};

const deleteReminder = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除此提醒吗？', '提示', { type: 'warning' });
    await request.delete(`/reminders/${id}`);
    reminders.value = reminders.value.filter(r => r.id !== id);
    ElMessage.success('删除成功');
  } catch {
    // 取消删除
  }
};

onMounted(() => {
  fetchReminders();
  requestNotificationPermission();
  startReminderCheck();
});

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval);
  }
});
</script>

<style scoped>
.reminders-page {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.page-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.action-bar {
  margin-bottom: var(--spacing-lg);
}

.quick-reminders {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.quick-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.reminder-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.reminder-item {
  display: flex;
  gap: var(--spacing-md);
  background: var(--bg-card);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
}

.reminder-icon {
  font-size: 36px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.reminder-info {
  flex: 1;
}

.reminder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.reminder-header h4 {
  margin: 0;
}

.reminder-content {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-sm);
}

.reminder-meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.next-time {
  color: var(--primary-color);
  font-weight: 500;
}

.reminder-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-md);
}
</style>
