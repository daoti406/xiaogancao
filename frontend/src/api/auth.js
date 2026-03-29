/**
 * 认证相关API
 */
import request from './request';

/**
 * 获取OAuth授权URL
 */
export const getOAuthUrl = () => {
  return request.get('/auth/oauth/url');
};

/**
 * 邮箱密码登录
 */
export const login = (email, password) => {
  return request.post('/auth/login', { email, password });
};

/**
 * 邮箱密码注册
 */
export const register = (email, password, nickname) => {
  return request.post('/auth/register', { email, password, nickname });
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = () => {
  return request.get('/auth/me');
};

/**
 * 登出
 */
export const logout = () => {
  return request.post('/auth/logout');
};

/**
 * 更新用户信息
 */
export const updateProfile = (data) => {
  return request.put('/auth/profile', data);
};
