/**
 * 二十四节气数据表
 * 包含节气名称、日期和养生建议
 */
export const solarTermsMap = [
  { name: "小寒", month: 1, day: 5, advice: "小寒时节，阴气最盛，宜温补肾阳。推荐食用羊肉汤、核桃、桂圆等温热食物，适量运动增强体质，注意保暖防寒，尤其是背部和足部。" },
  { name: "大寒", month: 1, day: 20, advice: "大寒是一年中最寒冷的时节，宜食用温热食物如牛肉、生姜、红枣等。作息规律，早睡晚起，避免过度劳累，可适量食用温热的药膳调理身体。" },
  { name: "立春", month: 2, day: 3, advice: "立春标志着春季开始，宜疏肝理气。推荐食用菠菜、豆芽、春笋等应季蔬菜，保持心情舒畅，适当增加户外活动，促进肝气疏泄。" },
  { name: "雨水", month: 2, day: 19, advice: "雨水时节，湿气渐重，宜健脾祛湿。推荐食用山药、薏米、红豆等食物，避免生冷饮食，保持居住环境干燥，适当运动增强脾胃功能。" },
  { name: "惊蛰", month: 3, day: 5, advice: "惊蛰时节，万物复苏，宜润肺止咳。推荐食用梨、蜂蜜、百合等滋润食物，保持室内空气流通，适当增加运动量，增强体质。" },
  { name: "春分", month: 3, day: 20, advice: "春分时节，昼夜平分，宜平衡阴阳。推荐食用清淡饮食，如新鲜蔬菜、水果等，保持情绪稳定，适当运动，维持身体阴阳平衡。" },
  { name: "清明", month: 4, day: 5, advice: "清明时节，肝气旺盛，宜养肝明目。推荐饮用菊花茶、决明子茶，食用绿色蔬菜如菠菜、荠菜等，保持充足睡眠，避免过度用眼。" },
  { name: "谷雨", month: 4, day: 20, advice: "谷雨时节，雨水增多，宜祛湿健脾。推荐食用冬瓜汤、薏米粥、红豆等食物，避免居住环境潮湿，适当运动促进湿气排出。" },
  { name: "立夏", month: 5, day: 5, advice: "立夏标志着夏季开始，宜养心清热。推荐食用苦瓜、绿豆、西瓜等清热食物，保持心情平静，避免过度劳累，保证充足睡眠。" },
  { name: "小满", month: 5, day: 21, advice: "小满时节，气温升高，宜健脾利湿。推荐食用薏米粥、绿豆汤、冬瓜等食物，避免辛辣刺激饮食，适当运动但避免过度出汗。" },
  { name: "芒种", month: 6, day: 5, advice: "芒种时节，天气炎热，宜清热解暑。推荐食用西瓜、绿茶、绿豆汤等清热食物，避免长时间在阳光下暴晒，保持充足水分摄入。" },
  { name: "夏至", month: 6, day: 21, advice: "夏至时节，阳气最盛，宜养心安神。推荐饮用莲子心茶、百合汤，食用清淡易消化的食物，避免熬夜，保持心情舒畅。" },
  { name: "小暑", month: 7, day: 7, advice: "小暑时节，天气炎热，宜清热消暑。推荐饮用绿豆汤、酸梅汤，食用西瓜、黄瓜等清热食物，避免长时间在高温环境中活动，注意防暑降温。" },
  { name: "大暑", month: 7, day: 22, advice: "大暑是一年中最热的时节，宜防暑降温。推荐饮用凉茶、绿豆汤，食用清淡易消化的食物，避免在午后高温时段外出，保持室内通风。" },
  { name: "立秋", month: 8, day: 7, advice: "立秋标志着秋季开始，宜润燥养肺。推荐食用梨、百合、银耳等滋润食物，避免辛辣刺激饮食，适当增加户外活动，增强肺功能。" },
  { name: "处暑", month: 8, day: 23, advice: "处暑时节，暑气渐消，宜清热润燥。推荐食用银耳汤、梨、蜂蜜等滋润食物，避免贪凉饮冷，保持作息规律，适当运动。" },
  { name: "白露", month: 9, day: 7, advice: "白露时节，天气转凉，宜补肺益气。推荐食用红枣、百合、山药等食物，注意保暖，避免受凉，适当增加运动量，增强体质。" },
  { name: "秋分", month: 9, day: 23, advice: "秋分时节，昼夜平分，宜平衡阴阳。推荐饮用蜂蜜水、食用滋润食物，保持情绪稳定，适当运动，维持身体阴阳平衡。" },
  { name: "寒露", month: 10, day: 8, advice: "寒露时节，天气转寒，宜滋阴润燥。推荐食用芝麻糊、核桃、梨等滋润食物，注意保暖，避免受凉，适当运动增强体质。" },
  { name: "霜降", month: 10, day: 23, advice: "霜降时节，天气寒冷，宜补血养颜。推荐饮用红糖姜茶、食用红枣、桂圆等食物，注意保暖，避免受凉，适当运动增强体质。" },
  { name: "立冬", month: 11, day: 7, advice: "立冬标志着冬季开始，宜温补肾阳。推荐食用羊肉、牛肉、核桃等温热食物，注意保暖，避免受凉，适当运动增强体质。" },
  { name: "小雪", month: 11, day: 22, advice: "小雪时节，天气寒冷，宜温补。推荐食用核桃、板栗、羊肉等温热食物，注意保暖，避免受凉，适当运动增强体质。" },
  { name: "大雪", month: 12, day: 7, advice: "大雪时节，天气寒冷，宜补肾藏精。推荐食用黑芝麻、核桃、羊肉等温热食物，注意保暖，避免受凉，适当运动增强体质。" },
  { name: "冬至", month: 12, day: 22, advice: "冬至时节，阴气最盛，宜补阳气。推荐食用当归羊肉汤、桂圆、红枣等温热食物，注意保暖，避免受凉，适当运动增强体质。" }
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
