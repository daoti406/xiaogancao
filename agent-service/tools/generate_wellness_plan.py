import json
from langchain_core.tools import tool
mock_plans = {
        "气虚质": {
            "diet": "多吃益气食物：山药、黄芪、大枣、鸡肉",
            "sleep": "保证充足睡眠，避免熬夜，中午可小憩",
            "exercise": "选择温和运动：八段锦、散步、太极拳"
        },
        "湿热质": {
            "diet": "清淡饮食：薏米、赤小豆、绿豆、冬瓜",
            "sleep": "规律作息，避免潮湿环境",
            "exercise": "中高强度运动：跑步、游泳、健身操"
        },
        "阳虚质": {
            "diet": "温补食物：生姜、韭菜、羊肉、核桃",
            "sleep": "注意保暖，早睡晚起",
            "exercise": "阳光充足时运动：晒太阳、慢跑"
        },
        "阴虚质": {
            "diet": "滋阴润燥：银耳、百合、鸭肉、梨",
            "sleep": "避免熬夜，保持环境湿润",
            "exercise": "低强度运动：瑜伽、太极"
        },
        "平和质": {
            "diet": "均衡饮食，五谷杂粮、蔬菜水果",
            "sleep": "规律作息，保持充足睡眠",
            "exercise": "多样化运动，保持活力"
        }
    }
@tool
def generate_wellness_plan(constitutions: str) -> str:
    # 如果传入多体质，只取第一个
    """
    根据体质类型生成养生方案，返回包含饮食、作息、运动的JSON字符串。
    """
    main = constitutions.split(',')[0].strip() if constitutions else "平和质"
    plan = mock_plans.get(main, mock_plans["平和质"])
    return json.dumps(plan, ensure_ascii=False)