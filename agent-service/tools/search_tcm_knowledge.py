import json
from langchain_core.tools import tool
MOCK_KNOWLEDGE = {
    "黄芪": "黄芪，性甘，温。归脾、肺经。功效：补气固表...",
    "气虚": "气虚质常见表现：平素语音低弱，气短懒言...",
    # 你可以添加更多
}
@tool
async def search_tcm_knowledge(query:str)->str:
    """
    根据用户问题检索中医知识库，返回相关信息
    """
    # 1. 遍历 MOCK_KNOWLEDGE，检查 query 是否包含某个关键词
    for key in MOCK_KNOWLEDGE:
        if query==key:
            return json.dumps(key.value,ensure_ascii=False)
        else:
            return "抱歉没有找到相关的信息"
    # 2. 如果找到，构造返回 JSON 字符串
    # 3. 如果没找到，返回默认信息
