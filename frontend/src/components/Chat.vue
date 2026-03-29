<template>
  <div class="chat-container">
    <div class="messages">
      <div v-for="(msg, idx) in messages" :key="idx" :class="msg.role">
        <div class="content">{{ msg.content }}</div>
      </div>
      <div v-if="isStreaming" class="assistant streaming">...</div>
    </div>
    <div class="input-area">
      <input v-model="input" @keyup.enter="sendMessage" placeholder="输入您的问题..." />
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const messages = ref([]);
const input = ref('');
const isStreaming = ref(false);

const sendMessage = async () => {
  if (!input.value.trim()) return;

  const userMsg = { role: 'user', content: input.value };
  messages.value.push(userMsg);
  const currentInput = input.value;
  input.value = '';
  isStreaming.value = true;

  const assistantMsg = { role: 'assistant', content: '' };
  messages.value.push(assistantMsg);

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message: currentInput })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i];
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.event === 'message') {
              assistantMsg.content += data.answer;
              messages.value = [...messages.value];
            }
          } catch (e) {}
        }
      }
      buffer = lines[lines.length - 1];
    }
  } catch (error) {
    console.error(error);
    assistantMsg.content = '网络错误，请稍后重试。';
  } finally {
    isStreaming.value = false;
  }
};
</script>

<style scoped>
.chat-container {
  max-width: 800px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
.user {
  text-align: right;
  margin: 10px 0;
}
.assistant {
  text-align: left;
  margin: 10px 0;
  background: #f0f0f0;
  padding: 10px;
  border-radius: 10px;
}
.streaming {
  background: #e0e0e0;
}
.input-area {
  display: flex;
  padding: 10px;
}
.input-area input {
  flex: 1;
  padding: 10px;
}
.input-area button {
  margin-left: 10px;
  padding: 0 20px;
}
</style>