# 小甘草—AI中医养生顾问

<div align="center">
  <img src="frontend/src/assets/title-logo.png" alt="小甘草" width="200">
  
  <h3>您的中医养生AI助手</h3>
  
  <p>融合千年中医智慧与现代AI技术，为您提供个性化、温暖、专业的健康管理服务</p>

  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Vue](https://img.shields.io/badge/Vue-3.x-brightgreen.svg)](https://vuejs.org/)
  [![Node](https://img.shields.io/badge/Node-18+-green.svg)](https://nodejs.org/)
  [![Python](https://img.shields.io/badge/Python-3.8+-yellow.svg)](https://www.python.org/)
</div>

---

## 项目概述

小甘草是一个基于Vue 3 + Node.js + Python的AI中医养生顾问系统，集成了RAG（检索增强生成）技术，通过微调的对话模型和嵌入模型，为用户提供专业的中医养生咨询服务。

### 核心特性

- 🏥 **智能体质辨识** - 基于中医体质分类标准，精准识别九种体质类型
- 🤖 **AI智能问诊** - 集成微调的对话模型，提供温暖专业的中医咨询
- 📊 **个性化养生方案** - 根据体质生成定制化养生建议
- 📋 **健康档案管理** - 记录用户健康数据，形成完整的健康档案
- 🏪 **中医馆定位** - 基于地理位置推荐附近中医馆
- 🌤️ **天气养生提醒** - 结合天气和节气提供养生建议
- 🎨 **中药药材主题** - 统一的中医药视觉风格设计

---

## 功能评估

### ✅ 已完善功能模块

#### 1. 用户认证系统
- **状态**: ✅ 完善实现
- **功能描述**:
  - OAuth登录（支持Manus等第三方登录）
  - 邮箱密码注册/登录
  - 用户信息管理
  - 登录状态持久化
- **技术实现**: JWT认证 + Supabase数据库
- **完成度**: 95%

#### 2. 体质辨识系统
- **状态**: ✅ 完善实现
- **功能描述**:
  - 17道专业体质问卷
  - 九种体质类型识别（平和质、气虚质、阳虚质等）
  - 体质评分可视化
  - 历史记录查询
  - 个性化体质报告
- **技术实现**: Vue 3 + Pinia + ECharts
- **完成度**: 100%

#### 3. AI智能问诊系统
- **状态**: ✅ 完善实现
- **功能描述**:
  - 流式对话响应
  - 意图识别（medical/greeting/other）
  - RAG知识库检索
  - 温暖自然的对话语气
  - 对话历史管理
  - 会话管理（创建、删除、查询）
- **技术实现**: 
  - 微调的对话模型（Qwen2.5-0.5B-Instruct）
  - 微调的嵌入模型（BGE-small-zh-v1.5）
  - ChromaDB向量数据库
  - FastAPI后端服务
- **完成度**: 90%

#### 4. 养生方案系统
- **状态**: ✅ 完善实现
- **功能描述**:
  - 个性化养生方案生成
  - 饮食建议
  - 运动指导
  - 生活作息建议
  - 穴位按摩指导
  - 任务跟踪
- **技术实现**: Vue 3 + Element Plus + 后端API
- **完成度**: 85%

#### 5. 健康档案系统
- **状态**: ✅ 基本完善
- **功能描述**:
  - 健康指标记录（血压、心率等）
  - 用药记录管理
  - 生活习惯记录
  - 健康数据可视化
  - 对话历史记录
- **技术实现**: Vue 3 + ECharts + Supabase
- **完成度**: 80%

#### 6. 中医馆定位系统
- **状态**: ✅ 基本实现
- **功能描述**:
  - 基于地理位置的中医馆搜索
  - 用户定位功能
  - 中医馆列表展示
  - 距离计算
- **技术实现**: 高德地图API + 浏览器定位
- **完成度**: 75%

#### 7. 天气养生系统
- **状态**: ✅ 基本实现
- **功能描述**:
  - 实时天气显示
  - 城市定位
  - 二十四节气计算
  - 节气养生建议
- **技术实现**: Open-Meteo天气API + 高德地图逆地理编码
- **完成度**: 80%

#### 8. 养生提醒系统
- **状态**: ✅ 基本实现
- **功能描述**:
  - 提醒创建
  - 提醒列表
  - 提醒删除
  - 提醒状态管理
- **技术实现**: Vue 3 + Element Plus
- **完成度**: 70%

#### 9. 界面设计系统
- **状态**: ✅ 完善实现
- **功能描述**:
  - 中药药材风格图标
  - 统一的配色方案
  - 响应式布局设计
  - 流畅的动画效果
  - 移动端适配
- **技术实现**: Vue 3 + CSS3 + Element Plus
---
## 技术架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     用户界面层                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │   前端Vue3   │  │  移动端H5   │  │  小程序(待开发)││
│  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     API网关层                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │  Express后端  │  │  FastAPI后端 │  │  认证服务    ││
│  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     业务服务层                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │  RAG服务     │  │  养生服务    │  │  定位服务    ││
│  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     数据存储层                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │  PostgreSQL  │  │  ChromaDB    │  │  文件存储    ││
│  │  (Supabase)  │  │  (向量库)    │  │  (模型数据)   ││
│  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 技术栈详解

#### 前端技术栈
- **框架**: Vue 3.4+ (Composition API)
- **构建工具**: Vite 5.0+
- **状态管理**: Pinia 2.0+
- **UI组件库**: Element Plus 2.4+
- **图表库**: ECharts 5.4+
- **HTTP客户端**: Axios 1.6+
- **路由**: Vue Router 4.2+

#### 后端技术栈
- **主后端**: Node.js 18+ + Express 4.18+
- **RAG服务**: Python 3.8+ + FastAPI 0.104+
- **AI模型**: 
  - 对话模型: Qwen2.5-0.5B-Instruct (微调版)
  - 嵌入模型: BGE-small-zh-v1.5 (微调版)
- **向量数据库**: ChromaDB 0.4+
- **关系数据库**: PostgreSQL 15+ (Supabase)

#### 第三方服务
- **地图服务**: 高德地图API
- **天气服务**: Open-Meteo API
- **认证服务**: Manus OAuth
- **数据库服务**: Supabase

---

## 项目结构

```
xiaogancao/
├── frontend/                      # 前端项目 (Vue 3)
│   ├── src/
│   │   ├── api/                 # API接口封装
│   │   │   ├── auth.js         # 认证相关API
│   │   │   ├── chat.js         # 对话相关API
│   │   │   ├── constitution.js # 体质辨识API
│   │   │   ├── wellness.js     # 养生方案API
│   │   │   └── request.js     # Axios封装
│   │   ├── assets/              # 静态资源
│   │   │   └── icons/         # 中药药材风格图标
│   │   ├── components/          # 可复用组件
│   │   │   ├── chat/          # 对话相关组件
│   │   │   ├── common/        # 公共组件
│   │   │   ├── constitution/  # 体质辨识组件
│   │   │   └── layout/        # 布局组件
│   │   ├── data/               # 静态数据
│   │   │   ├── constitutionKnowledge.js
│   │   │   └── quizQuestions.js
│   │   ├── router/             # 路由配置
│   │   ├── stores/             # Pinia状态管理
│   │   │   ├── auth.js        # 认证状态
│   │   │   ├── chat.js        # 对话状态
│   │   │   └── constitution.js # 体质状态
│   │   ├── styles/             # 全局样式
│   │   ├── utils/              # 工具函数
│   │   │   ├── amap.js        # 高德地图工具
│   │   │   └── solarTerms.js  # 二十四节气计算
│   │   ├── views/              # 页面组件
│   │   │   ├── Auth.vue       # 登录注册页
│   │   │   ├── Home.vue       # 首页
│   │   │   ├── Chat.vue       # 智能问诊页
│   │   │   ├── Constitution.vue # 体质辨识页
│   │   │   ├── ConstitutionReport.vue # 体质报告页
│   │   │   ├── WellnessPlan.vue # 养生方案页
│   │   │   ├── HealthProfile.vue # 健康档案页
│   │   │   └── Reminders.vue  # 养生提醒页
│   │   ├── App.vue             # 根组件
│   │   └── main.js            # 入口文件
│   ├── .env.example            # 环境变量示例
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # 后端项目 (Node.js)
│   ├── config/                 # 配置管理
│   ├── controllers/            # 控制器
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── constitutionController.js
│   │   └── wellnessController.js
│   ├── middleware/            # 中间件
│   ├── models/                # 数据模型
│   ├── routes/                # 路由定义
│   │   ├── auth.js
│   │   ├── chat.js
│   │   ├── constitution.js
│   │   └── wellness.js
│   ├── services/              # 业务服务
│   │   ├── supabase.js       # Supabase服务
│   │   └── ragService.js     # RAG服务
│   ├── utils/                 # 工具函数
│   ├── jobs/                  # 定时任务
│   ├── scripts/               # 脚本文件
│   ├── data/                  # 静态数据
│   │   └── constitutionKnowledge.js
│   ├── index.js              # 入口文件
│   └── package.json
│
├── xiaogancao-rag/               # RAG服务 (Python)
│   ├── api.py                # FastAPI服务
│   ├── rag_query.py          # RAG查询核心
│   ├── intent_local.py       # 意图识别
│   ├── build_vector_db.py    # 向量库构建
│   ├── build_knowledge_base.py # 知识库构建
│   ├── data/                # 数据文件
│   │   ├── shennong_dataset.json
│   │   └── shennong_pro.json
│   ├── chroma_db/          # 主向量数据库
│   ├── chroma_knowledge_db/ # 知识库向量数据库
│   ├── models/             # AI模型
│   │   ├── tcm_dialogue/    # 对话模型(微调版)
│   │   ├── tcm_embedding_pro/ # 嵌入模型(专业版)
│   │   └── Qwen2.5-0.5B-Instruct/ # 基座模型
│   ├── train_dialogue.py    # 对话模型训练
│   ├── train_embedding.py   # 嵌入模型训练
│   ├── test_final.py       # 测试脚本
│   └── requirement         # Python依赖
│
├── agent-service/                # Agent服务 (Python)
│   ├── main_langchain.py    # LangChain主程序
│   ├── langchain_ollama_agent.py # Ollama Agent
│   ├── agents/             # Agent定义
│   │   └── create_react_agent.py
│   ├── tools/              # 工具函数
│   │   ├── constitution.py
│   │   ├── generate_wellness_plan.py
│   │   ├── get_weather_solar_term.py
│   │   ├── search_tcm_knowledge.py
│   │   ├── analyze_health_trend.py
│   │   └── create_reminder.py
│   ├── test_agent.py       # Agent测试
│   └── requirements.txt
│
├── docs/                         # 文档目录
├── .gitignore                    # Git忽略配置
├── README.md                     # 项目说明文档
└── PROJECT_EVALUATION.md          # 项目评估报告(本文件)
```

---

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- Python >= 3.8
- pnpm >= 8.0.0 (推荐) 或 npm

### 安装依赖

```bash
# 安装前端依赖
cd frontend
pnpm install

# 安装后端依赖
cd ../backend
pnpm install

# 安装RAG服务依赖
cd ../xiaogancao-rag
pip install -r requirement
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

# JWT配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

#### 前端环境变量 (frontend/.env)

```env
VITE_API_BASE_URL=/api
VITE_AMAP_KEY=your_amap_key
```

### 数据库初始化

在Supabase SQL编辑器中执行相应的数据库初始化脚本。

### 启动服务

```bash
# 启动后端服务
cd backend
pnpm dev

# 启动RAG服务(新终端)
cd xiaogancao-rag
python api.py

# 启动前端服务(新终端)
cd frontend
pnpm dev
```

访问 http://localhost:5173 即可使用。

---

## API文档

### 后端API (Express)

#### 认证接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/auth/oauth/url | 获取OAuth授权URL |
| GET | /api/auth/oauth/callback | OAuth回调处理 |
| POST | /api/auth/login | 邮箱密码登录 |
| POST | /api/auth/register | 用户注册 |
| GET | /api/auth/me | 获取当前用户 |
| POST | /api/auth/logout | 登出 |

#### 体质辨识接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/constitution/submit | 提交体质问卷 |
| GET | /api/constitution/result | 获取最新结果 |
| GET | /api/constitution/history | 获取历史记录 |

#### 对话接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/chat/sessions | 创建会话 |
| GET | /api/chat/sessions | 获取会话列表 |
| DELETE | /api/chat/sessions/:id | 删除会话 |
| POST | /api/chat/message | 发送消息（流式） |
| GET | /api/chat/sessions/:id/messages | 获取历史消息 |

#### 养生方案接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/wellness/generate | 生成养生方案 |
| GET | /api/wellness/plan | 获取养生方案 |
| PUT | /api/wellness/plan | 更新养生方案 |

#### 提醒接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/reminders | 获取提醒列表 |
| POST | /api/reminders | 创建提醒 |
| PUT | /api/reminders/:id | 更新提醒 |
| DELETE | /api/reminders/:id | 删除提醒 |

### RAG服务API (FastAPI)

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/health | 健康检查 |
| POST | /api/chat | 普通对话接口 |
| POST | /api/chat/stream | 流式对话接口(SSE) |
| GET | /api/wellness/dashboard | 获取仪表盘数据 |
| GET | /api/wellness/plan | 获取养生方案 |
| POST | /api/wellness/generate | 生成养生方案 |

---

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

---

## 安全性说明

### 敏感信息保护

1. **环境变量分离**: 所有API密钥、数据库连接信息等敏感信息都通过环境变量配置
2. **.gitignore配置**: 已配置忽略.env文件和模型文件
3. **JWT认证**: 使用JWT进行用户认证，Token有效期7天
4. **HTTPS**: 生产环境建议使用HTTPS协议
5. **数据加密**: 用户密码使用bcrypt加密存储

### API密钥配置

#### 高德地图API密钥
- 用途: 地理位置服务和天气服务
- 配置位置: `frontend/.env` 中的 `VITE_AMAP_KEY`
- 获取方式: [高德开放平台](https://lbs.amap.com/)

#### Supabase配置
- 用途: 数据库和认证服务
- 配置位置: `backend/.env` 中的 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
- 获取方式: [Supabase官网](https://supabase.com/)

---

## 性能优化

### 已实现的优化

1. **前端优化**
   - 组件懒加载
   - 图片懒加载
   - 代码分割
   - CDN加速

2. **后端优化**
   - 数据库索引优化
   - API响应缓存
   - 连接池管理

3. **RAG服务优化**
   - 向量数据库索引
   - 模型量化加载
   - 批量处理优化

### 待优化项

1. **对话响应速度**: 优化模型推理速度
2. **知识库检索**: 提升检索精度和速度
3. **前端渲染**: 优化大列表渲染性能
4. **数据库查询**: 优化复杂查询性能

---

## 测试

### 测试覆盖

- 单元测试: 待完善
- 集成测试: 待完善
- E2E测试: 待完善

### 测试脚本

```bash
# RAG服务测试
cd xiaogancao-rag
python test_final.py

# Agent服务测试
cd agent-service
python test_agent.py
```

---

## 部署

### 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                     负载均衡器                          │
└─────────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  前端服务器   │  │  后端服务器   │  │  RAG服务器    │
│  (Nginx)     │  │  (Node.js)    │  │  (FastAPI)   │
└──────────────┘  └──────────────┘  └──────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  数据库集群      │
                  │  (PostgreSQL)    │
                  └──────────────────┘
```

### 部署步骤

1. **前端部署**
   ```bash
   cd frontend
   pnpm build
   # 将dist目录部署到Nginx
   ```

2. **后端部署**
   ```bash
   cd backend
   pnpm build
   pm2 start dist/index.js
   ```

3. **RAG服务部署**
   ```bash
   cd xiaogancao-rag
   gunicorn api:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

---

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

---

## 免责声明

本平台提供的养生建议和体质辨识结果仅供参考，不构成医疗诊断或处方。中医养生建议需结合个人实际情况，如有身体不适请及时就医，遵循专业医师指导。

---

## 许可证

本项目采用 [MIT](LICENSE) 许可证。

---

## 联系方式

- 项目地址: [https://github.com/daoti406/xiaogancao](https://github.com/daoti406/xiaogancao)
- 问题反馈: [GitHub Issues](https://github.com/daoti406/xiaogancao/issues)

---

<div align="center">
  <p>🌿 小甘草—AI中医养生顾问 - 让中医养生更简单</p>
  <p>最后更新: 2026年4月10日</p>
</div>
