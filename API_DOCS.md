# 小甘草项目 API 文档

## 概述

本文档描述了小甘草项目的所有API接口，包括前端与后端、RAG服务之间的接口规范。

## 基础信息

- **API基础路径**：
  - 后端API：`/api`
  - RAG服务API：`/rag`（部署时通过代理）

- **请求方法**：GET, POST, PUT, DELETE

- **响应格式**：
  ```json
  {
    "success": true,
    "data": {...},
    "message": "操作成功"
  }
  ```

- **错误响应**：
  ```json
  {
    "success": false,
    "error": "错误信息",
    "code": 400
  }
  ```

## 1. 认证接口

### 1.1 获取OAuth授权URL

- **路径**：`/api/auth/oauth/url`
- **方法**：GET
- **参数**：无
- **响应**：
  ```json
  {
    "success": true,
    "data": {
      "url": "https://oauth.manus.com/authorize?client_id=..."
    }
  }
  ```

### 1.2 OAuth回调处理

- **路径**：`/api/auth/oauth/callback`
- **方法**：GET
- **参数**：
  - `code`：OAuth授权码
- **响应**：
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "...",
        "email": "...",
        "name": "..."
      },
      "token": "JWT令牌"
    }
  }
  ```

### 1.3 邮箱密码登录

- **路径**：`/api/auth/login`
- **方法**：POST
- **请求体**：
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "...",
        "email": "...",
        "name": "..."
      },
      "token": "JWT令牌"
    }
  }
  ```

### 1.4 用户注册

- **路径**：`/api/auth/register`
- **方法**：POST
- **请求体**：
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "用户名"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "...",
        "email": "...",
        "name": "..."
      },
      "token": "JWT令牌"
    }
  }
  ```

### 1.5 获取当前用户

- **路径**：`/api/auth/me`
- **方法**：GET
- **Headers**：
  - `Authorization: Bearer <token>`
- **响应**：
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "...",
        "email": "...",
        "name": "..."
      }
    }
  }
  ```

### 1.6 登出

- **路径**：`/api/auth/logout`
- **方法**：POST
- **Headers**：
  - `Authorization: Bearer <token>`
- **响应**：
  ```json
  {
    "success": true,
    "message": "登出成功"
  }
  ```

## 2. 体质辨识接口

### 2.1 提交体质问卷

- **路径**：`/api/constitution/submit`
- **方法**：POST
- **Headers**：
  - `Authorization: Bearer <token>`
- **请求体**：
  ```json
  {
    "answers": [
      {"question_id": 1, "score": 3},
      {"question_id": 2, "score": 2},
      // 更多问题...
    ]
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "data": {
      "constitution_type": "平和质",
      "scores": {
        "平和质": 85,
        "气虚质": 15,
        // 其他体质分数...
      },
      "advice": "..."
    }
  }
  ```

### 2.2 获取最新结果

- **路径**：`/api/constitution/result`
- **方法**：GET
- **Headers**：
  - `Authorization: Bearer <token>`
- **响应**：
  ```json
  {
    "success": true,
    "data": {
      "constitution_type": "平和质",
      "scores": {...},
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
  ```

### 2.3 获取历史记录

- **路径**：`/api/constitution/history`
- **方法**：GET
- **Headers**：
  - `Authorization: Bearer <token>`
- **响应**：
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "...",
        "constitution_type": "平和质",
        "scores": {...},
        "created_at": "2024-01-01T00:00:00Z"
      },
      // 更多历史记录...
    ]
  }
  ```

## 3. 对话接口

### 3.1 创建会话

- **路径**：`/api/chat/sessions`
- **方法**：POST
- **Headers**：
  - `Authorization: Bearer <token>`
- **请求体**：
  ```json
  {
    "title": "健康咨询"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "data": {
      "session": {
        "id": "...",
        "title": "健康咨询",
        "created_at": "2024-01-01T00:00:00Z"
      }
    }
  }
  ```

### 3.2 获取会话列表

- **路径**：`/api/chat/sessions`
- **方法**：GET
- **Headers**：
  - `Authorization: Bearer <token>`
- **响应**：
  ```json
  {
    "success": true,
    "data": {
      "sessions": [
        {
          "id": "...",
          "title": "健康咨询",
          "created_at": "2024-01-01T00:00:00Z",
          "updated_at": "2024-01-01T00:00:00Z"
        },
        // 更多会话...
      ]
    }
  }
  ```

### 3.3 删除会话

- **路径**：`/api/chat/sessions/:id`
- **方法**：DELETE
- **Headers**：
  - `Authorization: Bearer <token>`
- **响应**：
  ```json
  {
    "success": true,
    "message": "会话删除成功"
  }
  ```

### 3.4 发送消息（流式）

- **路径**：`/api/chat/message`
- **方法**：POST
- **Headers**：
  - `Authorization: Bearer <token>`
- **请求体**：
  ```json
  {
    "session_id": "...",
    "content": "我最近睡不好怎么办？"
  }
  ```
- **响应**：
  - 类型：`text/event-stream`
  - 格式：
  ```
  data: {"type": "token", "content": "您"}
  data: {"type": "token", "content": "好"}
  data: {"type": "done"}
  ```

### 3.5 获取历史消息

- **路径**：`/api/chat/sessions/:id/messages`
- **方法**：GET
- **Headers**：
  - `Authorization: Bearer <token>`
- **响应**：
  ```json
  {
    "success": true,
    "data": {
      "messages": [
        {
          "id": "...",
          "role": "user",
          "content": "我最近睡不好怎么办？",
          "created_at": "2024-01-01T00:00:00Z"
        },
        {
          "id": "...",
          "role": "assistant",
          "content": "您好，失眠可能是由于...",
          "created_at": "2024-01-01T00:00:00Z"
        }
      ]
    }
  }
  ```

## 4. 养生方案接口

### 4.1 生成养生方案

- **路径**：`/api/wellness/generate`
- **方法**：POST
- **Headers**：
  - `Authorization: Bearer <token>`
- **请求体**：
  ```json
  {
    "constitution_type": "平和质"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "data": {
      "plan": {
        "id": "...",
        "constitution_type": "平和质",
        "diet_advice": "...",
        "exercise_advice": "...",
        "lifestyle_advice": "...",
        "acupoint_advice": "..."
      }
    }
  }
  ```

### 4.2 获取养生方案

- **路径**：`/api/wellness/plan`
- **方法**：GET
- **Headers**：
  - `Authorization: Bearer <token>`
- **响应**：
  ```json
  {
    "success": true,
    "data": {
      "plan": {
        "id": "...",
        "constitution_type": "平和质",
        "diet_advice": "...",
        "exercise_advice": "...",
        "lifestyle_advice": "...",
        "acupoint_advice": "...",
        "created_at": "2024-01-01T00:00:00Z"
      }
    }
  }
  ```

### 4.3 更新养生方案

- **路径**：`/api/wellness/plan`
- **方法**：PUT
- **Headers**：
  - `Authorization: Bearer <token>`
- **请求体**：
  ```json
  {
    "plan_id": "...",
    "diet_advice": "...",
    "exercise_advice": "...",
    "lifestyle_advice": "...",
    "acupoint_advice": "..."
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "养生方案更新成功"
  }
  ```

## 5. 提醒接口

### 5.1 获取提醒列表

- **路径**：`/api/reminders`
- **方法**：GET
- **Headers**：
  - `Authorization: Bearer <token>`
- **响应**：
  ```json
  {
    "success": true,
    "data": {
      "reminders": [
        {
          "id": "...",
          "content": "按时服药",
          "type": "medication",
          "time": "08:00",
          "is_completed": false,
          "created_at": "2024-01-01T00:00:00Z"
        },
        // 更多提醒...
      ]
    }
  }
  ```

### 5.2 创建提醒

- **路径**：`/api/reminders`
- **方法**：POST
- **Headers**：
  - `Authorization: Bearer <token>`
- **请求体**：
  ```json
  {
    "content": "按时服药",
    "type": "medication",
    "time": "08:00"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "data": {
      "reminder": {
        "id": "...",
        "content": "按时服药",
        "type": "medication",
        "time": "08:00",
        "is_completed": false,
        "created_at": "2024-01-01T00:00:00Z"
      }
    }
  }
  ```

### 5.3 更新提醒

- **路径**：`/api/reminders/:id`
- **方法**：PUT
- **Headers**：
  - `Authorization: Bearer <token>`
- **请求体**：
  ```json
  {
    "content": "按时服药",
    "type": "medication",
    "time": "08:30",
    "is_completed": true
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "提醒更新成功"
  }
  ```

### 5.4 删除提醒

- **路径**：`/api/reminders/:id`
- **方法**：DELETE
- **Headers**：
  - `Authorization: Bearer <token>`
- **响应**：
  ```json
  {
    "success": true,
    "message": "提醒删除成功"
  }
  ```

## 6. RAG服务接口

### 6.1 健康检查

- **路径**：`/api/health`
- **方法**：GET
- **响应**：
  ```json
  {
    "status": "ok"
  }
  ```

### 6.2 普通对话接口

- **路径**：`/api/chat`
- **方法**：POST
- **请求体**：
  ```json
  {
    "user_id": "...",
    "message": "我最近睡不好怎么办？"
  }
  ```
- **响应**：
  ```json
  {
    "reply": "您好，失眠可能是由于..."
  }
  ```

### 6.3 流式对话接口

- **路径**：`/api/chat/stream`
- **方法**：POST
- **请求体**：
  ```json
  {
    "user_id": "...",
    "message": "我最近睡不好怎么办？"
  }
  ```
- **响应**：
  - 类型：`text/event-stream`
  - 格式：
  ```
  data: {"type": "step", "step": "intent", "content": "正在识别用户意图..."}
  data: {"type": "step", "step": "retrieve", "content": "正在检索相关知识库..."}
  data: {"type": "token", "content": "您"}
  data: {"type": "token", "content": "好"}
  data: {"type": "done"}
  ```

### 6.4 获取仪表盘数据

- **路径**：`/api/wellness/dashboard`
- **方法**：GET
- **响应**：
  ```json
  {
    "user": {
      "constitution": "平和质",
      "constitution_scores": {...}
    },
    "recentSessions": [...],
    "stats": {
      "totalChats": 10,
      "constitutionRecords": 2,
      "hasPlan": true,
      "healthRecords": 5
    }
  }
  ```

## 7. 错误码

| 错误码 | 描述 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 502 | 网关错误 |
| 503 | 服务不可用 |

## 8. 示例请求

### 使用 curl 测试API

```bash
# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# 获取当前用户
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token>"

# 发送消息
curl -X POST http://localhost:3000/api/chat/message \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "...", "content": "我最近睡不好怎么办？"}'
```

## 9. 注意事项

1. **认证**：所有需要用户登录的接口都需要在请求头中添加 `Authorization: Bearer <token>`

2. **速率限制**：API有速率限制，每IP每分钟最多60次请求

3. **CORS**：已配置CORS，允许前端跨域请求

4. **数据安全**：敏感数据已加密存储，API传输使用HTTPS

---

## 联系方式

- 项目地址: [https://github.com/daoti406/xiaogancao](https://github.com/daoti406/xiaogancao)
- 问题反馈: [GitHub Issues](https://github.com/daoti406/xiaogancao/issues)
