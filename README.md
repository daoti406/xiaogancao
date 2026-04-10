# 小甘草—AI中医养生顾问

<div align="center">
  <img src="C:\Users\daoti\Desktop\小甘草\frontend\src\assets\title-logo.png" alt="小甘草" width="200">
  
  <h3>您的中医养生AI助手</h3>
  
  <p>融合千年中医智慧与现代AI技术，为您提供个性化、温暖、专业的健康管理服务</p>

  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Vue](https://img.shields.io/badge/Vue-3.x-brightgreen.svg)](https://vuejs.org/)
  [![Node](https://img.shields.io/badge/Node-18+-green.svg)](https://nodejs.org/)
</div>

---

## 功能特点

### 核心功能

| 功能 | 描述 |
|------|------|
| 体质辨识 | 基于《中医体质分类与判定》标准，通过17道问卷精准识别九种体质类型 |
| AI智能问诊 | 集成Dify工作流，支持流式对话，提供温暖专业的中医养生咨询服务 |
| 养生方案 | 根据体质生成个性化养生方案，涵盖饮食、作息、运动、穴位保健等方面 |
| 健康档案 | 记录用户体质数据、对话历史，形成完整的健康档案 |
| 养生提醒 | 定时提醒功能，帮助用户坚持健康习惯 |

### 技术亮点

- 企业级全栈架构，代码规范、可维护性强
- 流式AI对话，实时响应，体验流畅
- 响应式设计，支持PC端和移动端
- 模块化设计，易于扩展至小程序端
- Dify工作流集成，支持知识库检索与AI推理

## 技术栈

### 前端
- **Vue 3** - 渐进式JavaScript框架
- **Vite** - 下一代前端构建工具
- **Pinia** - Vue 3 状态管理
- **Element Plus** - Vue 3 组件库
- **ECharts** - 数据可视化图表
- **Axios** - HTTP请求库

### 后端
- **Node.js** - JavaScript运行时
- **Express** - Web应用框架
- **Supabase** - 后端即服务（数据库、认证）
- **Dify** - LLM应用开发平台

### 数据库
- **PostgreSQL** - 关系型数据库（通过Supabase）

## 项目结构

```
xiaogancao/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── api/             # API封装
│   │   ├── assets/          # 静态资源
│   │   ├── components/      # 可复用组件
│   │   │   ├── chat/        # 对话相关组件
│   │   │   ├── common/      # 公共组件
│   │   │   ├── constitution/# 体质辨识组件
│   │   │   └── layout/      # 布局组件
│   │   ├── data/            # 静态数据
│   │   ├── router/          # 路由配置
│   │   ├── stores/          # Pinia状态管理
│   │   ├── styles/          # 全局样式
│   │   ├── utils/           # 工具函数
│   │   └── views/           # 页面组件
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # 后端项目
│   ├── config/              # 配置管理
│   ├── controllers/         # 控制器
│   ├── middleware/          # 中间件
│   ├── models/              # 数据模型
│   ├── routes/              # 路由定义
│   ├── services/            # 业务服务
│   ├── utils/               # 工具函数
│   ├── jobs/                # 定时任务
│   ├── scripts/             # 脚本文件
│   ├── index.js             # 入口文件
│   └── package.json
│
├── docs/                     # 文档目录
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0 (推荐) 或 npm

### 安装依赖

```bash
# 安装前端依赖
cd frontend
pnpm install

# 安装后端依赖
cd ../backend
pnpm install
```

### 环境配置

#### 后端环境变量 (backend/.env)

```env
# 服务配置
PORT=3000
NODE_ENV=development

# Supabase配置
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Manus OAuth配置
MANUS_CLIENT_ID=your_manus_client_id
MANUS_CLIENT_SECRET=your_manus_client_secret
MANUS_REDIRECT_URI=http://localhost:3000/api/auth/oauth/callback

# Dify配置
DIFY_API_URL=your_dify_api_url
DIFY_API_KEY=your_dify_api_key

# JWT配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

#### 前端环境变量 (frontend/.env)

```env
VITE_API_BASE_URL=/api
```

### 数据库初始化

在Supabase SQL编辑器中执行 `backend/scripts/initDatabase.js` 中生成的SQL脚本。

### 启动服务

```bash
# 启动后端服务
cd backend
pnpm dev

# 启动前端服务（新终端）
cd frontend
pnpm dev
```

访问 http://localhost:5173 即可使用。

## API文档

### 认证接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/auth/oauth/url | 获取OAuth授权URL |
| GET | /api/auth/oauth/callback | OAuth回调处理 |
| POST | /api/auth/login | 邮箱密码登录 |
| POST | /api/auth/register | 用户注册 |
| GET | /api/auth/me | 获取当前用户 |
| POST | /api/auth/logout | 登出 |

### 体质辨识接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/constitution/submit | 提交体质问卷 |
| GET | /api/constitution/result | 获取最新结果 |
| GET | /api/constitution/history | 获取历史记录 |

### 对话接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/chat/sessions | 创建会话 |
| GET | /api/chat/sessions | 获取会话列表 |
| DELETE | /api/chat/sessions/:id | 删除会话 |
| POST | /api/chat/message | 发送消息（流式） |
| GET | /api/chat/sessions/:id/messages | 获取历史消息 |

### 养生方案接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/wellness/generate | 生成养生方案 |
| GET | /api/wellness/plan | 获取养生方案 |
| PUT | /api/wellness/plan | 更新养生方案 |

### 提醒接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/reminders | 获取提醒列表 |
| POST | /api/reminders | 创建提醒 |
| PUT | /api/reminders/:id | 更新提醒 |
| DELETE | /api/reminders/:id | 删除提醒 |

## 设计规范

### 配色方案

```css
/* 主色调 - 中医绿 */
--primary-color: #4A7C59;
--primary-light: #7FA889;
--primary-dark: #3A6247;

/* 辅助色 - 温暖棕 */
--secondary-color: #D4A574;

/* 背景色 */
--bg-primary: #FAF8F5;
--bg-secondary: #F5F1EB;
```

### 体质颜色映射

| 体质类型 | 颜色代码 |
|----------|----------|
| 阳虚质 | #E89B7C |
| 阴虚质 | #8BC4E8 |
| 气虚质 | #E8C87C |
| 痰湿质 | #A8C97C |
| 湿热质 | #E87C7C |
| 血瘀质 | #B87CE8 |
| 气郁质 | #7CB8E8 |
| 特禀质 | #E87CB8 |
| 平和质 | #7CE89C |

## 免责声明

本平台提供的养生建议和体质辨识结果仅供参考，不构成医疗诊断或处方。中医养生建议需结合个人实际情况，如有身体不适请及时就医，遵循专业医师指导。

## 许可证

本项目采用 [MIT](LICENSE) 许可证。

---

<div align="center">
  <p>🌿 小甘草—AI中医养生顾问 - 让中医养生更简单</p>
</div>
