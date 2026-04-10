const axios = require('axios');

const RAG_API_URL = 'http://localhost:5001/rag/query';

async function queryRAG(question) {
    try {
        const response = await axios.post(RAG_API_URL, { question });
        if (response.data.success) {
            return {
                answer: response.data.answer,
                sources: response.data.sources,
                success: true
            };
        } else {
            console.error('RAG 返回错误:', response.data.error);
            return { success: false };
        }
    } catch (error) {
        console.error('调用 RAG 服务失败:', error.message);
        return { success: false };
    }
}

module.exports = { queryRAG };