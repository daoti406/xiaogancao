import { supabaseAdmin } from './supabase.js';

/**
 * 使用邮箱密码注册用户
 */
export const registerUser = async (email, password, nickname) => {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      nickname: nickname || email.split('@')[0]
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
};

/**
 * 使用邮箱密码登录
 */
export const loginWithEmail = async (email, password) => {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * 通过OAuth登录（支持 Manus 等）
 */
export const signInWithOAuth = async (provider) => {
  const { data, error } = await supabaseAdmin.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.MANUS_REDIRECT_URI || 'http://localhost:3000/api/auth/oauth/callback'}`
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * 获取用户信息
 */
export const getUser = async (userId) => {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
};

/**
 * 更新用户信息
 */
export const updateUser = async (userId, userData) => {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { user_metadata: userData }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
};

/**
 * 验证Token
 */
export const verifyToken = async (token) => {
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
};

/**
 * 登出
 */
export const logout = async (refreshToken) => {
  const { error } = await supabaseAdmin.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  return true;
};
