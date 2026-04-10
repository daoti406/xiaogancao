from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import json
import logging
from rag_query import query_tcm, query_tcm_stream

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="小甘草 Agent 服务")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # 允许的前端地址
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有 HTTP 方法
    allow_headers=["*"],  # 允许所有 HTTP 头
)

class ChatRequest(BaseModel):
    user_id: str
    message: str

class ChatResponse(BaseModel):
    reply: str

# 健康检查
@app.get("/api/health")
async def health():
    return {"status": "ok"}

# 普通非流式接口（向后兼容）
@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    reply = query_tcm(req.message)
    return {"reply": reply}

# 流式接口（SSE）
@app.post("/api/chat/stream")
async def chat_stream(req: ChatRequest):
    def event_generator():
        for event in query_tcm_stream(req.message):
            yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")

# 仪表盘数据接口
@app.get("/api/wellness/dashboard")
async def get_dashboard():
    # 返回模拟的仪表盘数据
    return {
        "user": {
            "constitution": "平和质",
            "constitution_scores": {
                "平和质": 85,
                "气虚质": 15,
                "阳虚质": 10,
                "阴虚质": 5,
                "痰湿质": 8,
                "湿热质": 5,
                "血瘀质": 3,
                "气郁质": 2,
                "特禀质": 1
            }
        },
        "recentSessions": [
            {
                "id": "session_1",
                "title": "失眠问题咨询",
                "updated_at": "2024-01-01T10:00:00"
            },
            {
                "id": "session_2",
                "title": "体质辨识结果",
                "updated_at": "2024-01-01T09:00:00"
            }
        ],
        "stats": {
            "totalChats": 10,
            "constitutionRecords": 2,
            "hasPlan": True,
            "healthRecords": 5
        }
    }

# 获取养生方案
@app.get("/api/wellness/plan")
async def get_wellness_plan():
    # 返回模拟的养生方案数据
    return {
        "id": "plan_1",
        "constitution": "平和质",
        "created_at": "2024-01-01T09:00:00",
        "diet_advice": "1. 均衡饮食，多吃蔬菜水果\n2. 适量摄入蛋白质，如鱼、肉、蛋\n3. 饮食规律，定时定量",
        "exercise_advice": "1. 每天进行30分钟中等强度运动\n2. 可以选择散步、太极、瑜伽等\n3. 避免过度劳累",
        "lifestyle_advice": "1. 保持充足睡眠，每晚7-8小时\n2. 保持心情舒畅，避免过度紧张\n3. 规律作息，避免熬夜",
        "acupoint_advice": "1. 按摩足三里穴，增强体质\n2. 按摩太冲穴，调节情绪\n3. 按摩涌泉穴，促进睡眠"
    }

# 生成养生方案
@app.post("/api/wellness/generate")
async def generate_wellness_plan():
    # 返回模拟的养生方案数据
    return {
        "id": "plan_2",
        "constitution": "平和质",
        "created_at": "2024-01-01T10:00:00",
        "diet_advice": "1. 均衡饮食，多吃蔬菜水果\n2. 适量摄入蛋白质，如鱼、肉、蛋\n3. 饮食规律，定时定量",
        "exercise_advice": "1. 每天进行30分钟中等强度运动\n2. 可以选择散步、太极、瑜伽等\n3. 避免过度劳累",
        "lifestyle_advice": "1. 保持充足睡眠，每晚7-8小时\n2. 保持心情舒畅，避免过度紧张\n3. 规律作息，避免熬夜",
        "acupoint_advice": "1. 按摩足三里穴，增强体质\n2. 按摩太冲穴，调节情绪\n3. 按摩涌泉穴，促进睡眠"
    }

if __name__ == "__main__":
    logger.info("Starting server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)