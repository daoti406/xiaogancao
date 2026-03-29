# 小甘草 - AI 中医养生顾问

## 项目介绍

小甘草是一款基于 AI 的中医养生顾问应用，为用户提供体质辨识、养生方案、健康咨询等服务。

## 技术栈

- **前端框架**: Vue 3 + Vite + Pinia
- **UI 组件**: Element Plus
- **图表**: ECharts
- **状态管理**: Pinia
- **路由**: Vue Router

## 功能特性

- 🏥 体质辨识 - 基于中医九种体质理论
- 💬 AI 问诊 - 智能对话解答健康问题
- 📋 养生方案 - 个性化饮食、作息、运动建议
- ⏰ 提醒管理 - 定时提醒养成健康习惯
- 👤 数字人 - 可视化 AI 顾问形象

## 开发

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
pnpm build
```

## 部署

### 前端部署

1. 复制 `.env.production` 为 `.env.production.local` 并配置实际参数
2. 构建项目：`pnpm build`
3. 将 `dist` 目录内容上传到服务器

### Vercel 部署

```bash
pnpm add -D vercel
pnpm build
npx vercel --prod
```

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/xiaogancao;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理（如果后端同源部署）
    location /api/ {
        proxy_pass http://localhost:3000/;
    }
}
```

## 项目结构

```
src/
├── api/           # API 请求
├── assets/        # 静态资源
├── components/    # 组件
│   ├── chat/     # 聊天相关
│   ├── home/     # 首页相关
│   └── layout/   # 布局组件
├── data/         # 静态数据
├── router/       # 路由配置
├── stores/       # Pinia 状态管理
├── styles/       # 全局样式
├── utils/        # 工具函数
└── views/        # 页面视图
```

## 环境变量

| 变量名 | 说明 |
|--------|------|
| VITE_API_BASE_URL | API 服务地址 |
| VITE_SUPABASE_URL | Supabase 项目地址 |
| VITE_SUPABASE_ANON_KEY | Supabase 匿名密钥 |
| VITE_DIFY_API_KEY | Dify API 密钥 |

## License

MIT
