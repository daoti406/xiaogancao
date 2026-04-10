import torch
from sentence_transformers import SentenceTransformer
import chromadb
from transformers import AutoTokenizer, AutoModelForCausalLM

EMBED_MODEL_PATH = "./models/tcm_embedding_pro"
DIALOGUE_MODEL_PATH = "./models/tcm_dialogue"  # 或具体 checkpoint 路径
CHROMA_DB_PATH = "./chroma_db"

embed_model = SentenceTransformer(EMBED_MODEL_PATH)
tokenizer = AutoTokenizer.from_pretrained(DIALOGUE_MODEL_PATH, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    DIALOGUE_MODEL_PATH,
    torch_dtype=torch.float16,
    device_map="auto",
    trust_remote_code=True,
)

client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
collection = client.get_collection("tcm_docs")

SYSTEM_PROMPT = "你是“小甘草”，一位温暖、贴心的中医朋友。请根据知识库回答，使用 😊 等表情，结尾加安全提示。"

def query_tcm(question, top_k=3):
    q_emb = embed_model.encode(question).tolist()
    results = collection.query(query_embeddings=[q_emb], n_results=top_k)
    context = "\n\n".join(results['documents'][0])
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"知识库：{context}\n问题：{question}"}
    ]
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(text, return_tensors="pt").to(model.device)
    outputs = model.generate(**inputs, max_new_tokens=512, temperature=0.7)
    answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
    if "assistant" in answer:
        answer = answer.split("assistant")[-1].strip()
    return answer

if __name__ == "__main__":
    print("测试微调后模型，输入 exit 退出")
    while True:
        q = input("\n用户: ")
        if q.lower() == "exit":
            break
        print("小甘草:", query_tcm(q))