import express from 'express';
import * as constitutionController from '../controllers/constitutionController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 提交体质问卷（需要认证）
router.post('/submit', authenticate, constitutionController.submit);

// 获取最新体质结果（需要认证）
router.get('/result', authenticate, constitutionController.getResult);

// 获取体质历史记录（需要认证）
router.get('/history', authenticate, constitutionController.getHistory);

export default router;
