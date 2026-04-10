import os
import httpx
from langchain_core.tools import tool
from dotenv import load_dotenv
load_dotenv()#读取env文件的url&key
SUPABASE_URL=os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY=os.getenv("SUPABASE_ANON_KEY")
@tool#装饰器 标记为一个“工具”，让 Agent 能够识别和调用它。
def get_user_constitution(user_id:str)-> str:
#get_user_constitution函数名，user_id:str规定为str类型->str返回str类型
#"""内容作为该工具的描述
    """
    根据用户ID获取其中医体质类型。
    返回体质名称，如"气虚质"；如果查询失败或未找到，返回"请先进行体质测试"。
    """
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        return "请检查您的env配置是否正确"
    headers={
        "apikey":SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
    }
    params={
        "select":"constitution_type",
        "user_id": f"eq.{user_id}", 
        "order":"created_at.desc",
        "limit":1
    }
    url=f"{SUPABASE_URL}/rest/v1/constitution_results"
    try:
        with httpx.Client() as client:
            response=client.get(url,headers=headers,params=params)
            response.raise_for_status()
            data=response.json()
            if data:
                raw = data[0]["constitution_type"]
# 如果包含逗号，只取第一个体质（主要体质）
                main_constitution = raw.split(',')[0].strip() if raw else "平和质"
                return main_constitution
            return "未查找您的体质，请先进行体质测试。"
    except Exception as e:
        print(f"没有查找到您的体质：{e}")
        return "请先进行体质测试"