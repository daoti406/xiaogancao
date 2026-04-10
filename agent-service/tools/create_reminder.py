from langchain_core.tools import tool
@tool
def create_reminder(user_id: str, content: str, time: str) -> str:
    """
    为用户创建一条提醒。返回操作结果。
    """
    # TODO: 后续替换为真实的 Supabase 插入
    # 当前 mock 实现
    print(f"[Mock] 创建提醒: user_id={user_id}, content={content}, time={time}")
    return f"提醒已创建：{content} 于 {time}"

# 测试代码（可选）
if __name__ == "__main__":
    result = create_reminder.invoke({
        "user_id": "test123",
        "content": "喝山药粥",
        "time": "2025-05-10 09:00:00"
    })
    print(result)