/**
 * 体质辨识API
 */
import request from './request';

/**
 * 提交问卷答案
 */
export const submit = (answers) => {
  return request.post('/constitution/submit', { answers });
};

/**
 * 获取最新结果
 */
export const getResult = () => {
  return request.get('/constitution/result');
};

/**
 * 获取历史记录
 */
export const getHistory = (limit = 10) => {
  return request.get('/constitution/history', { params: { limit } });
};
