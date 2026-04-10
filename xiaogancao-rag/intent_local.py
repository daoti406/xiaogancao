import requests
import json

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "qwen2:1.5b"   # 确保你已拉取该模型

def classify_intent(question: str) -> str:
    prompt = f"""你是一个意图识别助手。请将用户的问题分类为以下三类之一：
- medical: 中医药相关的咨询（如症状描述、问方剂、问调理、问中药等）
- greeting: 问候、打招呼（如你好、在吗、早上好等）
- other: 其他不相关的问题（如天气、笑话、闲聊等）

用户问题：{question}
只输出分类结果（medical、greeting 或 other），不要输出其他任何内容。"""

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0, "num_predict": 10}
    }
    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=30)
        response.raise_for_status()
        result = response.json()
        raw = result.get("response", "").strip().lower()
        if "medical" in raw:
            return "medical"
        elif "greeting" in raw:
            return "greeting"
        else:
            return "other"
    except Exception as e:
        print(f"意图识别调用失败: {e}")
        return "other"