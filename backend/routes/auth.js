import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 获取OAuth授权URL
router.get('/oauth/url', authController.getOAuthUrl);

// OAuth回调处理
router.get('/oauth/callback', authController.handleOAuthCallback);

// 邮箱密码登录
router.post('/login', authController.login);

// 邮箱密码注册
router.post('/register', authController.register);

// 获取当前用户（需要认证）
router.get('/me', authenticate, authController.me);

// 更新用户信息（需要认证）
router.put('/profile', authenticate, authController.updateProfile);

// 登出（需要认证）
router.post('/logout', authenticate, authController.logout);

export default router;
