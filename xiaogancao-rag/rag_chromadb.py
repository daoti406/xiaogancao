import torch
from sentence_transformers import SentenceTransformer
import chromadb
from transformers import AutoTokenizer, AutoModelForCausalLM

# ========== 配置 ==========
EMBED_MODEL_PATH = "./models/tcm_embedding"
CHROMA_DB_PATH = "./chroma_db"
GEN_MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"

# ========== 加载嵌入模型 ==========
embed_model = SentenceTransformer(EMBED_MODEL_PATH)

# ========== 加载对话模型（float16 + CPU offload）==========
print("加载对话模型...")
tokenizer = AutoTokenizer.from_pretrained(GEN_MODEL_NAME, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    GEN_MODEL_NAME,
    torch_dtype=torch.float16,
    device_map="auto",
    offload_folder="./offload",      # 临时文件夹，用于溢出到 CPU
    trust_remote_code=True,
)

# ========== 连接 ChromaDB ==========
client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
collection = client.get_collection("tcm_docs")

# ========== 查询函数 ==========
def query_tcm(question, top_k=3):
    # 检索
    q_emb = embed_model.encode(question).tolist()
    results = collection.query(query_embeddings=[q_emb], n_results=top_k)
    context = "\n\n".join(results['documents'][0])

    # 构建 prompt
    system_prompt = "你是一位专业的中医药专家。请根据以下参考资料回答用户的问题。如果资料中没有相关信息，请基于你的知识给出专业建议。"
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"参考资料：\n{context}\n\n问题：{question}\n\n回答："}
    ]
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)

    # 生成
    inputs = tokenizer(text, return_tensors="pt").to(model.device)
    outputs = model.generate(
        **inputs,
        max_new_tokens=512,
        temperature=0.7,
        do_sample=True,
        top_p=0.9,
    )
    answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
    # 提取回答部分（取决于模板）
    if "回答：" in answer:
        answer = answer.split("回答：")[-1].strip()
    return answer

if __name__ == "__main__":
    print("中医药问答系统启动，输入 'exit' 退出")
    while True:
        q = input("\n用户: ")
        if q.lower() == "exit":
            break
        ans = query_tcm(q)
        print("助手:", ans)