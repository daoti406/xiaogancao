<template>
  <div class="quiz-container">
    <h2>中医体质辨识问卷</h2>
    <p>请根据您近一年的情况，选择最符合的选项。每题均为单选。</p>
    <div v-for="(q, idx) in questions" :key="idx" class="question-item">
      <p class="question-text">{{ idx+1 }}. {{ q.text }}</p>
      <el-radio-group v-model="answers[idx]" size="small">
        <el-radio :label="1">总是</el-radio>
        <el-radio :label="2">经常</el-radio>
        <el-radio :label="3">有时</el-radio>
        <el-radio :label="4">很少</el-radio>
        <el-radio :label="5">从不</el-radio>
      </el-radio-group>
    </div>
    <div class="actions">
      <el-button type="primary" @click="submit" :disabled="!allAnswered">提交问卷</el-button>
      <el-button @click="reset">重置</el-button>
    </div>
    <div v-if="result" class="result">
      <h3>您的体质倾向：{{ result.constitution }}</h3>
      <p>详细得分：</p>
      <ul>
        <li v-for="(score, type) in result.scores" :key="type">{{ type }}：{{ score }}</li>
      </ul>
      <p>接下来，小甘草会根据您的体质为您提供更个性化的建议~</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { submit as submitConstitution } from '@/api/constitution';
import { useRouter } from 'vue-router';

// 问卷问题（与后端保持一致）
const questions = ref([
  { text: '您手脚发凉吗？' },
  { text: '您比一般人怕冷吗？' },
  { text: '您感到口干咽燥吗？' },
  { text: '您手心脚心发热吗？' },
  { text: '您容易疲乏吗？' },
  { text: '您容易气短（呼吸短促）吗？' },
  { text: '您感到身体沉重吗？' },
  { text: '您腹部肥满松软吗？' },
  { text: '您面部或鼻部有油腻感吗？' },
  { text: '您口苦或嘴里有异味吗？' },
  { text: '您皮肤容易出现瘀斑吗？' },
  { text: '您面色晦暗或出现暗斑吗？' },
  { text: '您感到闷闷不乐、情绪低落吗？' },
  { text: '您容易紧张、焦虑吗？' },
  { text: '您容易过敏（如药物、食物、花粉）吗？' },
  { text: '您精力充沛吗？' },
  { text: '您能适应外界自然和社会环境的变化吗？' }
]);

const answers = ref(new Array(questions.value.length).fill(null));
const result = ref(null);
const router = useRouter();

const allAnswered = computed(() => answers.value.every(v => v !== null));

const submit = async () => {
  try {
    ElMessage.loading('正在提交问卷，请稍候...');
    const response = await submitConstitution(answers.value);
    ElMessage.success('问卷提交成功！');
    // 跳转到结果页面
    router.push('/constitution/report');
  } catch (error) {
    console.error('问卷提交失败:', error);
    ElMessage.error('请求资源失败，请稍后重试');
  }
};

const reset = () => {
  answers.value.fill(null);
  result.value = null;
  localStorage.removeItem('userConstitution');
};
</script>

<style scoped>
.quiz-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}
.question-item {
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
.question-text {
  font-weight: 500;
  margin-bottom: 8px;
}
.actions {
  margin-top: 20px;
  text-align: center;
}
.result {
  margin-top: 30px;
  padding: 15px;
  background: #f0f9eb;
  border-radius: 6px;
}
.result ul {
  columns: 2;
  list-style: none;
  padding-left: 0;
}
.result li {
  margin: 5px 0;
}
</style>