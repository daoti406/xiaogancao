<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- 左侧装饰 -->
      <div class="auth-decoration hide-mobile">
        <div class="decoration-content">
          <h1 class="decoration-title">小甘草</h1>
          <p class="decoration-subtitle">AI中医养生顾问</p>
          <div class="decoration-features">
            <div class="feature-item">
              <img src="@/assets/icons/lifestyle-icon.svg" class="feature-icon" alt="" />
              <span>九种体质辨识</span>
            </div>
            <div class="feature-item">
              <img src="@/assets/icons/wellness.svg" class="feature-icon" alt="" />
              <span>个性化养生方案</span>
            </div>
            <div class="feature-item">
              <img src="@/assets/icons/chat-icon.svg" class="feature-icon" alt="" />
              <span>AI智能问诊</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📅</span>
              <span>健康提醒管理</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表单 -->
      <div class="auth-form-container">
        <div class="auth-form">
          <h2 class="form-title">{{ isLogin ? '登录' : '注册' }}</h2>

          <!-- OAuth登录按钮 -->
          <div class="oauth-section">
            <el-button
              class="oauth-btn manus"
              @click="handleOAuthLogin"
              :loading="oauthLoading"
            >
              <span class="oauth-icon">🔐</span>
              Manus 一键登录
            </el-button>
          </div>

          <div class="divider">
            <span>或使用邮箱</span>
          </div>

          <!-- 邮箱密码表单 -->
          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-position="top"
            @submit.prevent="handleSubmit"
          >
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="formData.email"
                type="email"
                placeholder="请输入邮箱"
                size="large"
              />
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input
                v-model="formData.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                show-password
              />
            </el-form-item>

            <el-form-item v-if="!isLogin" label="昵称" prop="nickname">
              <el-input
                v-model="formData.nickname"
                placeholder="请输入昵称（选填）"
                size="large"
              />
            </el-form-item>

            <el-button
              type="primary"
              native-type="submit"
              :loading="loading"
              class="submit-btn"
            >
              {{ isLogin ? '登录' : '注册' }}
            </el-button>
          </el-form>

          <!-- 切换登录/注册 -->
          <p class="switch-text">
            {{ isLogin ? '没有账号？' : '已有账号？' }}
            <a @click="isLogin = !isLogin">
              {{ isLogin ? '立即注册' : '去登录' }}
            </a>
          </p>

          <!-- 免责声明 -->
          <p class="disclaimer">
            登录即表示您同意我们的
            <a href="#">服务条款</a>
            和
            <a href="#">隐私政策</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const formRef = ref(null);
const isLogin = ref(true);
const loading = ref(false);
const oauthLoading = ref(false);

const formData = reactive({
  email: '',
  password: '',
  nickname: ''
});

const formRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ]
};

// 邮箱密码登录/注册
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    if (isLogin.value) {
      await authStore.login(formData.email, formData.password);
      ElMessage.success('登录成功');
    } else {
      await authStore.register(formData.email, formData.password, formData.nickname);
      ElMessage.success('注册成功，请查收验证邮件');
      isLogin.value = true;
      return;
    }

    // 登录成功后跳转
    const redirect = route.query.redirect || '/';
    router.push(redirect);
  } catch (error) {
    ElMessage.error(error.message || '操作失败');
  } finally {
    loading.value = false;
  }
};

// OAuth登录
const handleOAuthLogin = async () => {
  oauthLoading.value = true;
  try {
    const res = await authStore.getOAuthUrl();
    window.location.href = res.authUrl;
  } catch (error) {
    ElMessage.error('获取授权链接失败');
  } finally {
    oauthLoading.value = false;
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-container {
  width: 100%;
  max-width: 900px;
  min-height: 500px;
  display: flex;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  margin: var(--spacing-lg);
}

.auth-decoration {
  flex: 1;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  padding: var(--spacing-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
}

.decoration-content {
  text-align: center;
  color: white;
}

.decoration-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.decoration-subtitle {
  font-size: var(--font-size-lg);
  opacity: 0.9;
  margin-bottom: var(--spacing-2xl);
}

.decoration-features {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-size-md);
  opacity: 0.95;
}

.feature-icon {
  width: 24px;
  height: 24px;
}

.auth-form-container {
  flex: 1;
  padding: var(--spacing-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-form {
  width: 100%;
  max-width: 320px;
}

.form-title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  text-align: center;
  margin-bottom: var(--spacing-xl);
  color: var(--text-primary);
}

.oauth-section {
  margin-bottom: var(--spacing-lg);
}

.oauth-btn {
  width: 100%;
  height: 44px;
  font-size: var(--font-size-md);
}

.oauth-btn.manus {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
}

.oauth-btn.manus:hover {
  opacity: 0.9;
}

.oauth-icon {
  margin-right: var(--spacing-sm);
}

.divider {
  display: flex;
  align-items: center;
  margin: var(--spacing-lg) 0;
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.divider span {
  padding: 0 var(--spacing-md);
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: var(--font-size-md);
  margin-top: var(--spacing-md);
}

.switch-text {
  text-align: center;
  margin-top: var(--spacing-lg);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.switch-text a {
  color: var(--primary-color);
  cursor: pointer;
}

.disclaimer {
  text-align: center;
  margin-top: var(--spacing-lg);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.disclaimer a {
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .auth-container {
    margin: var(--spacing-md);
    min-height: auto;
  }

  .auth-form-container {
    padding: var(--spacing-xl);
  }
}
</style>
