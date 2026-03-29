import { supabaseAdmin } from '../services/supabase.js';

/**
 * 保存体质辨识结果
 */
export const saveResult = async (userId, constitutionType, scores, resultData) => {
  console.log('=== 保存体质结果 ===');
  console.log('userId:', userId);
  console.log('constitutionType:', constitutionType);
  console.log('scores:', JSON.stringify(scores));
  console.log('resultData:', JSON.stringify(resultData));

  const { data, error } = await supabaseAdmin
    .from('constitution_results')
    .insert({
      user_id: userId,
      constitution_type: constitutionType,
      scores,
      result_data: resultData
    })
    .select()
    .single();

  if (error) {
    console.error('保存体质结果失败:', error);
    throw new Error(error.message);
  }

  console.log('保存成功:', data);
  return data;
};

/**
 * 获取用户最新体质结果
 */
export const getLatestResult = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('constitution_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }

  return data || null;
};

/**
 * 获取用户体质历史记录
 */
export const getHistory = async (userId, limit = 10) => {
  const { data, error } = await supabaseAdmin
    .from('constitution_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export default {
  saveResult,
  getLatestResult,
  getHistory
};
