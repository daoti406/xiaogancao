import express from 'express';
import axios from 'axios';          // 正确导入 axios
// import * as chatController from '../controllers/chatController.js'; // 如果未使用可注释
// import { authenticate } from '../middleware/auth.js';               // 未使用也可注释

const router = express.Router();    // 创建路由实例

const AGENT_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:8000';

// 注意：路由路径根据你的需求，通常为 '/chat' 或 '/message'
router.post('/message', async (req, res) => {
    const { userId, message } = req.body;
    if (!message) {
        return res.status(400).json({ error: '消息不能为空' });
    }
    try {
        const response = await axios.post(`${AGENT_URL}/api/chat`, {
            user_id: userId,
            message: message
        }, {
            timeout: 30000   // 可选：设置超时
        });
        // 假设 Agent 返回格式为 { reply: "..." }，根据实际情况调整
        res.json({ reply: response.data.reply });
    } catch (error) {
        console.error('Error fetching chat response:', error.message);
        // 可根据 error.response 状态码返回更精确的错误
        res.status(500).json({ error: 'Failed to fetch chat response' });
    }
});

export default router;