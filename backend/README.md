# 小甘草后端服务

## 快速开始

### 1. 安装依赖

```bash
cd backend
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```env
# 服务配置
PORT=3000
NODE_ENV=development

# Supabase配置（必须）
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Dify配置（AI对话功能需要）
DIFY_API_URL=your_dify_api_url
DIFY_API_KEY=your_dify_api_key

# JWT配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

### 3. 初始化数据库

在Supabase SQL编辑器中执行 `scripts/initDatabase.js` 生成的SQL语句。

### 4. 启动服务

```bash
pnpm dev
```

服务启动后将监听 http://localhost:3000

## API列表

### 认证接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/login | 邮箱密码登录 |
| POST | /api/auth/register | 用户注册 |
| GET | /api/auth/me | 获取当前用户 |
| POST | /api/auth/logout | 登出 |
| PUT | /api/auth/profile | 更新用户信息 |

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
| GET | /api/chat/sessions/:id/messages | 获取历史消息 |
| POST | /api/chat/message | 发送消息（流式） |

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

## 所需API及Key清单

| 服务 | 用途 | 获取方式 |
|------|------|----------|
| Supabase | 数据库、用户认证 | [Supabase控制台](https://supabase.com) → Settings → API |
| Dify | AI对话服务 | [Dify控制台](https://dify.ai) → 设置 → API |

## 项目结构

```
backend/
├── config/              # 配置管理
├── controllers/        # 控制器
├── middleware/         # 中间件
├── models/             # 数据模型
├── routes/             # 路由
├── services/           # 业务服务
├── scripts/            # 脚本
└── index.js           # 入口文件
```
