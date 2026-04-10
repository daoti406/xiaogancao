import os
import httpx
from collections import Counter
from langchain_core.tools import tool
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

@tool
def analyze_health_trend(user_id: str) -> str:
    """
    根据用户历史体质记录，分析体质变化趋势，给出简单建议。
    返回趋势描述字符串。
    """
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        return "请检查 Supabase 环境配置（SUPABASE_URL 和 SUPABASE_ANON_KEY）"

    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
    }
    # 查询最近5条记录（按时间倒序）
    params = {
        "select": "constitution_type, created_at",
        "user_id": f"eq.{user_id}",
        "order": "created_at.desc",
        "limit": 5
    }
    url = f"{SUPABASE_URL}/rest/v1/constitution_results"

    try:
        with httpx.Client() as client:
            response = client.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
    except Exception as e:
        return f"查询历史体质失败: {e}"

    if not data:
        return "暂无历史体质记录，请先完成体质测评。"

    # 统计所有体质标签（支持逗号分隔的多体质）
    all_labels = []
    for record in data:
        raw = record.get("constitution_type", "")
        if raw:
            # 按逗号拆分，去除空白，过滤空字符串
            labels = [label.strip() for label in raw.split(",") if label.strip()]
            all_labels.extend(labels)

    if not all_labels:
        return "历史记录中的体质数据为空。"

    counter = Counter(all_labels)
    most_common_label, most_common_count = counter.most_common(1)[0]
    total_labels = len(all_labels)
    total_records = len(data)

    # 构造返回消息
    trend_msg = (
        f"在最近 {total_records} 次测评中，共记录了 {total_labels} 个体质标签。"
        f"最常见的体质是「{most_common_label}」（出现 {most_common_count} 次）。"
    )
    if len(counter) > 1:
        other_labels = [f"「{label}」({count}次)" for label, count in counter.most_common()[1:]]
        trend_msg += f" 其他体质包括: {', '.join(other_labels)}。"
    trend_msg += " 建议持续关注并针对性调理。"

    return trend_msg

# 测试（可选）
if __name__ == "__main__":
    # 替换为真实的 user_id
    test_user_id = "your-user-id"
    result = analyze_health_trend.invoke({"user_id": test_user_id})
    print(result)