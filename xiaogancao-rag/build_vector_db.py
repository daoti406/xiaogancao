import json
from sentence_transformers import SentenceTransformer
import chromadb#本地数据库

# ========== 配置 ==========
EMBED_MODEL_PATH = "./models/tcm_embedding_pro"   # 微调后的模型路径
DATA_PATH = "data/shennong_pro.json"               # 清洗后的数据
CHROMA_DB_PATH = "./chroma_db"

# ========== 加载嵌入模型 ==========
print("加载嵌入模型...")
model = SentenceTransformer(EMBED_MODEL_PATH)

# ========== 加载数据 ==========
print("加载数据...")
documents = []
with open(DATA_PATH, 'r', encoding='utf-8') as f:
    for line in f:
        if line.strip():
            item = json.loads(line)
            content = f"问题：{item['query']}\n回答：{item['response']}"
            documents.append(content)

# ========== 创建 Chroma 集合 ==========
client = chromadb.PersistentClient(path=CHROMA_DB_PATH)#客户端
try:
    client.delete_collection("tcm_docs")
except:
    pass
collection = client.create_collection("tcm_docs")

# ========== 分批插入 ==========
batch_size = 100#块大小100
for i in range(0, len(documents), batch_size):
    batch = documents[i:i+batch_size]
    embeddings = model.encode(batch).tolist()
    ids = [str(j) for j in range(i, i+len(batch))]
    collection.add(embeddings=embeddings, documents=batch, ids=ids)
    print(f"已添加 {i+len(batch)} / {len(documents)}")

print("向量库构建完成！")