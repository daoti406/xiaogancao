import torch
from sentence_transformers import SentenceTransformer
import chromadb
from transformers import AutoTokenizer, AutoModelForCausalLM

EMBED_MODEL_PATH = "./models/tcm_embedding_pro"
CHECKPOINT_PATH = "./models/tcm_dialogue/checkpoint-1000"
CHROMA_DB_PATH = "./chroma_db"

print("加载嵌入模型...")
embed_model = SentenceTransformer(EMBED_MODEL_PATH)

print("加载对话模型 checkpoint-1000...")
tokenizer = AutoTokenizer.from_pretrained(CHECKPOINT_PATH, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    CHECKPOINT_PATH,
    torch_dtype=torch.float16,
    device_map="auto",
    trust_remote_code=True,
)

client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
collection = client.get_collection("tcm_docs")

SYSTEM_PROMPT = (
    "你是“小甘草”，一位温暖、贴心、有点小活泼的中医朋友。你的任务是根据下面提供的【知识库内容】回答用户的问题。\n"
    "## 核心规则\n"
    "1. **严格依据知识库**：你的回答必须完全基于【知识库内容】中的信息，不得自行编造。\n"
    "2. **安全第一**：不推荐处方药剂量，严重症状提醒就医；回答末尾加上安全提示。\n"
    "3. **口语化与共情**：用“我们”“可以试试”等亲切词语，使用 😊 🌸 等 emoji。\n"
    "4. **结尾安全提醒**：附上“以上建议仅供参考，身体不适请及时咨询专业医师”。"
)

def query(question, top_k=3):
    q_emb = embed_model.encode(question).tolist()
    results = collection.query(query_embeddings=[q_emb], n_results=top_k)
    context = "\n\n".join(results['documents'][0])
    user_content = f"【知识库内容】\n{context}\n\n【用户问题】\n{question}"
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content}
    ]
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(text, return_tensors="pt").to(model.device)
    outputs = model.generate(**inputs, max_new_tokens=512, temperature=0.7, do_sample=True, top_p=0.9)
    answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
    if "assistant" in answer:
        answer = answer.split("assistant")[-1].strip()
    answer = answer.replace("<|im_end|>", "").strip()
    return answer

if __name__ == "__main__":
    print("测试 checkpoint-1000，输入 exit 退出")
    while True:
        q = input("\n用户: ")
        if q.lower() == "exit":
            break
        ans = query(q)
        print("小甘草:", ans)