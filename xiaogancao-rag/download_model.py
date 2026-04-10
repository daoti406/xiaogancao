from huggingface_hub import snapshot_download

# 直接下载，不使用镜像（如果你网络直连 huggingface.co 可用）
model_id = "Qwen/Qwen2.5-0.5B-Instruct"
local_dir = "./models/Qwen2.5-0.5B-Instruct"

print(f"正在下载 {model_id} 到 {local_dir} ...")
snapshot_download(
    repo_id=model_id,
    local_dir=local_dir,
    local_dir_use_symlinks=False,   # 直接保存文件，不创建软链接
    resume_download=True,           # 支持断点续传
    ignore_patterns=["*.h5", "*.ot", "*.msgpack"]
)
print("下载完成！")