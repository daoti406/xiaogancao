# 小甘草项目部署指南

## 项目架构

小甘草项目由三个主要部分组成：

1. **前端**：Vue 3 + Vite
2. **后端**：Node.js + Express
3. **RAG服务**：Python + FastAPI

## 环境要求

- **Node.js** >= 18.0.0
- **Python** >= 3.8
- **pnpm** >= 8.0.0 (推荐) 或 npm
- **PostgreSQL** (通过Supabase)

## 部署步骤

### 1. 环境配置

#### 前端环境变量 (`frontend/.env`)

```env
# API基础路径
VITE_API_BASE_URL=/api

# 高德地图API密钥（用于定位和天气功能）
VITE_AMAP_KEY=your_amap_key_here
```

#### 后端环境变量 (`backend/.env`)

```env
# 服务配置
PORT=3000
NODE_ENV=production

# Supabase配置
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

### 2. 安装依赖

```bash
# 安装前端依赖
cd frontend
pnpm install

# 构建前端
pnpm build

# 安装后端依赖
cd ../backend
pnpm install

# 安装RAG服务依赖
cd ../xiaogancao-rag
pip install -r requirement
```

### 3. 数据库初始化

在Supabase SQL编辑器中执行以下SQL脚本：

```sql
-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建体质辨识结果表
CREATE TABLE IF NOT EXISTS constitution_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  constitution_type VARCHAR(50),
  scores JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建对话会话表
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建消息表
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id),
  role VARCHAR(20),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建养生方案表
CREATE TABLE IF NOT EXISTS wellness_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  constitution_type VARCHAR(50),
  plan_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建提醒表
CREATE TABLE IF NOT EXISTS reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  content TEXT,
  type VARCHAR(50),
  time VARCHAR(20),
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. 部署方式

#### 方案一：Docker部署（推荐）

创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
  
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - JWT_SECRET=${JWT_SECRET}
  
  rag-service:
    build:
      context: ./xiaogancao-rag
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
```

#### 方案二：传统部署

1. **前端部署**：
   - 将 `frontend/dist` 目录部署到 Nginx 或其他静态文件服务器

2. **后端部署**：
   - 使用 PM2 管理 Node.js 进程
   ```bash
   pm2 start index.js --name "xiaogancao-backend"
   ```

3. **RAG服务部署**：
   - 使用 Gunicorn 管理 FastAPI 进程
   ```bash
   gunicorn api:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

### 5. Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # RAG 服务代理
    location /rag/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6. 启动服务

```bash
# 启动前端服务（Nginx）
sudo systemctl start nginx

# 启动后端服务
cd backend
pm start

# 启动RAG服务
cd ../xiaogancao-rag
python api.py
```

## 监控和维护

### 日志管理
- **前端日志**：Nginx 访问日志
- **后端日志**：`backend/logs/` 目录
- **RAG服务日志**：标准输出

### 健康检查
- **前端**：访问 `http://your-domain.com`
- **后端**：访问 `http://your-domain.com/api/health`
- **RAG服务**：访问 `http://your-domain.com/rag/health`

### 常见问题

1. **前端无法连接后端**：
   - 检查 VITE_API_BASE_URL 配置
   - 检查 Nginx 代理配置

2. **RAG服务启动失败**：
   - 检查 Python 依赖是否安装
   - 检查模型文件是否存在

3. **数据库连接失败**：
   - 检查 Supabase 配置
   - 检查网络连接

## 性能优化

1. **前端优化**：
   - 启用 Gzip 压缩
   - 使用 CDN 加速静态资源

2. **后端优化**：
   - 启用 Redis 缓存
   - 优化数据库查询

3. **RAG服务优化**：
   - 使用模型量化
   - 优化向量数据库索引

## 安全配置

1. **HTTPS**：
   - 配置 SSL 证书
   - 强制使用 HTTPS

2. **CORS**：
   - 配置正确的 CORS 策略

3. **API 密钥**：
   - 使用环境变量管理敏感信息
   - 定期轮换密钥

## 部署检查清单

- [ ] 环境变量配置完成
- [ ] 依赖安装完成
- [ ] 数据库初始化完成
- [ ] 前端构建完成
- [ ] 服务启动成功
- [ ] 健康检查通过
- [ ] 安全配置完成

---

## 升级指南

1. **备份数据**
2. **拉取最新代码**
3. **更新依赖**
4. **重新构建前端**
5. **重启服务**

---

## 联系方式

- 项目地址: [https://github.com/daoti406/xiaogancao](https://github.com/daoti406/xiaogancao)
- 问题反馈: [GitHub Issues](https://github.com/daoti406/xiaogancao/issues)
