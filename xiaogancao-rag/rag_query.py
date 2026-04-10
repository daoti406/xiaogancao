from sentence_transformers import SentenceTransformer
import chromadb
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from intent_local import classify_intent

# 加载嵌入模型
embed_model = SentenceTransformer("./models/tcm_embedding_pro")

# 连接向量数据库
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_collection("tcm_docs")

# 连接知识库向量数据库
knowledge_client = chromadb.PersistentClient(path="./chroma_knowledge_db")
knowledge_collection = knowledge_client.get_or_create_collection("tcm_knowledge")

# 加载对话模型（使用微调后的路径）
GEN_MODEL_PATH = "./models/tcm_dialogue"  # 使用微调后的模型
tokenizer = AutoTokenizer.from_pretrained(GEN_MODEL_PATH, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    GEN_MODEL_PATH,
    torch_dtype=torch.float16,
    device_map="auto",
    trust_remote_code=True,
)

def query_tcm(question, top_k=3):
    # 意图识别
    intent = classify_intent(question)
    if intent == "greeting":
        return "😊 你好呀！我是小甘草，有什么不舒服可以告诉我～"
    if intent == "other":
        return "请描述具体的症状或问题，我会尽力为您分析。"
    
    # 检索
    q_emb = embed_model.encode(question).tolist()
    results = collection.query(query_embeddings=[q_emb], n_results=top_k)
    context = "\n\n".join(results['documents'][0])
    
    # 构建 prompt
    system_prompt = f"""你是"小甘草"，一位温暖、贴心、富有同理心的中医朋友。你说话自然亲切，就像一位经验丰富的中医师在与患者面对面交流，充满人文关怀。请根据以下【知识库内容】回答用户的问题。

## 核心规则
1. **严格依据知识库**：你的回答必须完全基于【知识库内容】中的信息，不得自行编造。
2. **安全第一**：不推荐任何处方药的具体剂量；对于孕妇、儿童、严重症状等必须提醒就医；回答末尾加上安全提示。
3. **口语化与共情**：使用 😊 🌸 等 emoji，开头表达关心和理解，语气温暖自然，避免生硬的机械感。
4. **结构清晰**：可按"食疗方、穴位指导、生活小贴士"顺序组织，但保持自然流畅的对话感。
5. **结尾安全提醒**：✨ 以上建议仅供参考，身体不适请及时咨询专业医师。

## 知识库内容
{context}

## 用户问题
{question}"""
    
    messages = [{"role": "system", "content": system_prompt}]
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(text, return_tensors="pt").to(model.device)
    outputs = model.generate(**inputs, max_new_tokens=512, temperature=0.7)
    answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
    if "assistant" in answer:
        answer = answer.split("assistant")[-1].strip()
    return answer
def query_tcm_stream(question, top_k=3):
    """
    流式版本：逐步 yield 步骤信息和回答 token
    """
    # 1. 意图识别步骤
    yield {"type": "step", "step": "intent", "content": "正在识别用户意图..."}
    intent = classify_intent(question)
    yield {"type": "step", "step": "intent", "content": f"意图识别完成：{intent}"}
    
    if intent == "greeting":
        final = "😊 你好呀！我是小甘草，有什么不舒服可以告诉我～"
        for ch in final:
            yield {"type": "token", "content": ch}
        yield {"type": "done"}
        return
    if intent == "other":
        final = "请描述具体的症状或问题，我会尽力为您分析。"
        for ch in final:
            yield {"type": "token", "content": ch}
        yield {"type": "done"}
        return
    
    # 2. 检索步骤
    yield {"type": "step", "step": "retrieve", "content": "正在检索相关知识库..."}
    q_emb = embed_model.encode(question).tolist()
    results = collection.query(query_embeddings=[q_emb], n_results=top_k)
    context = "\n\n".join(results['documents'][0])
    yield {"type": "step", "step": "retrieve", "content": f"检索到 {len(results['documents'][0])} 条相关知识"}
    
    # 3. 生成步骤
    yield {"type": "step", "step": "generate", "content": "正在生成回答..."}
    
    system_prompt = f"""你是"小甘草"，一位温暖、贴心、富有同理心的中医朋友。你说话自然亲切，就像一位经验丰富的中医师在与患者面对面交流，充满人文关怀。请根据以下【知识库内容】回答用户的问题。

## 核心规则
1. **严格依据知识库**：你的回答必须完全基于【知识库内容】中的信息，不得自行编造。
2. **安全第一**：不推荐任何处方药的具体剂量；对于孕妇、儿童、严重症状等必须提醒就医；回答末尾加上安全提示。
3. **口语化与共情**：使用 😊 🌸 等 emoji，开头表达关心和理解，语气温暖自然，避免生硬的机械感。
4. **结构清晰**：可按"食疗方、穴位指导、生活小贴士"顺序组织，但保持自然流畅的对话感。
5. **结尾安全提醒**：✨ 以上建议仅供参考，身体不适请及时咨询专业医师。

## 知识库内容
{context}

## 用户问题
{question}"""
    
    messages = [{"role": "system", "content": system_prompt}]
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(text, return_tensors="pt").to(model.device)
    outputs = model.generate(**inputs, max_new_tokens=512, temperature=0.7)
    answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
    if "assistant" in answer:
        answer = answer.split("assistant")[-1].strip()
    
    # 逐字输出最终回答
    for ch in answer:
        yield {"type": "token", "content": ch}
    yield {"type": "done"}

def search_tcm_knowledge(question, top_k=5):
    """
    从独立知识库中检索相关信息
    """
    # 生成嵌入
    q_emb = embed_model.encode(question).tolist()
    
    # 从知识库集合中检索
    results = knowledge_collection.query(query_embeddings=[q_emb], n_results=top_k)
    
    # 整理结果
    knowledge_results = []
    for i, doc in enumerate(results['documents'][0]):
        knowledge_results.append({
            "content": doc,
            "distance": results['distances'][0][i],
            "metadata": results['metadatas'][0][i] if i < len(results['metadatas'][0]) else {}
        })
    
    return knowledge_results