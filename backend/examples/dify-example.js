/**
 * Dify API 调用示例
 *
 * 此文件展示如何在项目中使用 Dify 服务
 */

import express from 'express';
import difyService from '../services/dify.js';

const router = express.Router();

// 示例1：发送文本消息
router.post('/chat/text', async (req, res) => {
  const { query, userId } = req.body;

  await difyService.sendMessage({
    query,
    userId,
    res
  });
});

// 示例2：发送消息并携带额外参数 (inputs)
router.post('/chat/with-context', async (req, res) => {
  const { query, userId, constitutionType } = req.body;

  // 传递上下文信息给 Dify
  const inputs = {
    constitution: constitutionType,
    user_preference: '养生调理'
  };

  await difyService.sendMessage({
    query,
    userId,
    res,
    inputs
  });
});

// 示例3：发送图片消息
router.post('/chat/with-image', async (req, res) => {
  const { query, userId, imageUrl } = req.body;

  // 创建图片文件对象
  const files = [
    difyService.createFileObject(
      'image',           // 文件类型
      'remote_url',     // 传输方式：远程URL
      imageUrl           // 图片URL
    )
  ];

  await difyService.sendMessage({
    query,
    userId,
    res,
    files
  });
});

// 示例4：发送图片（通过上传）
router.post('/chat/with-uploaded-image', async (req, res) => {
  const { query, userId, fileId } = req.body;

  // 创建图片文件对象（使用已上传的文件ID）
  const files = [
    difyService.createFileObject(
      'image',           // 文件类型
      'local_file',      // 传输方式：本地文件ID
      fileId             // 文件ID（从Dify文件上传接口获取）
    )
  ];

  await difyService.sendMessage({
    query,
    userId,
    res,
    files
  });
});

// 示例5：非流式响应
router.post('/chat/blocking', async (req, res) => {
  const { query, userId } = req.body;

  const result = await difyService.sendMessageBlocking({
    query,
    userId
  });

  res.json(result);
});

// 示例6：获取会话历史
router.get('/conversations/:conversationId/history', async (req, res) => {
  const { conversationId } = req.params;
  const { userId } = req.query;

  const history = await difyService.getConversationHistory(conversationId, userId);
  res.json(history);
});

// 示例7：获取会话列表
router.get('/conversations', async (req, res) => {
  const { userId } = req.query;

  const conversations = await difyService.getConversations(userId);
  res.json(conversations);
});

// 示例8：删除会话
router.delete('/conversations/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  const { userId } = req.body;

  const result = await difyService.deleteConversation(conversationId, userId);
  res.json(result);
});

export default router;
