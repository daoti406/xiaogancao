import * as wellnessModel from '../models/wellness.js';
import * as constitutionModel from '../models/constitution.js';
import * as chatModel from '../models/chat.js';
import * as wellnessService from '../services/wellness.js';

/**
 * 生成养生方案（增强版）
 */
export const generate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let {
      constitutionType,
      constitutionResult,
      gender,
      specialPeriod,
      healthIssues
    } = req.body;

    // 如果没有传体质类型，尝试从数据库获取最新的体质结果
    if (!constitutionType) {
      const latestResult = await constitutionModel.getLatestResult(userId);
      if (latestResult) {
        constitutionType = latestResult.constitution_type;
        constitutionResult = latestResult.result_data;
      }
    }

    if (!constitutionType) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '请先进行体质辨识'
      });
    }

    // 如果没有传性别和特殊时期，尝试从档案获取
    if (!gender || !specialPeriod) {
      const profile = await wellnessService.getHealthProfile(userId);
      gender = gender || profile?.gender || 'male';
      specialPeriod = specialPeriod || profile?.special_period || 'none';
    }

    // 使用增强版方案生成（替换策略）
    const savedPlan = await wellnessService.generateAndSavePlan({
      userId,
      constitutionType,
      gender,
      specialPeriod: specialPeriod || 'none',
      healthIssues: healthIssues || []
    });

    const planData = savedPlan.plan_data || {};

    // 安全提取字符串建议（支持新旧格式）
    const getDietAdvice = () => {
      // 新格式：planData.饮食.宜食
      if (planData.饮食 && planData.饮食.宜食) {
        const items = [...planData.饮食.宜食];
        if (planData.饮食.忌食) items.push(...planData.饮食.忌食);
        if (planData.饮食.食疗方) items.push(...planData.饮食.食疗方);
        return items.join('\n');
      }
      // 旧格式
      if (Array.isArray(planData.饮食)) return planData.饮食.join('\n');
      if (typeof planData.饮食 === 'string') return planData.饮食;
      return '';
    };

    const getLifestyleAdvice = () => {
      // 新格式：planData.作息
      if (planData.作息) {
        const items = [];
        if (planData.作息.原则) items.push(planData.作息.原则);
        if (planData.作息.睡眠) items.push(planData.作息.睡眠);
        if (planData.作息.注意) items.push(...planData.作息.注意);
        if (items.length > 0) return items.join('\n');
      }
      // 旧格式
      if (Array.isArray(planData.作息)) return planData.作息.join('\n');
      if (typeof planData.作息 === 'string') return planData.作息;
      return '';
    };

    const getExerciseAdvice = () => {
      // 新格式：planData.运动
      if (planData.运动) {
        const items = [];
        if (planData.运动.原则) items.push(planData.运动.原则);
        if (planData.运动.推荐) items.push(...planData.运动.推荐);
        if (planData.运动.时间) items.push(planData.运动.时间);
        if (items.length > 0) return items.join('\n');
      }
      // 旧格式
      if (Array.isArray(planData.运动)) return planData.运动.join('\n');
      if (typeof planData.运动 === 'string') return planData.运动;
      return '';
    };

    const getAcupointAdvice = () => {
      if (planData.穴位 && Array.isArray(planData.穴位)) {
        return planData.穴位.map(p => `${p.名称}（${p.位置}）: ${p.功效} - ${p.按摩 || '按摩3-5分钟'}`).join('\n');
      }
      return '';
    };

    res.json({
      code: 0,
      data: {
        id: savedPlan.id,
        constitution: savedPlan.constitution_type,
        gender: savedPlan.gender,
        specialPeriod: savedPlan.special_period,
        // 返回完整的方案数据
        planData,
        // 兼容旧格式
        diet_advice: getDietAdvice(),
        lifestyle_advice: getLifestyleAdvice(),
        exercise_advice: getExerciseAdvice(),
        acupoint_advice: getAcupointAdvice(),
        createdAt: savedPlan.created_at,
        updatedAt: savedPlan.updated_at
      },
      message: '养生方案生成成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取养生方案
 */
export const getPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const plan = await wellnessService.getWellnessPlan(userId);

    if (!plan) {
      return res.json({
        code: 0,
        data: null,
        message: '暂无养生方案，请先进行体质辨识'
      });
    }

    const planData = plan.plan_data || {};

    // 安全提取字符串建议（支持新旧格式）
    const getDietAdvice = () => {
      if (planData.饮食 && planData.饮食.宜食) {
        const items = [...planData.饮食.宜食];
        if (planData.饮食.忌食) items.push(...planData.饮食.忌食);
        if (planData.饮食.食疗方) items.push(...planData.饮食.食疗方);
        return items.join('\n');
      }
      if (Array.isArray(planData.饮食)) return planData.饮食.join('\n');
      if (typeof planData.饮食 === 'string') return planData.饮食;
      return '';
    };

    const getLifestyleAdvice = () => {
      if (planData.作息) {
        const items = [];
        if (planData.作息.原则) items.push(planData.作息.原则);
        if (planData.作息.睡眠) items.push(planData.作息.睡眠);
        if (planData.作息.注意) items.push(...planData.作息.注意);
        if (items.length > 0) return items.join('\n');
      }
      if (Array.isArray(planData.作息)) return planData.作息.join('\n');
      if (typeof planData.作息 === 'string') return planData.作息;
      return '';
    };

    const getExerciseAdvice = () => {
      if (planData.运动) {
        const items = [];
        if (planData.运动.原则) items.push(planData.运动.原则);
        if (planData.运动.推荐) items.push(...planData.运动.推荐);
        if (planData.运动.时间) items.push(planData.运动.时间);
        if (items.length > 0) return items.join('\n');
      }
      if (Array.isArray(planData.运动)) return planData.运动.join('\n');
      if (typeof planData.运动 === 'string') return planData.运动;
      return '';
    };

    const getAcupointAdvice = () => {
      if (planData.穴位 && Array.isArray(planData.穴位)) {
        return planData.穴位.map(p => `${p.名称}（${p.位置}）: ${p.功效} - ${p.按摩 || '按摩3-5分钟'}`).join('\n');
      }
      return '';
    };

    res.json({
      code: 0,
      data: {
        id: plan.id,
        constitution: plan.constitution_type,
        gender: plan.gender,
        specialPeriod: plan.special_period,
        planData,
        // 兼容旧格式
        diet_advice: getDietAdvice(),
        lifestyle_advice: getLifestyleAdvice(),
        exercise_advice: getExerciseAdvice(),
        acupoint_advice: getAcupointAdvice(),
        createdAt: plan.created_at,
        updatedAt: plan.updated_at
      },
      message: 'success'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 动态调整养生方案（基于健康问题）
 */
export const adjustPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { healthIssues = [] } = req.body;

    // 使用增强版方案生成（替换策略）
    const savedPlan = await wellnessService.adjustPlan(userId, healthIssues);

    const planData = savedPlan.plan_data || {};

    // 安全提取字符串建议（支持新旧格式）
    const getDietAdvice = () => {
      if (planData.饮食 && planData.饮食.宜食) {
        const items = [...planData.饮食.宜食];
        if (planData.饮食.忌食) items.push(...planData.饮食.忌食);
        if (planData.饮食.食疗方) items.push(...planData.饮食.食疗方);
        return items.join('\n');
      }
      if (Array.isArray(planData.饮食)) return planData.饮食.join('\n');
      if (typeof planData.饮食 === 'string') return planData.饮食;
      return '';
    };

    const getLifestyleAdvice = () => {
      if (planData.作息) {
        const items = [];
        if (planData.作息.原则) items.push(planData.作息.原则);
        if (planData.作息.睡眠) items.push(planData.作息.睡眠);
        if (planData.作息.注意) items.push(...planData.作息.注意);
        if (items.length > 0) return items.join('\n');
      }
      if (Array.isArray(planData.作息)) return planData.作息.join('\n');
      if (typeof planData.作息 === 'string') return planData.作息;
      return '';
    };

    const getExerciseAdvice = () => {
      if (planData.运动) {
        const items = [];
        if (planData.运动.原则) items.push(planData.运动.原则);
        if (planData.运动.推荐) items.push(...planData.运动.推荐);
        if (planData.运动.时间) items.push(planData.运动.时间);
        if (items.length > 0) return items.join('\n');
      }
      if (Array.isArray(planData.运动)) return planData.运动.join('\n');
      if (typeof planData.运动 === 'string') return planData.运动;
      return '';
    };

    const getAcupointAdvice = () => {
      if (planData.穴位 && Array.isArray(planData.穴位)) {
        return planData.穴位.map(p => `${p.名称}（${p.位置}）: ${p.功效} - ${p.按摩 || '按摩3-5分钟'}`).join('\n');
      }
      return '';
    };

    res.json({
      code: 0,
      data: {
        id: savedPlan.id,
        constitution: savedPlan.constitution_type,
        gender: savedPlan.gender,
        specialPeriod: savedPlan.special_period,
        planData,
        adjustmentIssues: healthIssues,
        diet_advice: getDietAdvice(),
        lifestyle_advice: getLifestyleAdvice(),
        exercise_advice: getExerciseAdvice(),
        acupoint_advice: getAcupointAdvice(),
        createdAt: savedPlan.created_at,
        updatedAt: savedPlan.updated_at
      },
      message: '养生方案已根据您的健康问题进行调整'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新养生方案（旧版，保留兼容）
 */
export const updatePlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { plan } = req.body;

    const existingPlan = await wellnessService.getWellnessPlan(userId);

    if (!existingPlan) {
      return res.status(404).json({
        code: 404,
        data: null,
        message: '暂无养生方案，请先生成'
      });
    }

    const updatedPlan = await wellnessService.generateAndSavePlan({
      userId,
      constitutionType: existingPlan.constitution_type,
      gender: existingPlan.gender,
      specialPeriod: existingPlan.special_period,
      healthIssues: []
    });

    res.json({
      code: 0,
      data: {
        id: updatedPlan.id,
        constitutionType: updatedPlan.constitution_type,
        plan: updatedPlan.plan_data,
        createdAt: updatedPlan.created_at,
        updatedAt: updatedPlan.updated_at
      },
      message: '养生方案更新成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取用户健康档案
 */
export const getHealthProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const profile = await wellnessService.getHealthProfile(userId);

    res.json({
      code: 0,
      data: profile,
      message: 'success'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新用户健康档案
 */
export const updateHealthProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { gender, specialPeriod, constitutionType, birthDate } = req.body;

    const profile = await wellnessService.updateHealthProfile(userId, {
      gender,
      special_period: specialPeriod,
      constitution_type: constitutionType,
      birth_date: birthDate
    });

    res.json({
      code: 0,
      data: profile,
      message: '健康档案更新成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取提醒列表
 */
export const getReminders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const reminders = await wellnessModel.getReminders(userId);

    res.json({
      code: 0,
      data: reminders.map(reminder => ({
        id: reminder.id,
        title: reminder.title,
        description: reminder.description,
        remindTime: reminder.remind_time,
        isCompleted: reminder.is_completed,
        createdAt: reminder.created_at
      })),
      message: 'success'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建提醒
 */
export const createReminder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, remindTime } = req.body;

    if (!title || !remindTime) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '请提供提醒标题和时间'
      });
    }

    const reminder = await wellnessModel.createReminder(userId, title, description, remindTime);

    res.json({
      code: 0,
      data: {
        id: reminder.id,
        title: reminder.title,
        description: reminder.description,
        remindTime: reminder.remind_time,
        isCompleted: reminder.is_completed,
        createdAt: reminder.created_at
      },
      message: '提醒创建成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新提醒
 */
export const updateReminder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: reminderId } = req.params;
    const updates = req.body;

    const reminder = await wellnessModel.updateReminder(reminderId, userId, updates);

    res.json({
      code: 0,
      data: {
        id: reminder.id,
        title: reminder.title,
        description: reminder.description,
        remindTime: reminder.remind_time,
        isCompleted: reminder.is_completed,
        createdAt: reminder.created_at
      },
      message: '提醒更新成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除提醒
 */
export const deleteReminder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: reminderId } = req.params;

    await wellnessModel.deleteReminder(reminderId, userId);

    res.json({
      code: 0,
      data: null,
      message: '提醒删除成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取用户仪表盘数据
 */
export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 获取用户健康档案
    const profile = await wellnessService.getHealthProfile(userId);

    // 获取体质辨识结果
    const constitutionResult = await constitutionModel.getLatestResult(userId);

    // 获取养生方案
    const plan = await wellnessModel.getPlan(userId);

    // 获取最近会话
    const allSessions = await chatModel.getSessions(userId);
    const recentSessions = allSessions.slice(0, 5);

    // 构建统计数据
    const stats = {
      hasResult: !!constitutionResult,
      hasPlan: !!plan,
      hasProfile: !!profile,
      constitutionType: constitutionResult?.constitution_type || null,
      sessionCount: recentSessions?.length || 0
    };

    res.json({
      code: 0,
      data: {
        user: profile,
        recentSessions: recentSessions || [],
        stats
      },
      message: '获取成功'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  generate,
  getPlan,
  adjustPlan,
  updatePlan,
  getHealthProfile,
  updateHealthProfile,
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  getDashboard
};
