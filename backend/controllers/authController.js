import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import * as authService from '../services/auth.js';

/**
 * 生成JWT Token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * 邮箱密码登录
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '请提供邮箱和密码'
      });
    }

    const data = await authService.loginWithEmail(email, password);
    const token = generateToken(data.user);

    res.json({
      code: 0,
      data: {
        token,
        user: {
          id: data.user.id,
          email: data.user.email,
          nickname: data.user.user_metadata?.nickname || email.split('@')[0]
        }
      },
      message: '登录成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 邮箱密码注册
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, nickname } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '请提供邮箱和密码'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '密码长度至少6位'
      });
    }

    const user = await authService.registerUser(email, password, nickname);
    const token = generateToken(user);

    res.json({
      code: 0,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.user_metadata?.nickname || email.split('@')[0]
        }
      },
      message: '注册成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取当前用户信息
 */
export const me = async (req, res, next) => {
  try {
    const user = await authService.getUser(req.user.id);

    res.json({
      code: 0,
      data: {
        id: user.id,
        email: user.email,
        nickname: user.user_metadata?.nickname || user.email.split('@')[0],
        createdAt: user.created_at
      },
      message: 'success'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新用户信息
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { nickname } = req.body;
    const userId = req.user.id;

    const user = await authService.updateUser(userId, { nickname });

    res.json({
      code: 0,
      data: {
        id: user.id,
        email: user.email,
        nickname: user.user_metadata?.nickname
      },
      message: '更新成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 登出
 */
export const logout = async (req, res, next) => {
  try {
    // JWT是无状态的，登出只需要客户端删除token
    res.json({
      code: 0,
      data: null,
      message: '登出成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取OAuth授权URL
 */
export const getOAuthUrl = async (req, res, next) => {
  try {
    const { provider = 'google' } = req.query;

    // Manus OAuth URL（示例）
    const oauthUrl = `https://manus.com/oauth/authorize?client_id=${config.manus.clientId}&redirect_uri=${encodeURIComponent(config.manus.redirectUri)}&response_type=code&scope=read`;

    res.json({
      code: 0,
      data: {
        url: oauthUrl
      },
      message: 'success'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 处理OAuth回调
 */
export const handleOAuthCallback = async (req, res, next) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '授权码无效'
      });
    }

    // TODO: 使用code换取access_token
    // 这里需要根据实际的OAuth provider实现

    // 临时重定向到前端
    res.redirect('http://localhost:5173/auth?oauth=success');
  } catch (error) {
    next(error);
  }
};
