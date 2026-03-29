import * as chatModel from '../models/chat.js';
import * as difyService from '../services/dify.js';

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

    // 如果没有sessionId，创建新会话
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const session = await chatModel.createSession(userId, message.slice(0, 50));
      currentSessionId = session.id;
    }

    // 保存用户消息
    await chatModel.saveMessage(currentSessionId, userId, 'user', message);

    // 更新会话时间
    await chatModel.updateSessionTime(currentSessionId, userId);

    // 调用Dify API获取流式响应（支持文件和额外参数）
    await difyService.sendMessage({
      query: message,
      userId,
      res,
      inputs,
      conversationId: currentSessionId,
      files
    });

    // 注意：流式响应后res.end()在difyService中处理
  } catch (error) {
    console.error('流式消息错误:', error);
    // 如果响应还未结束，发送错误
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
      res.end();
    }
  }
};
