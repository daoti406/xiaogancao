<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg">
        <!-- 装饰性背景圆 -->
        <div class="bg-circle bg-circle-1"></div>
        <div class="bg-circle bg-circle-2"></div>
        <div class="bg-circle bg-circle-3"></div>
        <!-- 装饰性叶片SVG -->
        <svg class="leaf-decoration leaf-1" viewBox="0 0 100 100" fill="none">
          <path d="M50 10 Q80 30 70 60 Q50 90 50 90 Q50 90 30 60 Q20 30 50 10" fill="currentColor"/>
        </svg>
        <svg class="leaf-decoration leaf-2" viewBox="0 0 100 100" fill="none">
          <path d="M50 10 Q80 30 70 60 Q50 90 50 90 Q50 90 30 60 Q20 30 50 10" fill="currentColor"/>
        </svg>
        <svg class="leaf-decoration leaf-3" viewBox="0 0 100 100" fill="none">
          <path d="M50 10 Q80 30 70 60 Q50 90 50 90 Q50 90 30 60 Q20 30 50 10" fill="currentColor"/>
        </svg>
      </div>
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-line fade-in-up active">小甘草</span>
          <span class="title-line fade-in-up active fade-in-up-delay-1">AI中医养生顾问</span>
        </h1>
        <p class="hero-subtitle fade-in-up active fade-in-up-delay-2">
          融合千年中医智慧与现代AI技术，为您提供个性化、温暖、专业的健康管理服务
        </p>
        <div class="hero-actions fade-in-up active fade-in-up-delay-3">
          <el-button class="btn-primary-glow" type="primary" size="large" @click="startChat">
            开始问诊
          </el-button>
          <el-button class="btn-border-animated" size="large" @click="startConstitution">
            体质辨识
          </el-button>
        </div>
        <div class="hero-stats fade-in-up active fade-in-up-delay-4">
          <div class="stat-item hover-lift">
            <span class="stat-number" ref="stat1">0</span>
            <span class="stat-label">体质类型</span>
          </div>
          <div class="stat-item hover-lift">
            <span class="stat-number" ref="stat2">0</span>
            <span class="stat-label">养生方案</span>
          </div>
          <div class="stat-item hover-lift">
            <span class="stat-number" ref="stat3">0</span>
            <span class="stat-label">在线服务</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="section-container">
        <h2 class="section-title fade-in-up">核心功能</h2>
        <div class="feature-grid">
          <div
            class="feature-card glass hover-lift"
            v-for="(feature, index) in features"
            :key="feature.title"
            :class="`fade-in-up active fade-in-up-delay-${index + 1}`"
          >
            <div class="feature-icon-wrapper">
              <div class="feature-icon">{{ feature.icon }}</div>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="how-it-works">
      <div class="section-container">
        <h2 class="section-title fade-in-up">如何使用</h2>
        <div class="steps">
          <div
            class="step fade-in-up"
            v-for="(step, index) in steps"
            :key="index"
            :class="`active fade-in-up-delay-${index + 1}`"
          >
            <div class="step-number-wrapper">
              <div class="step-number">{{ index + 1 }}</div>
            </div>
            <div class="step-content hover-lift">
              <h3>{{ step.title }}</h3>
              <p>{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="testimonials">
      <div class="section-container">
        <h2 class="section-title fade-in-up">用户体验</h2>
        <div class="testimonial-grid">
          <div
            class="testimonial-card glass hover-lift"
            v-for="(item, index) in testimonials"
            :key="index"
            :class="`fade-in-up active fade-in-up-delay-${index + 1}`"
          >
            <div class="testimonial-avatar">{{ item.avatar }}</div>
            <div class="testimonial-content">
              <p class="testimonial-text">"{{ item.text }}"</p>
              <div class="testimonial-author">
                <span class="author-name">{{ item.name }}</span>
                <span class="author-type">{{ item.type }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Health Tips -->
    <section class="health-tips">
      <div class="section-container">
        <h2 class="section-title fade-in-up">养生小贴士</h2>
        <div class="tips-grid">
          <div
            class="tip-card glass hover-lift"
            v-for="(tip, index) in healthTips"
            :key="index"
            :class="`fade-in-up active fade-in-up-delay-${index + 1}`"
          >
            <div class="tip-icon">{{ tip.icon }}</div>
            <div class="tip-content">
              <h3>{{ tip.title }}</h3>
              <p>{{ tip.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-bg">
        <div class="bg-circle bg-circle-cta-1"></div>
        <div class="bg-circle bg-circle-cta-2"></div>
      </div>
      <div class="cta-content fade-in-up">
        <h2>开启您的健康之旅</h2>
        <p>立即体验个性化中医养生服务，让AI成为您的专属健康顾问</p>
        <div class="cta-actions">
          <el-button class="btn-primary-glow" type="primary" size="large" @click="startConstitution">
            立即体验
          </el-button>
        </div>
      </div>
    </section>

    <!-- Disclaimer -->
    <section class="disclaimer-section">
      <div class="section-container">
        <div class="disclaimer-card glass fade-in-up">
          <div class="disclaimer-icon">⚠️</div>
          <div class="disclaimer-content">
            <h3>重要声明</h3>
            <p>本平台提供的养生建议和体质辨识结果仅供参考，不构成医疗诊断或处方。中医养生建议需结合个人实际情况，如有身体不适请及时就医，遵循专业医师指导。</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// 数字动画相关
const stat1 = ref(null);
const stat2 = ref(null);
const stat3 = ref(null);

// 数字滚动动画
const animateNumber = (element, target, duration = 1500) => {
  if (!element) return;
  const start = 0;
  const startTime = performance.now();

  const update = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // 缓动函数
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * easeOut);
    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };

  requestAnimationFrame(update);
};

// 触发数字动画
const triggerStatsAnimation = () => {
  setTimeout(() => animateNumber(stat1.value, 9), 300);
  setTimeout(() => animateNumber(stat2.value, 1000, 2000), 500);
  setTimeout(() => animateNumber(stat3.value, 24, 1000), 700);
};

// 页面加载时触发动画
onMounted(() => {
  triggerStatsAnimation();
});

const features = [
  {
    icon: '📋',
    title: '体质辨识',
    desc: '基于中医九种体质理论，通过科学问卷精准识别您的体质类型'
  },
  {
    icon: '🤖',
    title: '智能问诊',
    desc: 'AI智能对话系统，提供温暖、专业的中医养生咨询服务'
  },
  {
    icon: '🍵',
    title: '养生方案',
    desc: '根据体质生成个性化养生方案，涵盖饮食、运动、穴位保健'
  },
  {
    icon: '📅',
    title: '健康提醒',
    desc: '定时养生提醒，帮助您养成健康的生活习惯'
  }
];

const steps = [
  { title: '完成体质辨识', desc: '回答17道问卷题目，了解您的体质类型' },
  { title: '获取养生方案', desc: '系统根据您的体质生成个性化建议' },
  { title: '开始AI问诊', desc: '与AI助手对话，获取专业养生指导' },
  { title: '跟踪健康状况', desc: '记录健康数据，持续优化养生方案' }
];

const testimonials = [
  {
    avatar: '👩',
    text: '通过体质辨识，我发现自己是气虚质，按照建议调理后，精神状态明显好转',
    name: '王女士',
    type: '气虚质'
  },
  {
    avatar: '👨',
    text: 'AI问诊非常专业，给出的养生方案很有针对性，客服态度也很温暖',
    name: '李先生',
    type: '阳虚质'
  },
  {
    avatar: '👵',
    text: '年纪大了容易忘事，健康提醒功能帮我养成了良好的作息习惯',
    name: '张阿姨',
    type: '平和质'
  }
];

const healthTips = [
  {
    icon: '🌅',
    title: '晨起养生',
    desc: '清晨起床后喝一杯温水，唤醒身体机能'
  },
  {
    icon: '🍵',
    title: '午后茶饮',
    desc: '下午3-5点最适合品茶养生'
  },
  {
    icon: '🌙',
    title: '夜间休息',
    desc: '建议在23点前入睡，保证7-8小时睡眠'
  },
  {
    icon: '🏃',
    title: '适度运动',
    desc: '每周3-5次适度运动，每次30分钟为宜'
  }
];

const startChat = () => {
  if (authStore.isLoggedIn) {
    router.push('/chat');
  } else {
    router.push('/auth?redirect=/chat');
  }
};

const startConstitution = () => {
  if (authStore.isLoggedIn) {
    router.push('/constitution');
  } else {
    router.push('/auth?redirect=/constitution');
  }
};
</script>

<style scoped>
.home-page {
  min-height: calc(100vh - var(--header-height));
}

/* Hero Section */
.hero {
  position: relative;
  min-height: calc(100vh - var(--header-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  background: linear-gradient(135deg, var(--bg-primary) 0%, #F0EBE3 50%, var(--bg-secondary) 100%);
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* 背景装饰圆 */
.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
}

.bg-circle-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
  top: -150px;
  left: -100px;
  animation: float 8s ease-in-out infinite;
}

.bg-circle-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, var(--secondary-light), var(--secondary-color));
  bottom: -100px;
  right: -50px;
  animation: float 10s ease-in-out infinite reverse;
}

.bg-circle-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, var(--accent-color), var(--primary-light));
  top: 40%;
  left: 50%;
  transform: translateX(-50%);
  animation: float 12s ease-in-out infinite;
}

/* 叶片装饰 */
.leaf-decoration {
  position: absolute;
  width: 120px;
  height: 120px;
  opacity: 0.12;
  color: var(--primary-dark);
}

.leaf-1 {
  top: 8%;
  left: 8%;
  animation: floatSubtle 6s ease-in-out infinite;
}

.leaf-2 {
  top: 20%;
  right: 12%;
  animation: floatSubtle 7s ease-in-out infinite reverse;
}

.leaf-3 {
  bottom: 15%;
  left: 20%;
  animation: floatSubtle 8s ease-in-out infinite;
}

@keyframes floatSubtle {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-10px) rotate(5deg); }
  66% { transform: translateY(-5px) rotate(-3deg); }
}

.hero-content {
  text-align: center;
  max-width: 700px;
  z-index: 1;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
  line-height: 1.3;
}

.title-line {
  display: block;
  opacity: 0;
  transform: translateY(20px);
}

.title-line:first-child {
  color: var(--primary-color);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  line-height: var(--line-height-relaxed);
  opacity: 0;
}

.hero-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  margin-bottom: var(--spacing-2xl);
  opacity: 0;
}

/* 主按钮发光效果 */
.btn-primary-glow {
  position: relative;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border: none;
  transition: all 0.3s ease;
  overflow: hidden;
}

.btn-primary-glow:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(74, 124, 89, 0.4);
}

.btn-primary-glow::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.5s ease;
}

.btn-primary-glow:hover::before {
  left: 100%;
}

/* 次按钮边框动画 */
.btn-border-animated {
  position: relative;
  background: var(--bg-card);
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
  transition: all 0.3s ease;
}

.btn-border-animated:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.hero-stats {
  display: flex;
  gap: var(--spacing-2xl);
  justify-content: center;
  opacity: 0;
}

.stat-item {
  text-align: center;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  min-width: 120px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: var(--shadow-lg);
}

.stat-number {
  display: block;
  font-size: 36px;
  font-weight: 700;
  color: var(--primary-color);
  font-family: 'DIN Alternate', var(--font-family);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin-top: var(--spacing-xs);
}

/* Features Section */
.features {
  padding: var(--spacing-2xl) 0;
  background: linear-gradient(180deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
}

.section-container {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.section-title {
  text-align: center;
  font-size: 32px;
  margin-bottom: var(--spacing-2xl);
  opacity: 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

.feature-card {
  text-align: center;
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.feature-card.active {
  opacity: 1;
  transform: translateY(0);
}

.feature-card:hover {
  box-shadow: 0 16px 48px rgba(74, 124, 89, 0.15);
}

.feature-icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: var(--spacing-md);
}

.feature-icon {
  font-size: 48px;
  transition: transform 0.3s ease;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1);
}

.feature-title {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.feature-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}

/* How It Works */
.how-it-works {
  padding: var(--spacing-2xl) 0;
  background: var(--bg-secondary);
  position: relative;
  overflow: hidden;
}

.how-it-works::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(180deg, var(--bg-card) 0%, transparent 100%);
  opacity: 0.5;
}

.steps {
  display: flex;
  gap: var(--spacing-xl);
  position: relative;
}

/* 连接线 */
.steps::before {
  content: '';
  position: absolute;
  top: 36px;
  left: 60px;
  right: 60px;
  height: 3px;
  background: linear-gradient(90deg,
    var(--primary-light) 0%,
    var(--primary-color) 50%,
    var(--primary-light) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 3s linear infinite;
  z-index: 0;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.step {
  flex: 1;
  display: flex;
  gap: var(--spacing-md);
  position: relative;
  z-index: 1;
  opacity: 0;
}

.step.active {
  opacity: 1;
}

.step-number-wrapper {
  flex-shrink: 0;
}

.step-number {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(74, 124, 89, 0.3);
  transition: all 0.3s ease;
}

.step:hover .step-number {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(74, 124, 89, 0.4);
}

.step-content {
  padding: var(--spacing-sm) 0;
  transition: transform 0.3s ease;
}

.step-content h3 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}

.step-content p {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Disclaimer */
.disclaimer-section {
  padding: var(--spacing-2xl) 0;
  background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
}

.disclaimer-card {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--warning-color);
  opacity: 0;
}

.disclaimer-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.disclaimer-content h3 {
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.disclaimer-content p {
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}

/* ============================================
   Testimonials Section
   ============================================ */
.testimonials {
  padding: var(--spacing-2xl) 0;
  background: var(--bg-card);
}

.testimonial-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
}

.testimonial-card {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  opacity: 0;
}

.testimonial-card:hover {
  box-shadow: 0 12px 40px rgba(74, 124, 89, 0.12);
}

.testimonial-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.testimonial-content {
  flex: 1;
}

.testimonial-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-sm);
}

.testimonial-author {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.author-type {
  font-size: var(--font-size-xs);
  color: var(--primary-color);
  background: var(--success-bg);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

/* ============================================
   Health Tips Section
   ============================================ */
.health-tips {
  padding: var(--spacing-2xl) 0;
  background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-card) 100%);
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

.tip-card {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  opacity: 0;
}

.tip-card:hover {
  box-shadow: 0 12px 40px rgba(74, 124, 89, 0.1);
}

.tip-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.tip-content h3 {
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}

.tip-content p {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}

/* ============================================
   CTA Section
   ============================================ */
.cta-section {
  position: relative;
  padding: 80px var(--spacing-lg);
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
  overflow: hidden;
}

.cta-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-circle-cta-1 {
  position: absolute;
  width: 400px;
  height: 400px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  filter: blur(60px);
  top: -100px;
  right: -50px;
  animation: float 8s ease-in-out infinite;
}

.bg-circle-cta-2 {
  position: absolute;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  filter: blur(50px);
  bottom: -80px;
  left: -30px;
  animation: float 10s ease-in-out infinite reverse;
}

.cta-content {
  position: relative;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  z-index: 1;
}

.cta-content h2 {
  font-size: 36px;
  color: white;
  margin-bottom: var(--spacing-md);
}

.cta-content p {
  font-size: var(--font-size-lg);
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: var(--spacing-xl);
  line-height: var(--line-height-relaxed);
}

.cta-actions .btn-primary-glow {
  background: white;
  color: var(--primary-color);
}

.cta-actions .btn-primary-glow:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

/* Responsive */
@media (max-width: 1024px) {
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .steps {
    flex-wrap: wrap;
    gap: var(--spacing-lg);
  }

  .step {
    width: 45%;
  }

  .steps::before {
    display: none;
  }

  .testimonial-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .tips-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .hero-stats {
    gap: var(--spacing-md);
    flex-wrap: wrap;
    justify-content: center;
  }

  .stat-item {
    min-width: 100px;
    padding: var(--spacing-md);
  }

  .stat-number {
    font-size: 28px;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .feature-card {
    opacity: 1;
    transform: none;
  }

  .steps {
    flex-direction: column;
  }

  .step {
    width: 100%;
    opacity: 1;
  }

  .testimonial-grid {
    grid-template-columns: 1fr;
  }

  .testimonial-card {
    opacity: 1;
  }

  .tips-grid {
    grid-template-columns: 1fr;
  }

  .tip-card {
    opacity: 1;
  }

  .cta-content h2 {
    font-size: 28px;
  }

  .disclaimer-card {
    flex-direction: column;
    text-align: center;
  }

  .disclaimer-card {
    opacity: 1;
  }
}
</style>
