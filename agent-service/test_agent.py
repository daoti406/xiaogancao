import os
import sys
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
import httpx

sys.path.append(os.path.dirname(__file__))
from tools.constitution import get_user_constitution
from tools.generate_wellness_plan import generate_wellness_plan

load_dotenv()

api_key = os.getenv("DEEPSEEK_API_KEY")
if not api_key:
    raise ValueError("请在 .env 文件中设置 DEEPSEEK_API_KEY")

# 创建一个同步 HTTP 客户端
http_client = httpx.Client()

llm = ChatOpenAI(
    model="deepseek-chat",
    temperature=0.7,
    api_key=api_key,                      # 直接传入字符串
    base_url="https://api.deepseek.com/v1",
    http_client=http_client,              # 强制使用同步客户端
)

tools = [get_user_constitution, generate_wellness_plan]

agent = create_agent(
    model=llm,
    tools=tools,
    system_prompt="你是一个中医助手，必须使用工具回答问题。当用户询问体质时调用 get_user_constitution；当需要养生方案时调用 generate_wellness_plan。"
)

if __name__ == "__main__":
    user_input = "我的用户ID是 test123，最近总是疲劳，想知道我的体质和养生建议。"
    print(f"用户: {user_input}\n")
    result = agent.invoke({
        "messages": [{"role": "user", "content": user_input}]
    })
    print("小甘草：", result["messages"][-1].content)