import gradio as gr
from rag_query import query_tcm

WELCOME = "😊 你好呀，我是小甘草！有什么不舒服可以告诉我，我会尽力帮你分析～"

def respond(message, history):
    return query_tcm(message)

with gr.Blocks() as demo:
    gr.Markdown(f"### {WELCOME}")
    gr.ChatInterface(fn=respond, title=None, description=None)

demo.launch(share=True)