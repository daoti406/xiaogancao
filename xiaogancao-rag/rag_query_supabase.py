import torch
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig

# ========== Supabase 配置 ==========
SUPABASE_URL = "https://taxrsampmqghfwnhszlg.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRheHJzYW1wbXFnaGZ3bmhzemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTUwMzEsImV4cCI6MjA4OTk3MTAzMX0.rU-YVi4l_TcJ2D8TlBH4hwfYDaVv2m5TJx-Jg-ILXKI"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ========== 嵌入模型 ==========
EMBED_MODEL_PATH = "./models/tcm_embedding"
embed_model = SentenceTransformer(EMBED_MODEL_PATH)

# ========== 对话模型（未微调，4-bit量化）==========
GEN_MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.bfloat16,
)
tokenizer = AutoTokenizer.from_pretrained(GEN_MODEL_NAME, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    GEN_MODEL_NAME,
    quantization_config=bnb_config,
    device_map="auto",
    trust_remote_code=True,
)

# ========== 查询函数 ==========
def query_tcm(question, top_k=3, threshold=0.5):
    # 1. 生成问题向量
    q_emb = embed_model.encode(question).tolist()
    # 2. 调用 Supabase RPC 检索
    result = supabase.rpc(
        "match_tcm_documents",
        {
            "query_embedding": q_emb,
            "match_threshold": threshold,
            "match_count": top_k
        }
    ).execute()
    documents = result.data
    if not documents:
        context = "未找到高度相关的参考资料。"
    else:
        context = "\n\n".join([doc["content"] for doc in documents])
    # 3. 构建 prompt
    system_prompt = "你是一位专业的中医药专家。请根据以下参考资料回答用户的问题。如果资料中没有相关信息，请基于你的知识给出专业建议。"
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"参考资料：\n{context}\n\n问题：{question}\n\n回答："}
    ]
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(text, return_tensors="pt").to(model.device)
    outputs = model.generate(
        **inputs,
        max_new_tokens=512,
        temperature=0.7,
        do_sample=True,
        top_p=0.9,
    )
    answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
    # 简单提取回答部分（可根据模板调整）
    if "回答：" in answer:
        answer = answer.split("回答：")[-1].strip()
    return answer

if __name__ == "__main__":
    print("中医药问答系统启动（Supabase 版），输入 'exit' 退出")
    while True:
        q = input("\n用户: ")
        if q.lower() == "exit":
            break
        ans = query_tcm(q)
        print("助手:", ans)