/**
 * 九种体质类型
 */
export const CONSTITUTION_TYPES = [
  '平和质',
  '气虚质',
  '阳虚质',
  '阴虚质',
  '痰湿质',
  '湿热质',
  '血瘀质',
  '气郁质',
  '特禀质'
];

/**
 * 体质计算
 * 根据《中医体质分类与判定》标准计算体质类型
 * @param {Array} answers - 17道题的答案数组，每题1-5分
 * @returns {Object} - 体质类型和分数
 */
export const calculateConstitution = (answers) => {
  if (!answers || answers.length !== 17) {
    throw new Error('请提供完整的17道问卷答案');
  }

  // 体质类型对应的题目索引（简化版，实际需要更详细的映射）
  const typeQuestions = {
    '平和质': [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], // 多数正向计分
    '气虚质': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    '阳虚质': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    '阴虚质': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    '痰湿质': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    '湿热质': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    '血瘀质': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    '气郁质': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    '特禀质': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
  };

  // 简化计算：每个体质类型取所有问题的平均分
  const scores = {};
  let maxScore = 0;
  let primaryType = '平和质';

  for (const type of CONSTITUTION_TYPES) {
    // 计算该体质的原始分数（简单求和）
    const typeScore = answers.reduce((sum, score, index) => {
      return sum + (typeQuestions[type].includes(index + 1) ? score : 0);
    }, 0);

    scores[type] = typeScore;

    // 找出最高分的体质
    if (typeScore > maxScore) {
      maxScore = typeScore;
      primaryType = type;
    }
  }

  // 平和质的判定标准：所有体质分数接近且平和质分数较高
  const otherTypes = CONSTITUTION_TYPES.filter(t => t !== '平和质');
  const avgOtherScore = otherTypes.reduce((sum, t) => sum + scores[t], 0) / otherTypes.length;

  if (scores['平和质'] >= 24 && avgOtherScore < 24) {
    primaryType = '平和质';
  } else if (scores['平和质'] >= 17 && avgOtherScore >= 24) {
    // 偏向某种体质
    let maxDiff = 0;
    for (const type of otherTypes) {
      const diff = scores[type] - scores['平和质'];
      if (diff > maxDiff) {
        maxDiff = diff;
        primaryType = type;
      }
    }
  }

  // 标准化分数到0-100
  const normalizedScores = {};
  for (const type of CONSTITUTION_TYPES) {
    normalizedScores[type] = Math.round((scores[type] / (17 * 5)) * 100);
  }

  return {
    primaryType,
    scores: normalizedScores,
    result: {
      type: primaryType,
      description: getConstitutionDescription(primaryType),
      suggestions: getConstitutionSuggestions(primaryType)
    }
  };
};

/**
 * 获取体质描述
 */
const getConstitutionDescription = (type) => {
  const descriptions = {
    '平和质': '阴阳气血调和，体态适中，面色润泽，精力充沛，是健康的体质类型。',
    '气虚质': '元气不足，容易疲乏，气短懒言，抵抗力较弱。',
    '阳虚质': '阳气不足，畏寒怕冷，手足不温，精神不振。',
    '阴虚质': '阴液亏少，口燥咽干，手足心热，形体偏瘦。',
    '痰湿质': '痰湿凝聚，体形肥胖，腹部肥满，口黏苔腻。',
    '湿热质': '湿热内蕴，面垢油光，口苦苔黄，易生痤疮。',
    '血瘀质': '血行不畅，肤色晦暗，色素沉着，容易疼痛。',
    '气郁质': '气机郁滞，情志抑郁，忧虑脆弱，多愁善感。',
    '特禀质': '先天失常，过敏体质，容易过敏或生理缺陷。'
  };
  return descriptions[type] || '';
};

/**
 * 获取体质调理建议
 */
const getConstitutionSuggestions = (type) => {
  const suggestions = {
    '平和质': [
      '饮食有节，营养均衡',
      '起居有常，适度运动',
      '保持心情愉悦'
    ],
    '气虚质': [
      '适量食用黄芪、党参等补气食材',
      '避免过度劳累',
      '适度进行太极拳、八段锦等柔和运动'
    ],
    '阳虚质': [
      '多食羊肉、桂圆等温补食物',
      '注意保暖',
      '适度晒太阳'
    ],
    '阴虚质': [
      '多食银耳、百合等滋阴润燥食物',
      '避免辛辣刺激性食物',
      '保证充足睡眠'
    ],
    '痰湿质': [
      '饮食清淡，少食肥甘厚味',
      '适度运动排湿',
      '避免久坐'
    ],
    '湿热质': [
      '饮食清淡，多食清热利湿食物',
      '避免饮酒',
      '保持皮肤清洁'
    ],
    '血瘀质': [
      '适量食用山楂、黑木耳等活血食物',
      '适度运动促进血液循环',
      '保持情绪舒畅'
    ],
    '气郁质': [
      '多食玫瑰花茶等疏肝理气食物',
      '保持心情愉悦',
      '适度进行户外活动'
    ],
    '特禀质': [
      '避免接触过敏原',
      '注意饮食调理',
      '增强体质，提高免疫力'
    ]
  };
  return suggestions[type] || [];
};

export default {
  CONSTITUTION_TYPES,
  calculateConstitution
};
