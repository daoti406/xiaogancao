import os
import torch
import json
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    BitsAndBytesConfig,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from peft import LoraConfig, get_peft_model, TaskType, prepare_model_for_kbit_training
from datasets import Dataset

# ========== 强制离线（模型已缓存）==========
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
# ========== 配置 ==========
# ========== 配置 ==========
MODEL_NAME = "./models/Qwen2.5-0.5B-Instruct"   # 顶格，无缩进
OUTPUT_DIR = "./models/tcm_dialogue"
DATA_PATH = "data/shennong_pro.json"
SAMPLE_SIZE = 10000               # 取前10000条，可改为 None 或 0 使用全部
LORA_R = 64
LORA_ALPHA = 16
LORA_DROPOUT = 0.1
BATCH_SIZE = 4
GRADIENT_ACCUMULATION = 4
LEARNING_RATE = 2e-4
EPOCHS = 3
MAX_LENGTH = 512
USE_4BIT = False

# ========== 数据加载函数 ==========
def load_conversation_data(json_path, sample_size=None):
    data = []
    with open(json_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                data.append(json.loads(line))
    print(f"原始数据量: {len(data)} 条")
    if sample_size and sample_size > 0 and len(data) > sample_size:
        data = data[:sample_size]
        print(f"采样后数据量: {len(data)} 条")

    formatted = []
    system_prompt = (
        "你是“小甘草”，一位温暖、贴心、有点小活泼的中医朋友。你的任务是根据用户的问题提供专业的中医建议。\n"
        "核心规则：\n"
        "1. 严格依据中医知识，不编造。\n"
        "2. 安全第一，不推荐处方药剂量，严重症状提醒就医。\n"
        "3. 口语化与共情，使用 😊 🌸 等 emoji。\n"
        "4. 结构清晰，可包含食疗、穴位、生活小贴士。\n"
        "5. 结尾加上“以上建议仅供参考，身体不适请及时咨询专业医师”。"
    )
    for item in data:
        text = (
            f"<|im_start|>system\n{system_prompt}<|im_end|>\n"
            f"<|im_start|>user\n{item['query']}<|im_end|>\n"
            f"<|im_start|>assistant\n{item['response']}<|im_end|>"
        )
        formatted.append({"text": text})
    return Dataset.from_list(formatted)

# ========== 数据预处理函数 ==========
def tokenize_function(examples, tokenizer, max_length):
    tokenized = tokenizer(
        examples["text"],
        truncation=True,
        max_length=max_length,
        padding="max_length",
        return_tensors=None
    )
    tokenized["labels"] = tokenized["input_ids"].copy()
    return tokenized

# ========== 主程序入口 ==========
if __name__ == "__main__":
    # 避免多进程问题的必要保护
    from multiprocessing import freeze_support
    freeze_support()

    # 加载数据
    dataset = load_conversation_data(DATA_PATH, sample_size=SAMPLE_SIZE)
    dataset = dataset.train_test_split(test_size=0.05, seed=42)
    train_dataset = dataset["train"]
    eval_dataset = dataset["test"]

    # 加载分词器
    print("加载分词器...")
    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_NAME,
        trust_remote_code=True,
        local_files_only=True
    )
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # 加载模型
    print("加载模型...")
    if USE_4BIT:
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.bfloat16,
        )
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME,
            quantization_config=bnb_config,
            device_map="auto",
            trust_remote_code=True,
            local_files_only=True
        )
        model = prepare_model_for_kbit_training(model)
    else:
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME,
            torch_dtype=torch.float16,
            device_map="auto",
            trust_remote_code=True,
            local_files_only=True
        )
        model.gradient_checkpointing_enable()
        model.config.use_cache = False

    # LoRA 配置
    lora_config = LoraConfig(
        r=LORA_R,
        lora_alpha=LORA_ALPHA,
        target_modules=["q_proj", "v_proj"],
        lora_dropout=LORA_DROPOUT,
        bias="none",
        task_type=TaskType.CAUSAL_LM,
    )
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    # 数据预处理（需要传递 tokenizer 和 max_length）
    from functools import partial
    tokenize_with_args = partial(tokenize_function, tokenizer=tokenizer, max_length=MAX_LENGTH)
    tokenized_train = train_dataset.map(tokenize_with_args, batched=True, remove_columns=["text"])
    tokenized_eval = eval_dataset.map(tokenize_with_args, batched=True, remove_columns=["text"])
    data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

    # 训练参数
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        gradient_accumulation_steps=GRADIENT_ACCUMULATION,
        learning_rate=LEARNING_RATE,
        num_train_epochs=EPOCHS,
        logging_steps=50,
        eval_strategy="steps",
        eval_steps=500,
        save_strategy="steps",
        save_steps=500,
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        greater_is_better=False,
        fp16=True,
        dataloader_num_workers=2,
        dataloader_pin_memory=True,
        push_to_hub=False,
        report_to="none",
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_train,
        eval_dataset=tokenized_eval,
        data_collator=data_collator,
    )

    print("开始训练...")
    trainer.train()
    model.save_pretrained(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    print(f"对话模型微调完成，保存至 {OUTPUT_DIR}")