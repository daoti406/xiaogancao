#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
LangChain + Ollama ReAct Agent
阶段2：临时LLM与基础Agent搭建
满足2.1~2.5所有要求
"""

import os
import sys
from dotenv import load_dotenv

# 确保能找到 tools 模块（根据你的项目结构调整）
sys.path.append(os.path.dirname(__file__))

from langchain_ollama import ChatOllama
from langchain.agents import AgentExecutor, create_react_agent
from langchain.prompts import PromptTemplate

# 导入阶段1的工具（至少两个）
from tools.constitution import get_user_constitution
from tools.generate_wellness_plan import generate_wellness_plan

# 加载环境变量（如果需要 API Key 等，本脚本使用本地 Ollama，无需 key）
load_dotenv()

# ========== 1. 初始化本地 LLM（Ollama）==========
# 确保已安装 ollama 并拉取了模型，例如: ollama pull qwen2:1.5b
# 如果使用 qwen3:8b 会比较慢，建议用小模型测试
MODEL_NAME = "qwen3:8b"   # 可改为 "qwen3:8b" 或 "llama3.2:1b"
llm = ChatOllama(
    model=MODEL_NAME,
    temperature=0.7,
    base_url="http://localhost:11434",  # Ollama 默认地址
    num_predict=512,                     # 限制输出长度，加快响应
)

# ========== 2. 工具列表（至少2个）==========
tools = [get_user_constitution, generate_wellness_plan,generate_wellness_plan]

# ========== 3. ReAct Prompt 模板（中医专用格式）==========
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

# ========== 4. 创建 Agent 和执行器 ==========
agent = create_react_agent(llm, tools, prompt)
executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,          # 打印中间步骤（满足2.5）
    max_iterations=5,
    handle_parsing_errors=True,
)

# ========== 5. 命令行交互测试 ==========
if __name__ == "__main__":
    print(f"小甘草 Agent 已启动（使用模型: {MODEL_NAME}）")
    print("输入 quit 退出\n")
    while True:
        user_input = input("你: ")
        if user_input.lower() in ["quit", "exit"]:
            break
        # 为了工具能获取 user_id，我们在输入中显式提供（也可从会话上下文获取）
        full_input = f"用户ID是 test123，问题：{user_input}"
        try:
            result = executor.invoke({"input": full_input})
            print(f"小甘草: {result['output']}\n")
        except Exception as e:
            print(f"错误: {e}\n")