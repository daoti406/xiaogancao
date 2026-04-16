import os
import sys
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
sys.path.append(os.path.dirname(__file__))
from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate
from langchain_core.tools import Tool
from tools.constitution import get_user_constitution
from tools.generate_wellness_plan import generate_wellness_plan
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
load_dotenv()
# ========== 1. 初始化 LLM（使用本地 Ollama）==========
# 确保已拉取模型：ollama pull qwen2:1.5b
MODEL_NAME = "qwen2:1.5b"   # 可改为 "qwen3:8b" 或 "llama3.2:1b"
llm = ChatOllama(
    model=MODEL_NAME,
    temperature=0.7,
    base_url="http://localhost:11434",
    num_predict=512,
)
# 直接使用工具
tools = [get_user_constitution, generate_wellness_plan]
# 简单的提示模板
prompt = PromptTemplate.from_template("""
你是一个专业的中医养生助手，名叫小甘草。

请根据用户的问题，提供专业、亲切的回答。

用户问题：{input}
""")
app = FastAPI(title="小甘草 Agent 服务 (LangChain)", description="基于 LangChain ReAct Agent", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # 生产环境应指定具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class ChatRequest(BaseModel):
    user_id: str
    message: str

class ChatResponse(BaseModel):
    reply: str
# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Agent 服务运行正常"}
#核心聊天接口
@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        logger.info(f"收到请求: user_id={request.user_id}, message={request.message}")
        
        # 简单的LLM调用
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.messages import HumanMessage, SystemMessage
        
        # 构建聊天提示
        chat_prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content="你是一个专业的中医养生助手，名叫小甘草。请提供专业、亲切的回答。"),
            HumanMessage(content=request.message)
        ])
        
        # 调用LLM
        chain = chat_prompt | llm
        result = chain.invoke({})
        reply = result.content
        
        logger.info(f"回复生成成功: {reply[:50]}...")
        return ChatResponse(reply=reply)
    except Exception as e:
        logger.error(f"处理请求时发生错误: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"内部错误: {str(e)}")
@app.get("/")
async def root():
    return {"message": "小甘草 Agent 服务已启动，访问 /docs 查看 API 文档"}

# 启动服务
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)