import * as constitutionModel from '../models/constitution.js';
import { calculateConstitution } from '../services/constitution.js';

/**
 * 提交体质问卷
 */
export const submit = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const userId = req.user.id;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '请提供有效的问卷答案'
      });
    }

    if (answers.length !== 17) {
      return res.status(400).json({
        code: 400,
        data: null,
        message: '请完成所有17道问卷题目'
      });
    }

    // 验证答案格式
    for (const answer of answers) {
      if (typeof answer !== 'number' || answer < 1 || answer > 5) {
        return res.status(400).json({
          code: 400,
          data: null,
          message: '问卷答案应为1-5的数字'
        });
      }
    }

    // 计算体质
    const result = calculateConstitution(answers);

    // 保存结果
    const savedResult = await constitutionModel.saveResult(
      userId,
      result.primaryType,
      result.scores,
      result.result
    );

    // 返回前端期望的格式
    res.json({
      code: 0,
      data: {
        id: savedResult.id,
        constitution: result.primaryType,
        scores: result.scores,
        answeredAt: savedResult.created_at
      },
      message: '体质辨识完成'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取最新体质结果
 */
export const getResult = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await constitutionModel.getLatestResult(userId);

    if (!result) {
      return res.json({
        code: 0,
        data: null,
        message: '暂无体质辨识结果'
      });
    }

    res.json({
      code: 0,
      data: {
        id: result.id,
        constitution: result.constitution_type,
        scores: result.scores,
        answeredAt: result.created_at
      },
      message: 'success'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取体质历史记录
 */
export const getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const history = await constitutionModel.getHistory(userId, parseInt(limit));

    res.json({
      code: 0,
      data: history.map(item => ({
        id: item.id,
        type: item.constitution_type,
        scores: item.scores,
        result: item.result_data,
        createdAt: item.created_at
      })),
      message: 'success'
    });
  } catch (error) {
    next(error);
  }
};
