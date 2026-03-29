/**
 * 养生方案服务
 * 基于体质、性别、特殊时期的个性化方案生成
 */
import { supabase } from './supabase.js';
import { generatePlan } from '../data/constitutionKnowledge.js';

/**
 * 获取用户健康档案
 */
export const getHealthProfile = async (userId) => {
  const { data, error } = await supabase
    .from('user_health_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
};

/**
 * 更新用户健康档案
 */
export const updateHealthProfile = async (userId, profile) => {
  const { data, error } = await supabase
    .from('user_health_profiles')
    .upsert({
      user_id: userId,
      ...profile,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 获取当前养生方案
 */
export const getWellnessPlan = async (userId) => {
  const { data, error } = await supabase
    .from('wellness_plans')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
};

/**
 * 生成并保存养生方案（替换策略）
 */
export const generateAndSavePlan = async ({
  userId,
  constitutionType,
  gender,
  specialPeriod,
  healthIssues = []
}) => {
  // 1. 生成方案
  const planData = generatePlan({
    constitutionType,
    gender,
    specialPeriod,
    healthIssues
  });

  // 2. 保存方案到数据库（替换旧方案）
  const { data, error } = await supabase
    .from('wellness_plans')
    .upsert({
      user_id: userId,
      constitution_type: constitutionType,
      gender,
      special_period: specialPeriod,
      plan_data: planData,
      adjustment_questions: healthIssues,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('保存方案失败:', error);
    throw error;
  }

  // 3. 同时更新健康档案
  await updateHealthProfile(userId, {
    constitution_type: constitutionType,
    gender,
    special_period: specialPeriod
  });

  return data;
};

/**
 * 根据体质类型生成方案（简化版）
 */
export const generatePlanByConstitution = async (userId, constitutionType) => {
  // 获取用户档案信息
  const profile = await getHealthProfile(userId);

  const gender = profile?.gender || 'male';
  const specialPeriod = profile?.special_period || 'none';

  return generateAndSavePlan({
    userId,
    constitutionType,
    gender,
    specialPeriod,
    healthIssues: []
  });
};

/**
 * 动态调整方案（基于用户问题）
 */
export const adjustPlan = async (userId, healthIssues = []) => {
  // 获取当前档案
  const profile = await getHealthProfile(userId);

  if (!profile?.constitution_type) {
    throw new Error('请先完成体质辨识');
  }

  return generateAndSavePlan({
    userId,
    constitutionType: profile.constitution_type,
    gender: profile.gender || 'male',
    specialPeriod: profile.special_period || 'none',
    healthIssues
  });
};

export default {
  getHealthProfile,
  updateHealthProfile,
  getWellnessPlan,
  generateAndSavePlan,
  generatePlanByConstitution,
  adjustPlan
};
