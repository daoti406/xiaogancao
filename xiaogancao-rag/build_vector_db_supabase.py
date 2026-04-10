import json
import os
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client

# ========== Supabase 配置 ==========
SUPABASE_URL = "https://taxrsampmqghfwnhszlg.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRheHJzYW1wbXFnaGZ3bmhzemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTUwMzEsImV4cCI6MjA4OTk3MTAzMX0.rU-YVi4l_TcJ2D8TlBH4hwfYDaVv2m5TJx-Jg-ILXKI"   # 或 service_role key
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ========== 嵌入模型路径 ==========
EMBED_MODEL_PATH = "./models/tcm_embedding"

# ========== 数据文件 ==========
DATA_PATH = "data/shennong_dataset.json"

# ========== 加载模型 ==========
print("加载嵌入模型...")
model = SentenceTransformer(EMBED_MODEL_PATH)

# ========== 加载并处理数据 ==========
print("加载数据...")
documents = []
with open(DATA_PATH, 'r', encoding='utf-8') as f:
    for line in f:
        if line.strip():
            item = json.loads(line)
            content = f"问题：{item['query']}\n回答：{item['response']}"
            documents.append(content)

# ========== 分批插入 Supabase ==========
print(f"开始向量化并插入 {len(documents)} 条文档...")
batch_size = 50   # Supabase 单次插入建议不超过 1000，这里保守取 50
for i in range(0, len(documents), batch_size):
    batch = documents[i:i+batch_size]
    # 生成向量
    embeddings = model.encode(batch).tolist()  # 转为 list of lists
    # 构造插入数据
    records = []
    for idx, (content, emb) in enumerate(zip(batch, embeddings)):
        records.append({
            "content": content,
            "embedding": emb
        })
    # 批量插入
    supabase.table("tcm_documents").insert(records).execute()
    print(f"已插入 {i+len(batch)} / {len(documents)}")

print("向量库构建完成！")