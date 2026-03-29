/**
 * 本地存储工具
 */

const TOKEN_KEY = 'xiaogancao_token';
const USER_KEY = 'xiaogancao_user';

/**
 * 获取Token
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * 设置Token
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * 移除Token
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * 获取用户信息
 */
export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};

/**
 * 设置用户信息
 */
export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * 移除用户信息
 */
export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

/**
 * 清除所有登录相关信息
 */
export const clearAuth = () => {
  removeToken();
  removeUser();
};

/**
 * 检查是否登录
 */
export const isLoggedIn = () => {
  return !!getToken() && !!getUser();
};

/**
 * 获取体质结果缓存
 */
export const getConstitutionCache = () => {
  const cache = localStorage.getItem('constitution_cache');
  if (cache) {
    try {
      return JSON.parse(cache);
    } catch (e) {
      return null;
    }
  }
  return null;
};

/**
 * 设置体质结果缓存
 */
export const setConstitutionCache = (data) => {
  localStorage.setItem('constitution_cache', JSON.stringify({
    ...data,
    timestamp: Date.now()
  }));
};

/**
 * 清除体质结果缓存
 */
export const clearConstitutionCache = () => {
  localStorage.removeItem('constitution_cache');
};
