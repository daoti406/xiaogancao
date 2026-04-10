import json
from sentence_transformers import SentenceTransformer, InputExample, losses
from torch.utils.data import DataLoader

# ========== 配置 ==========
MODEL_NAME = "BAAI/bge-small-zh-v1.5"
OUTPUT_DIR = "./models/tcm_embedding_pro"#导出数据到
DATA_PATH = "data/shennong_pro.json"#训练的数据来源
EPOCHS = 1#训练轮数
BATCH_SIZE = 32#块大小
LEARNING_RATE = 2e-5
WARMUP_STEPS = 500

# ========== 加载预训练模型 ==========
model = SentenceTransformer(MODEL_NAME)

# ========== 加载数据（只取正样本对）==========
def load_training_data(data_path):
    with open(data_path, 'r', encoding='utf-8') as f:
        data = [json.loads(line) for line in f if line.strip()]
    train_examples = []
    for item in data:
        # 假设字段为 'query' 和 'response'
        train_examples.append(InputExample(texts=[item["query"], item["response"]]))
    return train_examples
#两个字段query和response
train_examples = load_training_data(DATA_PATH)
print(f"加载了 {len(train_examples)} 条正样本对")
#训练的样本
# ========== 数据加载器 ==========
train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=BATCH_SIZE)

# ========== 损失函数 ==========
train_loss = losses.MultipleNegativesRankingLoss(model)

# ========== 训练 ==========
model.fit(
    train_objectives=[(train_dataloader, train_loss)],
    epochs=EPOCHS,
    warmup_steps=WARMUP_STEPS,
    optimizer_params={'lr': LEARNING_RATE},
    output_path=OUTPUT_DIR,
    save_best_model=True,
    show_progress_bar=True
)

print(f"嵌入模型训练完成，保存至 {OUTPUT_DIR}")