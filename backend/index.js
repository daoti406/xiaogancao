import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 挂载聊天路由（注意：挂载路径为 /api/chat，chat.js 中定义的是 /message）
app.use('/api/chat', chatRoutes);

// 404 处理
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// 启动服务
app.listen(PORT, () => {
    console.log(`🚀 小甘草后端服务启动成功`);
    console.log(`📡 服务地址: http://localhost:${PORT}`);
});