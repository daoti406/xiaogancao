import json

# 假设原始数据是 JSON 列表，每条记录包含 question 和 answer
def convert_to_dialogue_format(input_json, output_json):
    with open(input_json, 'r', encoding='utf-8') as f:
        data = json.load(f)  # 假设格式 [{"query": "...", "response": "..."}, ...]
    
    dialogues = []
    for item in data:
        dialogues.append({
            "instruction": "你是一位专业的中医药专家，请根据用户的问题给出专业、准确的回答。",
            "input": item["question"],
            "output": item["answer"]
        })
    
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(dialogues, f, ensure_ascii=False, indent=2)

# 对于嵌入模型，我们需要构造文本对。这里简单示例：将问答对视为正样本，随机组合负样本。
# 实际应用中可能需要更精细的构造。