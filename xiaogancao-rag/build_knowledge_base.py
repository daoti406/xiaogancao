#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
构建独立的中医知识库向量数据库
"""

import json
import os
from sentence_transformers import SentenceTransformer
import chromadb

# 配置
DATA_DIR = "./data/tcm_knowledge"
VECTOR_DB_PATH = "./chroma_knowledge_db"
EMBED_MODEL_PATH = "./models/tcm_embedding_pro"
COLLECTION_NAME = "tcm_knowledge"

# 加载嵌入模型
print("加载嵌入模型...")
embed_model = SentenceTransformer(EMBED_MODEL_PATH)

# 连接向量数据库
print("连接向量数据库...")
client = chromadb.PersistentClient(path=VECTOR_DB_PATH)
collection = client.get_or_create_collection(COLLECTION_NAME)

# 处理文档
documents = []
metadatas = []
ids = []

# 处理 shennong_dataset.json
print("处理 shennong_dataset.json...")
dataset_path = "./data/shennong_dataset.json"
if os.path.exists(dataset_path):
    with open(dataset_path, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f):
            try:
                data = json.loads(line.strip())
                # 使用 query 和 response 作为文档内容
                doc = f"问题: {data.get('query', '')}\n回答: {data.get('response', '')}"
                documents.append(doc)
                metadatas.append({"source": "shennong_dataset", "id": i})
                ids.append(f"shennong_{i}")
            except Exception as e:
                print(f"处理行 {i} 时出错: {e}")

# 处理 shennong_pro.json
print("处理 shennong_pro.json...")
pro_dataset_path = "./data/shennong_pro.json"
if os.path.exists(pro_dataset_path):
    with open(pro_dataset_path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
            for i, item in enumerate(data):
                doc = f"问题: {item.get('query', '')}\n回答: {item.get('response', '')}"
                documents.append(doc)
                metadatas.append({"source": "shennong_pro", "id": i})
                ids.append(f"shennong_pro_{i}")
        except Exception as e:
            print(f"处理 shennong_pro.json 时出错: {e}")

# 处理 tcm_knowledge 目录中的文档
print("处理 tcm_knowledge 目录中的文档...")
if os.path.exists(DATA_DIR):
    for root, dirs, files in os.walk(DATA_DIR):
        for file in files:
            if file.endswith('.json'):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        # 根据文件结构处理
                        if isinstance(data, list):
                            for i, item in enumerate(data):
                                if isinstance(item, dict):
                                    doc = f"问题: {item.get('query', '')}\n回答: {item.get('response', '')}"
                                    documents.append(doc)
                                    metadatas.append({"source": file, "id": i})
                                    ids.append(f"{file}_{i}")
                        elif isinstance(data, dict):
                            doc = f"问题: {data.get('query', '')}\n回答: {data.get('response', '')}"
                            documents.append(doc)
                            metadatas.append({"source": file})
                            ids.append(file)
                except Exception as e:
                    print(f"处理文件 {file} 时出错: {e}")

# 向量化并添加到数据库
print(f"处理 {len(documents)} 个文档...")
if documents:
    # 批量处理，避免内存问题
    batch_size = 100
    for i in range(0, len(documents), batch_size):
        batch_docs = documents[i:i+batch_size]
        batch_metas = metadatas[i:i+batch_size]
        batch_ids = ids[i:i+batch_size]
        
        # 生成嵌入
        embeddings = embed_model.encode(batch_docs).tolist()
        
        # 添加到集合
        collection.add(
            documents=batch_docs,
            metadatas=batch_metas,
            embeddings=embeddings,
            ids=batch_ids
        )
        print(f"已添加 {i+len(batch_docs)}/{len(documents)} 个文档")

print("知识库构建完成！")
print(f"向量数据库路径: {VECTOR_DB_PATH}")
print(f"集合名称: {COLLECTION_NAME}")
print(f"总文档数: {collection.count()}")
