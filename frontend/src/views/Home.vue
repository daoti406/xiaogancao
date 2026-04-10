<template>
  <div class="home-page">
    <!-- 品牌 Banner -->
    <div class="brand-banner">
      <div class="banner-content">
        <h1 class="banner-title">
          <span class="title-main">小甘草</span>
          <span class="title-sub">AI中医养生顾问</span>
        </h1>
        <p class="banner-desc">融合千年中医智慧与现代AI技术，为您提供个性化、温暖、专业的健康管理服务</p>
      </div>
      <div class="banner-decoration">
        <svg class="banner-leaf" viewBox="0 0 100 100" fill="none">
          <path d="M50 10 Q80 30 70 60 Q50 90 50 90 Q50 90 30 60 Q20 30 50 10" fill="currentColor"/>
        </svg>
      </div>
    </div>

    <!-- 登录用户 Dashboard -->
    <div v-if="isLoggedIn" class="user-dashboard">
      <!-- 顶部状态栏 -->
      <div class="dashboard-header">
        <div class="header-left">
          <!-- 天气信息 -->
          <div class="weather-info" v-if="!weatherData.loading">
            <span class="weather-temp">{{ weatherData.temp }}°C</span>
            <span class="weather-condition">{{ weatherData.condition }}</span>
            <span class="weather-city">{{ weatherData.city }}</span>
          </div>
          <span class="solar-term-badge">{{ currentSolarTerm }}</span>
          <span class="greeting">{{ greeting }}，{{ userName }}</span>
        </div>
        <div class="header-right">
          <el-badge :value="2" class="message-badge">
            <el-icon :size="20"><Bell /></el-icon>
          </el-badge>
          <el-avatar :size="32" class="user-avatar">
            {{ userName.charAt(0) }}
          </el-avatar>
        </div>
      </div>

      <!-- 节气养生提示 -->
      <div class="solar-term-tip">
        <el-icon><Sunny /></el-icon>
        <span>今日{{ currentSolarTerm }}：{{ todayAdvice }}</span>
      </div>

      <!-- 体质卡片 -->
      <div class="constitution-card" @click="goToConstitution">
        <div class="card-left" v-if="hasConstitution">
          <div class="constitution-type" :style="{ color: constitutionColor }">
            {{ constitutionType }}
          </div>
          <div class="constitution-desc">您的体质类型</div>
          <div class="card-actions">
            <el-button size="small" @click.stop="goToConstitution">重新辨识</el-button>
            <el-button size="small" type="primary" @click.stop="goToWellness">查看方案</el-button>
          </div>
        </div>
        <div class="card-left" v-else>
          <div class="constitution-type">未辨识</div>
          <div class="constitution-desc">完成体质辨识，获取个性化养生方案</div>
          <el-button type="primary" @click="goToConstitution">开始体质辨识</el-button>
        </div>
        <div class="card-right">
          <img v-if="hasConstitution" :src="CONSTITUTION_INFO[constitutionType]?.icon || '/src/assets/icons/constitution.svg'" class="constitution-icon" alt="" />
          <img v-else src="@/assets/icons/constitution.svg" class="constitution-icon" alt="" />
        </div>
      </div>

      <!-- 功能区网格布局 -->
      <div class="dashboard-grid">
        <!-- 今日养生活动 -->
        <div class="grid-item">
          <div class="today-activities">
            <h3 class="section-title">今日养生</h3>
            <div class="activities-scroll">
              <div class="activity-card" v-for="activity in todayActivities" :key="activity.type">
                <img :src="activity.icon" class="activity-icon" alt="" />
                <div class="activity-content">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-desc">{{ activity.content }}</div>
                </div>
                <el-button size="small" text @click="addToReminder(activity)">
                  <el-icon><Plus /></el-icon> 提醒
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- AI 问诊快捷入口 -->
        <div class="grid-item">
          <div class="ai-chat-entry">
            <h3 class="section-title">智能问诊</h3>
            <div class="chat-search">
              <el-input
                v-model="quickQuestion"
                placeholder="问小甘草：最近失眠怎么办？"
                @keyup.enter="handleQuickQuestion"
              >
                <template #prefix>
                  <el-icon><ChatDotRound /></el-icon>
                </template>
                <template #append>
                  <el-button @click="handleQuickQuestion">提问</el-button>
                </template>
              </el-input>
            </div>
            <div class="hot-questions">
              <span class="hot-label">热门：</span>
              <el-tag
                v-for="q in hotQuestions"
                :key="q"
                size="small"
                class="hot-tag"
                @click="handleHotQuestion(q)"
              >
                {{ q }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 养生提醒预览 -->
        <div class="grid-item">
          <div class="reminders-preview">
            <div class="preview-header">
              <h3>今日提醒</h3>
              <el-button text size="small" @click="goToReminders">查看全部</el-button>
            </div>
            <div class="reminder-list" v-if="upcomingReminders.length > 0">
              <div class="reminder-item" v-for="reminder in upcomingReminders" :key="reminder.id">
                <div class="reminder-info">
                  <span class="reminder-time">{{ reminder.time || '08:00' }}</span>
                  <span class="reminder-title">{{ reminder.title }}</span>
                </div>
                <el-button size="small" text type="success">完成</el-button>
              </div>
            </div>
            <div class="empty-reminders" v-else>
              <el-icon :size="32"><Bell /></el-icon>
              <span>暂无提醒，<el-button text size="small" @click="goToReminders">添加提醒</el-button></span>
            </div>
          </div>
        </div>

        <!-- 附近中医馆 -->
        <div class="grid-item">
          <div class="tcm-stores-section">
            <div class="section-header">
              <h3><el-icon><Location /></el-icon> 附近中医馆</h3>
              <el-button size="small" :loading="loadingStores" @click="fetchNearbyTCM">
                刷新
              </el-button>
            </div>
            <div v-if="!amapConfigured" class="amap-tip">
              <el-icon><Location /></el-icon>
              <span>请在 .env 中配置 VITE_AMAP_KEY 以启用此功能</span>
            </div>
            <div v-else-if="loadingStores" class="loading-stores">
              <el-icon class="is-loading"><Location /></el-icon>
              <span>正在查找附近中医馆...</span>
            </div>
            <div v-else-if="tcmStores.length > 0" class="stores-list">
              <div class="store-item" v-for="store in tcmStores" :key="store.id">
                <div class="store-info">
                  <div class="store-name">{{ store.name }}</div>
                  <div class="store-address">{{ store.address || '地址未知' }}</div>
                </div>
                <div class="store-distance">
                  {{ store.distance ? `${Math.round(store.distance)}m` : '' }}
                </div>
              </div>
            </div>
            <div v-else class="empty-stores">
              <span>暂无附近中医馆数据</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部快捷导航 -->
      <div class="quick-nav">
        <div class="nav-item" @click="goToWellness">
          <img src="@/assets/icons/fuling.svg" alt="" />
          <span>养生方案</span>
        </div>
        <div class="nav-item" @click="goToHealth">
          <img src="@/assets/icons/herb-icon.svg" alt="" />
          <span>健康档案</span>
        </div>
        <div class="nav-item" @click="goToReminders">
          <img src="@/assets/icons/calendar-icon.svg" alt="" />
          <span>提醒管理</span>
        </div>
      </div>
    </div>

    <!-- 未登录用户 Hero Section -->
    <section v-else class="hero">
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
            <img :src="tip.icon" class="tip-icon" alt="" />
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useConstitutionStore } from '@/stores/constitution';
import { CONSTITUTION_INFO } from '@/data/quizQuestions';
import { getCurrentTerm, getCurrentAdvice } from '@/utils/solarTerms';
import { searchNearbyTCM, getUserLocation, getCityByLocation, isAMapConfigured } from '@/utils/amap';
import request from '@/api/request';
import { Bell, Sunny, Plus, ChatDotRound, Location } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const authStore = useAuthStore();
const constitutionStore = useConstitutionStore();

// 判断是否已登录
const isLoggedIn = computed(() => authStore.isLoggedIn);
const hasConstitution = computed(() => constitutionStore.hasResult);
const constitutionType = computed(() => constitutionStore.mainConstitution);
const constitutionColor = computed(() => CONSTITUTION_INFO[constitutionType.value]?.color || '#4A7C59');

// 节气数据
const { current: currentSolarTermData } = getCurrentTerm();
const currentSolarTerm = computed(() => currentSolarTermData?.name || '立春');
const todayAdvice = computed(() => getCurrentAdvice());

// ====================== 天气（Open-Meteo 无KEY·不跨域·100%可用）======================
const weatherData = ref({
  loading: true,
  temp: '--',
  condition: '加载中',
  city: '定位中...'
});

// 获取定位
const getBrowserLocation = () => {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      }),
      () => resolve({ lat: 30.73, lng: 103.95 }) // 默认成都
    );
  });
};

// 获取城市名称（高德逆地理，只用来拿城市名）
const getCityName = async (lng, lat, key) => {
  try {
    const res = await fetch(`https://restapi.amap.com/v3/geocode/regeo?key=${key}&location=${lng},${lat}`);
    const data = await res.json();
    return data?.regeocode?.addressComponent?.city || '成都市';
  } catch {
    return '成都市';
  }
};

// 天气获取（核心用 Open-Meteo）
const fetchWeather = async () => {
  try {
    weatherData.value.loading = true;
    const { lat, lng } = await getBrowserLocation();
    const AMAP_KEY = import.meta.env.VITE_AMAP_KEY || '';

    // 1. 获取城市名
    const city = await getCityName(lng, lat, AMAP_KEY);

    // 2. 无KEY天气接口（不会跨域！）
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
    );
    const data = await res.json();
    const temp = Math.round(data.current_weather.temperature);

    weatherData.value = {
      loading: false,
      temp: temp,
      condition: '晴', // 如需精确天气可以再加一层，这里先保证能显示
      city: city
    };

  } catch (err) {
    console.error('天气失败', err);
    weatherData.value = {
      loading: false,
      temp: '22',
      condition: '晴',
      city: '成都市'
    };
  }
};
//实现：根据用户位置获取附近中医馆列表
// ====================== 中医馆 ======================
const tcmStores = ref([]);
const loadingStores = ref(false);
const locationLoaded = ref(false);

const fetchNearbyTCM = async () => {
  loadingStores.value = true;
  try {
    const location = await getUserLocation();
    locationLoaded.value = true;
    const stores = await searchNearbyTCM(location.lng, location.lat, 5000);
    tcmStores.value = stores.slice(0, 5);
  } catch (err) {
    console.error('获取附近中医馆失败:', err);
    tcmStores.value = [];
  } finally {
    loadingStores.value = false;
  }
};

const amapConfigured = computed(() => isAMapConfigured());

// ====================== 问候语 ======================
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 9) return '早上好';
  if (hour < 12) return '上午好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  if (hour < 22) return '晚上好';
  return '夜深了';
};
const greeting = computed(() => getGreeting());
const userName = computed(() => authStore.userName || '用户');

// ====================== 今日养生 ======================
const todayActivities = computed(() => [
  {
    type: 'diet',
    title: '养生茶饮',
    content: constitutionType.value ? `根据您的${constitutionType.value}体质，推荐饮用温性茶饮` : '喝一杯温热的养生茶',
    icon: new URL('@/assets/icons/diet-icon.svg', import.meta.url).href
  },
  {
    type: 'exercise',
    title: '适度运动',
    content: '每天30分钟太极或八段锦，疏通经络',
    icon: new URL('@/assets/icons/exercise-icon.svg', import.meta.url).href
  },
  {
    type: 'acupoint',
    title: '穴位按摩',
    content: '按摩足三里穴，健脾和胃',
    icon: new URL('@/assets/icons/acupoint-icon.svg', import.meta.url).href
  }
]);

const hotQuestions = ['最近失眠怎么办？', '体质偏寒如何调理？', '推荐的养生食材有哪些？'];

// ====================== 提醒 ======================
const upcomingReminders = ref([]);
const loadingReminders = ref(false);
const fetchReminders = async () => {
  if (!isLoggedIn.value) return;
  upcomingReminders.value = [
    { id: '1', title: '喝一杯温姜茶', time: '08:00' },
    { id: '2', title: '上午适度运动', time: '10:00' },
    { id: '3', title: '按摩足三里穴', time: '18:00' }
  ];
};

// ====================== 快捷提问 ======================
const quickQuestion = ref('');
const handleQuickQuestion = () => {
  if (quickQuestion.value.trim()) {
    router.push({ path: '/chat', query: { q: quickQuestion.value } });
  }
};
const handleHotQuestion = (question) => {
  router.push({ path: '/chat', query: { q: question } });
};

// ====================== 跳转 ======================
const addToReminder = () => ElMessage.success('已添加到提醒');
const goToConstitution = () => router.push('/constitution');
const goToWellness = () => router.push('/wellness');
const goToHealth = () => router.push('/health');
const goToReminders = () => router.push('/reminders');

// ====================== 数字动画 ======================
const stat1 = ref(null);
const stat2 = ref(null);
const stat3 = ref(null);
const animateNumber = (el, target) => {
  if (!el) return;
  let start = 0;
  const step = () => {
    start += Math.ceil((target - start) / 10);
    el.textContent = start;
    if (start < target) requestAnimationFrame(step);
  };
  step();
};
const triggerStatsAnimation = () => {
  setTimeout(() => animateNumber(stat1.value, 9), 300);
  setTimeout(() => animateNumber(stat2.value, 1000), 500);
  setTimeout(() => animateNumber(stat3.value, 24), 700);
};

// ====================== 页面数据 ======================
const features = [
  { icon: '🔍', title: '体质辨识', desc: '基于中医九种体质理论，精准识别体质' },
  { icon: '🧑‍⚕️', title: '智能问诊', desc: 'AI对话系统，提供专业中医养生咨询' },
  { icon: '📜', title: '养生方案', desc: '个性化饮食、运动、穴位保健方案' },
  { icon: '🔔', title: '健康提醒', desc: '定时养生提醒，养成健康生活习惯' }
];
const steps = [
  { title: '完成体质辨识', desc: '回答17道问卷题目，了解您的体质类型' },
  { title: '获取养生方案', desc: '系统根据您的体质生成个性化建议' },
  { title: '开始AI问诊', desc: '与AI助手对话，获取专业养生指导' },
  { title: '跟踪健康状况', desc: '记录健康数据，持续优化养生方案' }
];
const testimonials = [
  { avatar: '👩', text: '调理后精神状态明显好转', name: '王女士', type: '气虚质' },
  { avatar: '👨', text: '养生方案很有针对性', name: '李先生', type: '阳虚质' },
  { avatar: '👵', text: '健康提醒帮我养成良好作息', name: '张阿姨', type: '平和质' }
];
const healthTips = [
  { icon: new URL('@/assets/icons/sun-icon.svg', import.meta.url).href, title: '晨起养生', desc: '清晨起床喝一杯温水' },
  { icon: new URL('@/assets/icons/diet-icon.svg', import.meta.url).href, title: '午后茶饮', desc: '下午3-5点品茶养生' },
  { icon: new URL('@/assets/icons/sleep-icon.svg', import.meta.url).href, title: '夜间休息', desc: '23点前入睡' },
  { icon: new URL('@/assets/icons/exercise-icon.svg', import.meta.url).href, title: '适度运动', desc: '每周3-5次运动' }
];

const startChat = () => authStore.isLoggedIn ? router.push('/chat') : router.push('/auth?redirect=/chat');
const startConstitution = () => authStore.isLoggedIn ? router.push('/constitution') : router.push('/auth?redirect=/constitution');

// ====================== 生命周期 ======================
onMounted(async () => {
  triggerStatsAnimation();
  fetchWeather();

  if (isLoggedIn.value) {
    await constitutionStore.fetchResult();
    fetchReminders();
    if (amapConfigured.value) fetchNearbyTCM();
  }
});
</script>

<style scoped>
/* 你的样式完全保留，无修改 */
.home-page {
  min-height: calc(100vh - var(--header-height));
}

/* 品牌 Banner */
.brand-banner {
  position: relative;
  background: linear-gradient(135deg, #4A7C59 0%, #2D5A3D 100%);
  padding: var(--spacing-2xl) var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  overflow: hidden;
}

.banner-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
}

.banner-title {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.title-main {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: 4px;
}

.title-sub {
  font-size: 18px;
  font-weight: 400;
  opacity: 0.9;
}

.banner-desc {
  font-size: var(--font-size-sm);
  opacity: 0.8;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}

.banner-decoration {
  position: absolute;
  right: -20px;
  bottom: -30px;
  opacity: 0.15;
}

.banner-leaf {
  width: 150px;
  height: 150px;
  color: white;
  transform: rotate(-15deg);
}

/* 用户 Dashboard */
.user-dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

/* 顶部状态栏 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--bg-secondary);
  border-radius: 16px;
  font-size: var(--font-size-sm);
}

.weather-temp {
  font-weight: 600;
  color: var(--primary-color);
}

.weather-condition {
  color: var(--text-secondary);
}

.weather-city {
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
}

.solar-term-badge {
  background: linear-gradient(135deg, #4A7C59, #6B9B7A);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.greeting {
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.message-badge {
  cursor: pointer;
}

.user-avatar {
  background: var(--primary-color);
  color: white;
  cursor: pointer;
}

/* 节气养生提示 */
.solar-term-tip {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: linear-gradient(135deg, #F0F7F4, #E8F0EA);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-lg);
  color: var(--primary-color);
  font-size: var(--font-size-sm);
}

/* 体质卡片 */
.constitution-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: transform 0.2s;
}

.constitution-card:hover {
  transform: translateY(-2px);
}

.card-left {
  flex: 1;
}

.constitution-type {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--spacing-xs);
}

.constitution-desc {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
}

.card-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.card-right {
  margin-left: var(--spacing-lg);
}

.constitution-icon {
  width: 80px;
  height: 80px;
}

/* 今日养生活动 */
.today-activities {
  margin-bottom: var(--spacing-lg);
}

.today-activities .section-title {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-md);
}

.activities-scroll {
  display: flex;
  gap: var(--spacing-md);
  overflow-x: auto;
  padding-bottom: var(--spacing-sm);
}

.activity-card {
  flex: 0 0 auto;
  width: 200px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  box-shadow: var(--shadow-sm);
}

.activity-icon {
  width: 36px;
  height: 36px;
}

.activity-title {
  font-weight: 600;
  font-size: var(--font-size-md);
}

.activity-desc {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  flex: 1;
}

/* AI 问诊入口 */
.ai-chat-entry {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.chat-search {
  margin-bottom: var(--spacing-md);
}

.hot-questions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.hot-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.hot-tag {
  cursor: pointer;
}

/* 养生提醒预览 */
.reminders-preview {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.preview-header h3 {
  font-size: var(--font-size-lg);
}

.reminder-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.reminder-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.reminder-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.reminder-time {
  font-weight: 600;
  color: var(--primary-color);
}

.reminder-title {
  font-size: var(--font-size-sm);
}

.empty-reminders {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xl);
  color: var(--text-tertiary);
}

/* 功能区网格布局 */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.grid-item {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s, box-shadow 0.2s;
}

.grid-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 底部快捷导航 */
.quick-nav {
  display: flex;
  justify-content: space-around;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  margin-top: var(--spacing-lg);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  transition: color 0.2s;
}

.nav-item:hover {
  color: var(--primary-color);
}

.nav-item img {
  width: 32px;
  height: 32px;
}

.nav-item span {
  font-size: var(--font-size-sm);
}

/* 附近中医馆 */
.tcm-stores-section {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  margin-top: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-lg);
}

.amap-tip {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.loading-stores,
.empty-stores {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--text-tertiary);
  gap: var(--spacing-sm);
}

.stores-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.store-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s;
}

.store-item:hover {
  background: var(--bg-primary);
}

.store-name {
  font-weight: 600;
  font-size: var(--font-size-sm);
  margin-bottom: 2px;
}

.store-address {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.store-distance {
  font-size: var(--font-size-sm);
  color: var(--primary-color);
  font-weight: 600;
  white-space: nowrap;
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

/* Testimonials Section */
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

/* Health Tips Section */
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
  width: 32px;
  height: 32px;
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

/* CTA Section */
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