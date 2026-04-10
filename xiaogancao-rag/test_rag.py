import torch
from sentence_transformers import SentenceTransformer
import chromadb
from transformers import AutoTokenizer, AutoModelForCausalLM

# 配置
EMBED_MODEL_PATH = "./models/tcm_embedding_pro"   # 你的嵌入模型
GEN_MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"    # 原版对话模型
CHROMA_DB_PATH = "./chroma_db"

# 加载嵌入模型
print("加载嵌入模型...")
embed_model = SentenceTransformer(EMBED_MODEL_PATH)

# 加载对话模型
print("加载对话模型...")
tokenizer = AutoTokenizer.from_pretrained(GEN_MODEL_NAME, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    GEN_MODEL_NAME,
    torch_dtype=torch.float16,
    device_map="auto",
    trust_remote_code=True,
)

# 连接 ChromaDB
client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
collection = client.get_collection("tcm_docs")

# 强约束系统提示词
SYSTEM_PROMPT_TEMPLATE="""你是“小甘草”，一位温暖、贴心、有点小活泼的中医朋友。请根据【知识库内容】回答用户问题，严格遵守以下规则：

1. **开头**：用一个 emoji（😊/🌸/💛）表达关心。
2. **辨证分析**：依据知识库指出可能的证候（如“这可能是湿热泄泻”）。
3. **调理建议**（每类最多一条，不编造）：
   - 食疗方：推荐一种食物或茶饮。
   - 穴位指导：推荐一个穴位及简单按压法（若知识库有）。
   - 生活小贴士：一条简单建议。
4. **绝对禁止**：
   - ❌ 不得推荐任何中药、中成药的具体剂量或服用方法（如“每次X粒，一天X次”）。
   - ❌ 不得编造知识库中没有的食疗、穴位或药物。
   - ❌ 不得使用“可能”、“或许”等模糊词汇。
5. **安全提醒**：结尾必须包含：“✨ 以上建议仅供参考，身体不适请及时咨询专业医师。” 如果涉及孕妇、儿童或严重症状，必须提前强调就医。

【知识库内容】
{context}

【用户问题】
{question}"""
def query_tcm(question, top_k=3):
    # 检索
    q_emb = embed_model.encode(question).tolist()
    results = collection.query(query_embeddings=[q_emb], n_results=top_k)
    context = "\n\n".join(results['documents'][0])
    
    # 填充提示词
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(context=context, question=question)
    
    # Qwen 聊天格式
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "请根据上述要求回答。"}
    ]
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(text, return_tensors="pt").to(model.device)
    outputs = model.generate(
        **inputs,
        max_new_tokens=512,
        temperature=0.6,
        do_sample=True,
        top_p=0.9,
        repetition_penalty=1.1,
    )
    answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
    if "assistant" in answer:
        answer = answer.split("assistant")[-1].strip()
    return answer

if __name__ == "__main__":
    print("中医药问答系统（小甘草风格），输入 exit 退出\n")
    while True:
        q = input("用户: ")
        if q.lower() == "exit":
            break
        print("小甘草:", query_tcm(q))
        print()