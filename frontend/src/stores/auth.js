/**
 * 认证状态管理
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as authApi from '@/api/auth';
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '@/utils/storage';

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref(getToken());
  const user = ref(getUser());
  const loading = ref(false);
  const error = ref(null);

  // 计算属性
  const isLoggedIn = computed(() => !!token.value && !!user.value);
  const userName = computed(() => user.value?.nickname || user.value?.email?.split('@')[0] || '用户');
  const userAvatar = computed(() => user.value?.avatar_url || '');

  /**
   * 获取OAuth授权URL
   */
  const getOAuthUrl = async () => {
    try {
      const res = await authApi.getOAuthUrl();
      return res.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  /**
   * 邮箱密码登录
   */
  const login = async (email, password) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await authApi.login(email, password);
      console.log('登录返回:', res);
      console.log('登录返回data:', res.data);
      // 后端返回的是 token，不是 access_token
      const tokenValue = res.data.token || res.data.access_token;
      console.log('token值:', tokenValue);
      token.value = tokenValue;
      user.value = res.data.user;
      setToken(tokenValue);
      setUser(res.data.user);
      console.log('localStorage token:', localStorage.getItem('xiaogancao_token'));
      return res;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 邮箱密码注册
   */
  const register = async (email, password, nickname) => {
    loading.value = true;
    error.value = null;
    
    try {
      const res = await authApi.register(email, password, nickname);
      return res;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * OAuth登录成功处理
   */
  const handleOAuthSuccess = (tokenValue) => {
    token.value = tokenValue;
    setToken(tokenValue);
  };

  /**
   * 获取当前用户信息
   */
  const fetchCurrentUser = async () => {
    if (!token.value) return null;
    
    try {
      const res = await authApi.getCurrentUser();
      user.value = res.data;
      setUser(res.data);
      return res.data;
    } catch (err) {
      // token无效，清除登录状态
      logout();
      throw err;
    }
  };

  /**
   * 登出
   */
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // 忽略登出错误
    } finally {
      token.value = null;
      user.value = null;
      removeToken();
      removeUser();
    }
  };

  /**
   * 更新用户信息
   */
  const updateUser = (userData) => {
    user.value = { ...user.value, ...userData };
    setUser(user.value);
  };

  /**
   * 检查登录状态
   */
  const checkAuth = async () => {
    if (!token.value) {
      return false;
    }

    try {
      await fetchCurrentUser();
      return true;
    } catch (err) {
      return false;
    }
  };

  return {
    // 状态
    token,
    user,
    loading,
    error,
    // 计算属性
    isLoggedIn,
    userName,
    userAvatar,
    // 方法
    getOAuthUrl,
    login,
    register,
    handleOAuthSuccess,
    fetchCurrentUser,
    logout,
    updateUser,
    checkAuth
  };
});
