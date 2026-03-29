import { supabaseAdmin } from '../services/supabase.js';

/**
 * 创建新会话
 */
export const createSession = async (userId, title = '新对话') => {
  const { data, error } = await supabaseAdmin
    .from('chat_sessions')
    .insert({
      user_id: userId,
      title
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * 获取用户会话列表
 */
export const getSessions = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * 删除会话
 */
export const deleteSession = async (sessionId, userId) => {
  // 先删除会话中的所有消息
  const { error: msgError } = await supabaseAdmin
    .from('chat_messages')
    .delete()
    .eq('session_id', sessionId)
    .eq('user_id', userId);

  if (msgError) {
    throw new Error(msgError.message);
  }

  // 再删除会话
  const { error } = await supabaseAdmin
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};

/**
 * 保存消息
 */
export const saveMessage = async (sessionId, userId, role, content) => {
  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      user_id: userId,
      role,
      content
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * 获取会话历史消息
 */
export const getMessages = async (sessionId, userId) => {
  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * 更新会话时间
 */
export const updateSessionTime = async (sessionId, userId) => {
  const { error } = await supabaseAdmin
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};

export default {
  createSession,
  getSessions,
  deleteSession,
  saveMessage,
  getMessages,
  updateSessionTime
};
