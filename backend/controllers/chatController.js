import * as chatModel from '../models/chat.js';
import * as difyService from '../services/dify.js';
import { queryRAG } from '../services/ragService.js';
/**
 * 创建新会话
 */
export const createSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title = '新对话' } = req.body;

    const session = await chatModel.createSession(userId, title);

    res.json({
      code: 0,
      data: {
        id: session.id,
        title: session.title,
        createdAt: session.created_at,
        updatedAt: session.updated_at
      },
      message: '会话创建成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取会话列表
 */
export const getSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const sessions = await chatModel.getSessions(userId);

    res.json({
      code: 0,
      data: sessions.map(session => ({
        id: session.id,
        title: session.title,
        createdAt: session.created_at,
        updatedAt: session.updated_at
      })),
      message: 'success'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除会话
 */
export const deleteSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: sessionId } = req.params;

    await chatModel.deleteSession(sessionId, userId);

    res.json({
      code: 0,
      data: null,
      message: '会话删除成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取历史消息
 */
export const getMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: sessionId } = req.params;

    const messages = await chatModel.getMessages(sessionId, userId);

    res.json({
      code: 0,
      data: messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.created_at
      })),
      message: 'success'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 发送消息（流式响应）
 */
export const streamMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      message,
      sessionId,
      inputs = {},
      files = []
    } = req.body;

    if (!message) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '请提供消息内容'
      });
    }

    // 如果没有 sessionId，创建新会话
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const session = await chatModel.createSession(userId, message.slice(0, 50));
      currentSessionId = session.id;
    }

    // 保存用户消息
    await chatModel.saveMessage(currentSessionId, userId, 'user', message);

    // 更新会话时间
    await chatModel.updateSessionTime(currentSessionId, userId);

    // ---------- 新增：优先尝试 RAG ----------
    const ragResult = await queryRAG(message);
    if (ragResult.success) {
      // 使用 RAG 的回答，模拟流式输出（一次性返回）
      // 设置 SSE 响应头
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // 模拟流式输出：可以分块输出，这里简单一次性输出整个答案
      const answer = ragResult.answer;
      const sources = ragResult.sources;

      // 可选：发送元数据（如来源）
      res.write(`data: ${JSON.stringify({ type: 'metadata', sources })}\n\n`);

      // 将答案按句子分割，模拟流式效果（更真实）
      const sentences = answer.split(/(?<=[。！？])/);
      for (const sentence of sentences) {
        if (sentence.trim()) {
          res.write(`data: ${JSON.stringify({ type: 'answer', content: sentence })}\n\n`);
          // 小延迟模拟打字效果
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }

      // 发送结束标记
      res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
      res.end();

      // 保存 AI 消息到数据库（RAG 的回答）
      await chatModel.saveMessage(currentSessionId, userId, 'assistant', answer);
      return; // 直接返回，不再调用 Dify
    }

    // ---------- RAG 失败，回退到 Dify ----------
    try {
      await difyService.sendMessage({
        query: message,
        userId,
        res,
        inputs,
        conversationId: currentSessionId,
        files
      });
      // 注意：流式响应后 res.end() 在 difyService 中处理
    } catch (error) {
      console.error('Dify 服务失败:', error.message);
      // ---------- Dify 失败，回退到本地响应 ----------
      // 设置 SSE 响应头
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // 本地默认回答
      const defaultAnswers = {
        '你好': '😊 你好呀！我是小甘草，有什么不舒服可以告诉我～',
        '谢谢': '不用客气！如果还有其他问题，随时告诉我哦～',
        '再见': '再见！希望能帮到你，有需要随时找我～',
        '体质': '要了解您的体质类型，建议您先完成体质辨识测试。您可以点击首页的开始体质辨识按钮进行测试。',
        '养生': '中医养生注重整体调理，包括饮食、运动、作息等方面。具体的养生建议需要根据您的体质类型来制定。',
        '失眠': '失眠可能与多种因素有关，如情绪压力、作息不规律等。建议您保持规律作息，睡前避免使用电子设备，可适当饮用温牛奶或酸枣仁茶。',
        '头痛': '头痛的原因有很多，如外感风寒、肝火上炎等。建议您注意保暖，避免长时间低头，保持充足睡眠。如果症状严重，建议及时就医。',
        '感冒': '感冒多由外感风寒或风热引起。建议您多喝温水，注意休息，可适当饮用生姜红糖水或菊花茶。如果症状严重，建议及时就医。'
      };

      // 查找匹配的默认回答
      let answer = '😊 感谢您的咨询。由于服务暂时不可用，我无法提供详细的中医建议。建议您稍后再试，或咨询专业中医师。';
      for (const [key, value] of Object.entries(defaultAnswers)) {
        if (message.includes(key)) {
          answer = value;
          break;
        }
      }

      // 模拟流式输出
      const sentences = answer.split(/(?<=[。！？])/);
      for (const sentence of sentences) {
        if (sentence.trim()) {
          res.write(`data: ${JSON.stringify({ type: 'answer', content: sentence })}

`);
          // 小延迟模拟打字效果
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }

      // 发送结束标记
      res.write(`data: ${JSON.stringify({ type: 'end' })}

`);
      res.end();

      // 保存 AI 消息到数据库（本地默认回答）
      await chatModel.saveMessage(currentSessionId, userId, 'assistant', answer);
    }
  } catch (error) {
    console.error('流式消息错误:', error);
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
      res.end();
    }
  }
};
