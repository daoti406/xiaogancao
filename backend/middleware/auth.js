import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { verifyToken } from '../services/auth.js';

/**
 * JWT验证中间件
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 401,
        data: null,
        message: '未提供认证令牌'
      });
    }

    const token = authHeader.split(' ')[1];

    // 验证JWT
    const decoded = jwt.verify(token, config.jwt.secret);

    // 可以选择再次验证Supabase token
    // const user = await verifyToken(token);

    req.user = {
      id: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        data: null,
        message: '登录已过期，请重新登录'
      });
    }
    return res.status(401).json({
      code: 401,
      data: null,
      message: '无效的认证令牌'
    });
  }
};

/**
 * 可选认证中间件（不强制要求登录）
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = {
        id: decoded.userId,
        email: decoded.email
      };
    }
  } catch (error) {
    // 忽略错误，继续不强制认证
  }
  next();
};

export default authenticate;
