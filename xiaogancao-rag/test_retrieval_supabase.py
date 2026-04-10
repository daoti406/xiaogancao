from sentence_transformers import SentenceTransformer
from supabase import create_client, Client

# Supabase 配置
SUPABASE_URL = "https://taxrsampmqghfwnhszlg.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRheHJzYW1wbXFnaGZ3bmhzemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTUwMzEsImV4cCI6MjA4OTk3MTAzMX0.rU-YVi4l_TcJ2D8TlBH4hwfYDaVv2m5TJx-Jg-ILXKI"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 加载嵌入模型
EMBED_MODEL_PATH = "./models/tcm_embedding"
embed_model = SentenceTransformer(EMBED_MODEL_PATH)

def test_retrieval(question, top_k=3, threshold=0.5):
    q_emb = embed_model.encode(question).tolist()
    result = supabase.rpc(
        "match_tcm_documents",
        {
            "query_embedding": q_emb,
            "match_threshold": threshold,
            "match_count": top_k
        }
    ).execute()
    for doc in result.data:
        print(f"相似度: {doc['similarity']:.4f}")
        print(doc['content'])
        print("-" * 50)

if __name__ == "__main__":
    q = input("请输入问题: ")
    test_retrieval(q)