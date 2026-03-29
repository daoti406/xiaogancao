import { supabaseAdmin } from '../services/supabase.js';

/**
 * 保存养生方案
 */
export const savePlan = async (userId, constitutionType, planData) => {
  // 先检查是否已有养生方案
  const { data: existing } = await supabaseAdmin
    .from('wellness_plans')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    // 更新现有方案
    const { data, error } = await supabaseAdmin
      .from('wellness_plans')
      .update({
        constitution_type: constitutionType,
        plan_data: planData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  } else {
    // 创建新方案
    const { data, error } = await supabaseAdmin
      .from('wellness_plans')
      .insert({
        user_id: userId,
        constitution_type: constitutionType,
        plan_data: planData
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
};

/**
 * 获取用户养生方案
 */
export const getPlan = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('wellness_plans')
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
 * 创建提醒
 */
export const createReminder = async (userId, title, description, remindTime) => {
  const { data, error } = await supabaseAdmin
    .from('reminders')
    .insert({
      user_id: userId,
      title,
      description,
      remind_time: remindTime
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * 获取用户提醒列表
 */
export const getReminders = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('remind_time', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * 更新提醒
 */
export const updateReminder = async (reminderId, userId, updates) => {
  const { data, error } = await supabaseAdmin
    .from('reminders')
    .update(updates)
    .eq('id', reminderId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * 删除提醒
 */
export const deleteReminder = async (reminderId, userId) => {
  const { error } = await supabaseAdmin
    .from('reminders')
    .delete()
    .eq('id', reminderId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};

export default {
  savePlan,
  getPlan,
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder
};
