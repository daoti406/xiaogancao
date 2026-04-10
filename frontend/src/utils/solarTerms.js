/**
 * 二十四节气数据表
 * 包含节气名称、日期和养生建议
 */
export const solarTermsMap = [
  { name: "小寒", month: 1, day: 5, advice: "宜温补肾阳，推荐羊肉汤、核桃" },
  { name: "大寒", month: 1, day: 20, advice: "注意保暖，宜食用温热食物" },
  { name: "立春", month: 2, day: 3, advice: "宜疏肝理气，推荐菠菜、豆芽" },
  { name: "雨水", month: 2, day: 19, advice: "宜健脾祛湿，推荐山药、薏米" },
  { name: "惊蛰", month: 3, day: 5, advice: "宜润肺止咳，推荐梨、蜂蜜" },
  { name: "春分", month: 3, day: 20, advice: "宜平衡阴阳，推荐清淡饮食" },
  { name: "清明", month: 4, day: 5, advice: "宜养肝明目，推荐菊花茶" },
  { name: "谷雨", month: 4, day: 20, advice: "宜祛湿健脾，推荐冬瓜汤" },
  { name: "立夏", month: 5, day: 5, advice: "宜养心清热，推荐苦瓜、绿豆" },
  { name: "小满", month: 5, day: 21, advice: "宜健脾利湿，推荐薏米粥" },
  { name: "芒种", month: 6, day: 5, advice: "宜清热解暑，推荐西瓜、绿茶" },
  { name: "夏至", month: 6, day: 21, advice: "宜养心安神，推荐莲子心茶" },
  { name: "小暑", month: 7, day: 7, advice: "宜清热消暑，推荐绿豆汤" },
  { name: "大暑", month: 7, day: 22, advice: "宜防暑降温，推荐凉茶" },
  { name: "立秋", month: 8, day: 7, advice: "宜润燥养肺，推荐梨、百合" },
  { name: "处暑", month: 8, day: 23, advice: "宜清热润燥，推荐银耳汤" },
  { name: "白露", month: 9, day: 7, advice: "宜补肺益气，推荐红枣" },
  { name: "秋分", month: 9, day: 23, advice: "宜平衡阴阳，推荐蜂蜜水" },
  { name: "寒露", month: 10, day: 8, advice: "宜滋阴润燥，推荐芝麻糊" },
  { name: "霜降", month: 10, day: 23, advice: "宜补血养颜，推荐红糖姜茶" },
  { name: "立冬", month: 11, day: 7, advice: "宜温补肾阳，推荐羊肉" },
  { name: "小雪", month: 11, day: 22, advice: "宜温补，推荐核桃、板栗" },
  { name: "大雪", month: 12, day: 7, advice: "宜补肾藏精，推荐黑芝麻" },
  { name: "冬至", month: 12, day: 22, advice: "宜补阳气，推荐当归羊肉汤" }
];

/**
 * 获取当前节气
 */
export function getCurrentTerm() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // 找到最近的节气（当前日期之后最近的节气）
  let currentTerm = null;
  let nextTerm = null;

  for (let i = 0; i < solarTermsMap.length; i++) {
    const term = solarTermsMap[i];
    if (term.month > month || (term.month === month && term.day >= day)) {
      nextTerm = term;
      currentTerm = i > 0 ? solarTermsMap[i - 1] : solarTermsMap[solarTermsMap.length - 1];
      break;
    }
  }

  // 如果还没到第一个节气，返回去年的最后一个
  if (!nextTerm) {
    currentTerm = solarTermsMap[solarTermsMap.length - 1];
    nextTerm = solarTermsMap[0];
  }

  return {
    current: currentTerm,
    next: nextTerm
  };
}

/**
 * 获取当前节气的建议
 */
export function getCurrentAdvice() {
  const { current } = getCurrentTerm();
  return current?.advice || "注意养生";
}

/**
 * 获取所有节气列表
 */
export function getAllTerms() {
  return solarTermsMap;
}
