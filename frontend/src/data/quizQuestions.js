/**
 * 体质辨识问卷题目
 * 基于《中医体质分类与判定》标准问卷
 */

// 题目分组配置
export const QUIZ_GROUPS = [
  {
    id: 'lifestyle',
    name: '生活习惯',
    description: '了解你的日常起居习惯',
    icon: '🏠',
    questionIds: [1, 2]  // 阳虚质相关
  },
  {
    id: 'body',
    name: '身体感觉',
    description: '感受身体发出的信号',
    icon: '💫',
    questionIds: [3, 4, 5, 6]  // 阴虚质、气虚质
  },
  {
    id: 'diet',
    name: '饮食偏好',
    description: '了解你的饮食习惯',
    icon: '🍚',
    questionIds: [7, 8, 9, 10]  // 痰湿质、湿热质
  },
  {
    id: 'emotion',
    name: '面色与情绪',
    description: '观察面色和情绪状态',
    icon: '😊',
    questionIds: [11, 12, 13, 14]  // 血瘀质、气郁质
  },
  {
    id: 'overall',
    name: '整体状态',
    description: '评估你的整体健康状况',
    icon: '✨',
    questionIds: [15, 16, 17]  // 特禀质、平和质
  }
];

// 每组完成后的温馨小结
export const GROUP_SUMMARIES = {
  lifestyle: {
    positive: '你的生活习惯整体不错，手脚温暖是健康的表现哦！',
    neutral: '每个人的体质不同，了解自己的特点才能更好地调理。',
    negative: '手脚发凉可能提示需要温阳调理，平时可以适当运动。'
  },
  body: {
    positive: '你的身体状态很好，没有明显的不适感。',
    neutral: '身体偶尔有些小症状是正常的，注意观察就好。',
    negative: '如果经常感到疲劳或干燥，可以关注一下阴虚或气虚的可能。'
  },
  diet: {
    positive: '你的饮食习惯很健康，继续保持！',
    neutral: '饮食与体质密切相关，了解自己的体质才能吃得更好。',
    negative: '油腻饮食可能加重湿热，建议清淡一些哦。'
  },
  emotion: {
    positive: '你的情绪状态很棒，心态平和是养生的关键！',
    neutral: '情绪波动是正常的，学会调节就好。',
    negative: '长期情绪低落会影响健康，建议适当放松身心。'
  },
  overall: {
    positive: '你的整体状态很好，是标准的平和体质！',
    neutral: '继续关注自己的身体，保持健康的生活方式。',
    negative: '如果容易过敏，要注意远离过敏源，加强锻炼。'
  }
};

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    text: '您手脚发凉吗？',
    category: '阳虚质',
    description: '手脚发凉是指手足温度低于正常，即使在不寒冷的环境中也感到冷',
    example: '冬天比别人穿得多？夏天空调房里手脚冰凉？'
  },
  {
    id: 2,
    text: '您比一般人怕冷吗？',
    category: '阳虚质',
    description: '指对寒冷的耐受程度比大多数人低，容易感到冷',
    example: '秋天就穿上厚外套？不耐受寒冷的食物？'
  },
  {
    id: 3,
    text: '您感到口干咽燥吗？',
    category: '阴虚质',
    description: '指口腔和咽喉经常感到干燥缺水',
    example: '总是想喝水？嘴唇容易干裂？'
  },
  {
    id: 4,
    text: '您手心脚心发热吗？',
    category: '阴虚质',
    description: '手足心发热是阴虚的典型表现',
    example: '晚上睡觉时手脚心发烫？'
  },
  {
    id: 5,
    text: '您容易疲乏吗？',
    category: '气虚质',
    description: '指身体容易疲劳，精力不足',
    example: '总是提不起精神？稍微活动就累了？'
  },
  {
    id: 6,
    text: '您容易气短（呼吸短促）吗？',
    category: '气虚质',
    description: '指呼吸浅促，活动后加重',
    example: '爬楼梯容易喘？说话声音低弱？'
  },
  {
    id: 7,
    text: '您感到身体沉重吗？',
    category: '痰湿质',
    description: '指身体困重不轻松的感觉',
    example: '早上起床特别困？身体像裹了湿毛巾？'
  },
  {
    id: 8,
    text: '您腹部肥满松软吗？',
    category: '痰湿质',
    description: '指腹部脂肪堆积，肌肉松弛',
    example: '腹部有游泳圈？'
  },
  {
    id: 9,
    text: '您面部或鼻部有油腻感吗？',
    category: '湿热质',
    description: '指面部T区或鼻部油脂分泌旺盛',
    example: '脸上总是油光光的？'
  },
  {
    id: 10,
    text: '您口苦或嘴里有异味吗？',
    category: '湿热质',
    description: '指口中常感苦味或异味',
    example: '早上起来口苦？'
  },
  {
    id: 11,
    text: '您皮肤容易出现瘀斑吗？',
    category: '血瘀质',
    description: '指皮肤容易出现青紫色瘀斑',
    example: '轻轻碰一下就淤青？'
  },
  {
    id: 12,
    text: '您面色晦暗或出现暗斑吗？',
    category: '血瘀质',
    description: '指面色不红润，有暗斑',
    example: '脸色总是暗暗的？'
  },
  {
    id: 13,
    text: '您感到闷闷不乐、情绪低落吗？',
    category: '气郁质',
    description: '指情绪低落，心情郁闷',
    example: '总是叹气？容易郁闷？'
  },
  {
    id: 14,
    text: '您容易紧张、焦虑吗？',
    category: '气郁质',
    description: '指容易紧张不安，过度担忧',
    example: '容易胡思乱想？'
  },
  {
    id: 15,
    text: '您容易过敏（如药物、食物、花粉）吗？',
    category: '特禀质',
    description: '指对某些物质容易产生过敏反应',
    example: '换季时打喷嚏？吃了某些食物不舒服？'
  },
  {
    id: 16,
    text: '您精力充沛吗？',
    category: '平和质',
    description: '指精神饱满，活力充足',
    example: '每天都有用不完的精力？'
  },
  {
    id: 17,
    text: '您能适应外界自然和社会环境的变化吗？',
    category: '平和质',
    description: '指对环境变化有良好的适应能力',
    example: '换季时不适应？出差容易水土不服？'
  }
];

/**
 * 答案选项
 */
export const ANSWER_OPTIONS = [
  { value: 1, label: '总是', description: '经常出现，几乎每天' },
  { value: 2, label: '经常', description: '经常出现，每周数次' },
  { value: 3, label: '有时', description: '偶尔出现，每月数次' },
  { value: 4, label: '很少', description: '很少出现，几乎不' },
  { value: 5, label: '从不', description: '从未出现过' }
];

/**
 * 体质类型信息
 */
export const CONSTITUTION_INFO = {
  '阳虚质': {
    color: '#E89B7C',
    icon: '🔥',
    characteristics: ['畏寒怕冷', '手足不温', '喜热饮食', '面色柔白'],
    diet: ['羊肉', '韭菜', '核桃', '生姜'],
    avoid: ['冷饮', '西瓜', '梨', '绿豆']
  },
  '阴虚质': {
    color: '#8BC4E8',
    icon: '💧',
    characteristics: ['口燥咽干', '手足心热', '易失眠', '皮肤干燥'],
    diet: ['银耳', '百合', '鸭肉', '梨'],
    avoid: ['羊肉', '辣椒', '生姜']
  },
  '气虚质': {
    color: '#E8C87C',
    icon: '💨',
    characteristics: ['疲乏气短', '容易出汗', '声音低弱', '易感冒'],
    diet: ['山药', '黄芪', '大枣', '鸡肉'],
    avoid: ['萝卜', '茶叶', '槟榔']
  },
  '痰湿质': {
    color: '#A8C97C',
    icon: '🍵',
    characteristics: ['体型肥胖', '腹部肥满', '口黏苔腻', '多汗且黏'],
    diet: ['冬瓜', '萝卜', '薏米', '荷叶茶'],
    avoid: ['肥肉', '甜食', '酒']
  },
  '湿热质': {
    color: '#E87C7C',
    icon: '🌡️',
    characteristics: ['面垢油光', '易生痤疮', '口苦口干', '大便黏滞'],
    diet: ['绿豆', '苦瓜', '莲藕', '冬瓜'],
    avoid: ['羊肉', '火锅', '酒']
  },
  '血瘀质': {
    color: '#B87CE8',
    icon: '🩸',
    characteristics: ['肤色晦暗', '易有瘀斑', '口唇紫暗', '易烦躁'],
    diet: ['山楂', '玫瑰花', '黑豆', '红糖'],
    avoid: ['寒凉食物', '收敛食物']
  },
  '气郁质': {
    color: '#7CB8E8',
    icon: '😔',
    characteristics: ['情绪低落', '易焦虑', '胸闷叹息', '咽喉异物感'],
    diet: ['玫瑰花茶', '柑橘', '佛手', '菊花'],
    avoid: ['浓茶', '咖啡', '烈酒']
  },
  '特禀质': {
    color: '#E87CB8',
    icon: '🌸',
    characteristics: ['易过敏', '喷嚏流涕', '皮肤瘙痒', '哮喘倾向'],
    diet: ['蜂蜜', '大枣', '胡萝卜'],
    avoid: ['过敏源食物', '发物']
  },
  '平和质': {
    color: '#7CE89C',
    icon: '✨',
    characteristics: ['精力充沛', '睡眠良好', '体态适中', '适应力强'],
    diet: ['均衡饮食', '五谷杂粮'],
    avoid: []
  }
};
