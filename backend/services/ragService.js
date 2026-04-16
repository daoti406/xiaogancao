const axios = require('axios');

const RAG_API_URL = 'http://localhost:8000/api/chat';

async function queryRAG(question) {
    try {
        const response = await axios.post(RAG_API_URL, { 
            user_id: 'test_user',
            message: question 
        });
        if (response.data.reply) {
            return {
                answer: response.data.reply,
                sources: [],
                success: true
            };
        } else {
            console.error('RAG 返回错误: 没有 reply 字段');
            return { success: false };
        }
    } catch (error) {
        console.error('调用 RAG 服务失败:', error.message);
        return { success: false };
    }
}

module.exports = { queryRAG };