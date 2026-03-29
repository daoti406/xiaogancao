<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>{{ isLogin ? '登录' : '注册' }}</h2>
      <form @submit.prevent="submit">
        <div class="form-group">
          <label>邮箱</label>
          <input v-model="email" type="email" required placeholder="your@email.com" />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="password" type="password" required placeholder="至少6位" />
        </div>
        <button type="submit" class="btn-primary">
          {{ isLogin ? '登录' : '注册' }}
        </button>
      </form>
      <p class="toggle" @click="isLogin = !isLogin">
        {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const isLogin = ref(true);
const email = ref('');
const password = ref('');
const router = useRouter();

const submit = async () => {
  const url = isLogin.value ? '/api/auth/login' : '/api/auth/register';
  try {
    const res = await axios.post(url, {
      email: email.value,
      password: password.value,
    });
    if (isLogin.value) {
      // 登录成功，保存 token
      localStorage.setItem('token', res.data.access_token);
      // 跳转到聊天页面
      router.push('/chat');
    } else {
      // 注册成功，提示并切换到登录
      alert('注册成功，请登录');
      isLogin.value = true;
    }
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || '操作失败，请重试');
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f5f5f5;
}
.auth-card {
  width: 320px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
.form-group {
  margin-bottom: 16px;
}
label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}
input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}
.btn-primary {
  width: 100%;
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
.btn-primary:hover {
  background-color: #369a6e;
}
.toggle {
  margin-top: 16px;
  text-align: center;
  color: #42b983;
  cursor: pointer;
  font-size: 14px;
}
</style>