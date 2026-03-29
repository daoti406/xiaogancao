import express from 'express';
import * as chatController from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 创建会话（需要认证）
router.post('/sessions', authenticate, chatController.createSession);

// 获取会话列表（需要认证）
router.get('/sessions', authenticate, chatController.getSessions);

// 删除会话（需要认证）
router.delete('/sessions/:id', authenticate, chatController.deleteSession);

// 获取会话历史消息（需要认证）
router.get('/sessions/:id/messages', authenticate, chatController.getMessages);

// 发送消息（流式响应，需要认证）
router.post('/message', authenticate, chatController.streamMessage);

export default router;
