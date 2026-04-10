import os
import sys
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
sys.path.append(os.path.dirname(__file__))
from langchain_ollama import ChatOllama
from langchain.agents import AgentExecutor, create_react_agent
from langchain.prompts import PromptTemplate
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
tools = [get_user_constitution, generate_wellness_plan]
prompt = PromptTemplate.from_template("""
你是一个专业的中医养生助手，名叫小甘草。你可以使用以下工具：

{tools}

工具名称：{tool_names}

请严格按照以下格式回答（可以多步思考）：
Question: 用户的问题
Thought: 思考需要做什么
Action: 工具名称（必须是 [{tool_names}] 之一）
Action Input: 工具的输入参数（JSON格式，例如 {{"user_id": "123"}}）
Observation: 工具返回的结果
... (重复 Thought/Action/Observation 多次)
Thought: 我现在知道最终答案了
Final Answer: 对用户的最终回答（中文，亲切专业）

开始！

Question: {input}
Thought: {agent_scratchpad}
                                      """)
agent=create_react_agent(llm,tools,prompt)
agent_executor=AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=False,          # 生产环境建议关闭，调试时可开
    max_iterations=5,
    handle_parsing_errors=True,
)
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
        full_input = f"用户ID是 {request.user_id}，问题：{request.message}"
        # 使用 invoke 而不是 run
        result = agent_executor.invoke({"input": full_input})
        reply = result["output"]
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