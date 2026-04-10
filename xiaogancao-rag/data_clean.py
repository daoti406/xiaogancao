import json

# 定义中医药专业关键词列表（可根据需要增删）
keywords = [
    "中医", "中药", "方剂", "辨证", "证候", "治法", "寒热", "虚实",
    "脉", "舌", "证", "方", "汤", "丸", "散", "膏", "丹", "艾灸",
    "针灸", "推拿", "拔罐", "食疗", "养生", "气滞", "血瘀", "湿热",
    "痰湿", "阳虚", "阴虚", "气虚", "血虚", "肝郁", "脾虚", "肾虚"
]

input_file = "data/shennong_dataset.json"
output_file = "data/shennong_pro.json"

cleaned_count = 0
total_count = 0

with open(input_file, 'r', encoding='utf-8') as fin, \
     open(output_file, 'w', encoding='utf-8') as fout:
    for line in fin:
        line = line.strip()
        if not line:
            continue
        total_count += 1
        item = json.loads(line)
        response = item.get("response", "")
        if any(k in response for k in keywords):
            fout.write(line + '\n')
            cleaned_count += 1

print(f"总样本数: {total_count}")
print(f"保留专业样本数: {cleaned_count} ({cleaned_count/total_count:.2%})")