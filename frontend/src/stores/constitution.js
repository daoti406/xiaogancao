/**
 * 体质辨识状态管理
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as constitutionApi from '@/api/constitution';

export const useConstitutionStore = defineStore('constitution', () => {
  // 状态
  const currentResult = ref(null);
  const history = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // 问卷答案
  const answers = ref(new Array(17).fill(null));

  // 计算属性
  const hasResult = computed(() => !!currentResult.value);
  const mainConstitution = computed(() => currentResult.value?.constitution || '');
  const scores = computed(() => currentResult.value?.scores || {});
  const progress = computed(() => {
    const answered = answers.value.filter(a => a !== null).length;
    return Math.round((answered / 17) * 100);
  });
  const allAnswered = computed(() => answers.value.every(a => a !== null));

  /**
   * 设置答案
   */
  const setAnswer = (index, value) => {
    answers.value[index] = value;
  };

  /**
   * 重置答案
   */
  const resetAnswers = () => {
    answers.value = new Array(17).fill(null);
  };

  /**
   * 提交问卷
   * @param {Array} submitAnswers - 可选的答案数组，如果不传则使用store中的answers
   */
  const submit = async (submitAnswers) => {
    loading.value = true;
    error.value = null;

    const answersToSubmit = submitAnswers || answers.value;
    console.log('提交答案:', answersToSubmit);

    try {
      const res = await constitutionApi.submit(answersToSubmit);
      currentResult.value = res.data;
      return res.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取最新结果
   */
  const fetchResult = async () => {
    loading.value = true;
    error.value = null;

    try {
      const res = await constitutionApi.getResult();
      currentResult.value = res.data;
      return res.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取历史记录
   */
  const fetchHistory = async (limit = 10) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await constitutionApi.getHistory(limit);
      history.value = res.data;
      return res.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取体质描述
   */
  const getConstitutionDescription = (type) => {
    const descriptions = {
      '阳虚质': '阳气不足，以畏寒怕冷、手足不温等虚寒表现为主要特征。',
      '阴虚质': '阴液亏少，以口燥咽干、手足心热等虚热表现为主要特征。',
      '气虚质': '元气不足，以疲乏、气短、自汗等气虚表现为主要特征。',
      '痰湿质': '痰湿凝聚，以体型肥胖、腹部肥满、口黏苔腻等痰湿表现为主要特征。',
      '湿热质': '湿热内蕴，以面垢油光、口苦、苔黄腻等湿热表现为主要特征。',
      '血瘀质': '血行不畅，以肤色晦暗、舌质紫暗等血瘀表现为主要特征。',
      '气郁质': '气机郁滞，以神情抑郁、忧虑脆弱等气郁表现为主要特征。',
      '特禀质': '先天失常，以生理缺陷、过敏反应等为主要特征。',
      '平和质': '阴阳气血调和，以体态适中、面色红润、精力充沛等为主要特征。'
    };
    return descriptions[type] || '';
  };

  return {
    // 状态
    currentResult,
    history,
    loading,
    error,
    answers,
    // 计算属性
    hasResult,
    mainConstitution,
    scores,
    progress,
    allAnswered,
    // 方法
    setAnswer,
    resetAnswers,
    submit,
    fetchResult,
    fetchHistory,
    getConstitutionDescription
  };
});
