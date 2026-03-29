import express from 'express';
import * as wellnessController from '../controllers/wellnessController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 生成养生方案（需要认证）
router.post('/generate', authenticate, wellnessController.generate);

// 动态调整养生方案（基于健康问题）
router.post('/adjust', authenticate, wellnessController.adjustPlan);

// 获取养生方案（需要认证）
router.get('/plan', authenticate, wellnessController.getPlan);

// 更新养生方案（需要认证）
router.put('/plan', authenticate, wellnessController.updatePlan);

// 获取用户健康档案
router.get('/profile', authenticate, wellnessController.getHealthProfile);

// 更新用户健康档案
router.put('/profile', authenticate, wellnessController.updateHealthProfile);

// 获取提醒列表（需要认证）
router.get('/reminders', authenticate, wellnessController.getReminders);

// 创建提醒（需要认证）
router.post('/reminders', authenticate, wellnessController.createReminder);

// 更新提醒（需要认证）
router.put('/reminders/:id', authenticate, wellnessController.updateReminder);

// 删除提醒（需要认证）
router.delete('/reminders/:id', authenticate, wellnessController.deleteReminder);

export default router;
