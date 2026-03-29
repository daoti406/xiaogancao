import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import { validateSupabaseConfig } from './services/supabase.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// 导入路由
import authRoutes from './routes/auth.js';
import constitutionRoutes from './routes/constitution.js';
import chatRoutes from './routes/chat.js';
import wellnessRoutes from './routes/wellness.js';

const app = express();

// CORS配置
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// JSON解析
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/constitution', constitutionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/reminders', wellnessRoutes);

// 错误处理
app.use(notFoundHandler);
app.use(errorHandler);

// 启动服务
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 小甘草后端服务启动成功`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`🔗 前端地址: http://localhost:5173`);
  console.log(`📦 环境: ${config.nodeEnv}`);

  // 验证Supabase配置
  try {
    validateSupabaseConfig();
    console.log('✅ Supabase配置验证通过');
  } catch (error) {
    console.warn('⚠️ Supabase配置验证失败:', error.message);
  }

  // 检查Dify配置
  if (!config.dify.apiUrl || config.dify.apiUrl === 'your_dify_api_url') {
    console.warn('⚠️ DIFY_API_URL 未配置，AI对话功能将不可用');
  }
  if (!config.dify.apiKey || config.dify.apiKey === 'your_dify_api_key') {
    console.warn('⚠️ DIFY_API_KEY 未配置，AI对话功能将不可用');
  }
});

export default app;
