<template>
  <div class="home-page">
    <!-- 品牌 Banner 轮播图 -->
    <div class="brand-banner">
      <div class="carousel-container">
        <div 
          v-for="(banner, index) in banners" 
          :key="index"
          class="carousel-slide"
          :class="{ active: currentBanner === index }"
          :style="{ backgroundImage: `url(${banner.image})` }"
        >
          <div class="banner-overlay"></div>
          <div class="banner-content">
            <h1 class="banner-title">
              <span class="title-main">{{ banner.title }}</span>
              <span class="title-sub">{{ banner.subtitle }}</span>
            </h1>
            <p class="banner-desc">{{ banner.description }}</p>
            <div class="banner-actions">
              <el-button type="primary" size="large" class="btn-primary-glow" @click="goToConstitution">
                开始体质辨识
              </el-button>
              <el-button size="large" class="btn-secondary" @click="goToCommunity">
                进入养生社区
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 轮播指示器 -->
      <div class="carousel-indicators">
        <div 
          v-for="(banner, index) in banners" 
          :key="index"
          class="indicator"
          :class="{ active: currentBanner === index }"
          @click="goToBanner(index)"
        ></div>
      </div>
      
      <!-- 轮播控制按钮 -->
      <button class="carousel-btn prev" @click="prevBanner">
        <el-icon><ArrowLeft /></el-icon>
      </button>
      <button class="carousel-btn next" @click="nextBanner">
        <el-icon><ArrowRight /></el-icon>
      </button>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 登录用户 Dashboard -->
      <div v-if="isLoggedIn" class="user-dashboard">
        <!-- 顶部状态栏 -->
        <div class="dashboard-header">
          <div class="header-left">
            <!-- 天气信息 -->
            <div class="weather-info" v-if="!weatherData.loading">
              <span class="weather-icon">{{ weatherData.icon }}</span>
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
            <div class="constitution-info">
              <div class="info-item">
                <span class="info-label">主要特征：</span>
                <span class="info-value">{{ CONSTITUTION_INFO[constitutionType]?.characteristics?.join('、') || '暂无数据' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">推荐饮食：</span>
                <span class="info-value">{{ CONSTITUTION_INFO[constitutionType]?.diet?.join('、') || '暂无数据' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">应避免：</span>
                <span class="info-value">{{ CONSTITUTION_INFO[constitutionType]?.avoid?.join('、') || '暂无数据' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">推荐运动：</span>
                <span class="info-value">{{ getRecommendedExercise(constitutionType) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">日常注意：</span>
                <span class="info-value">{{ getDailyTips(constitutionType) }}</span>
              </div>
            </div>
            <div class="card-actions">
              <el-button size="small" @click.stop="goToConstitution">重新辨识</el-button>
              <el-button size="small" type="primary" @click.stop="goToWellness">查看方案</el-button>
              <el-button size="small" @click.stop="showConstitutionDetails">详细信息</el-button>
            </div>
          </div>
          <div class="card-left" v-else>
            <div class="constitution-type">暂未进行测试体质</div>
            <div class="constitution-desc">完成体质辨识，获取个性化养生方案</div>
            <el-button type="primary" @click="goToConstitution">开始体质辨识</el-button>
          </div>
          <div class="card-right">
            <!-- 移除可能加载失败的图片 -->
          </div>
        </div>

        <!-- 体质详细信息对话框 -->
        <el-dialog
          v-model="dialogVisible"
          :title="constitutionType + ' 详细信息'"
          width="600px"
          center
        >
          <div class="constitution-details">
            <div class="detail-section">
              <h4>体质特征</h4>
              <p>{{ CONSTITUTION_INFO[constitutionType]?.characteristics?.join('、') || '暂无数据' }}</p>
            </div>
            <div class="detail-section">
              <h4>推荐饮食</h4>
              <p>{{ CONSTITUTION_INFO[constitutionType]?.diet?.join('、') || '暂无数据' }}</p>
            </div>
            <div class="detail-section">
              <h4>应避免食物</h4>
              <p>{{ CONSTITUTION_INFO[constitutionType]?.avoid?.join('、') || '暂无数据' }}</p>
            </div>
            <div class="detail-section">
              <h4>推荐运动</h4>
              <p>{{ getRecommendedExercise(constitutionType) }}</p>
            </div>
            <div class="detail-section">
              <h4>日常注意事项</h4>
              <p>{{ getDailyTips(constitutionType) }}</p>
            </div>
            <div class="detail-section">
              <h4>养生建议</h4>
              <p>{{ getWellnessAdvice(constitutionType) }}</p>
            </div>
          </div>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="dialogVisible = false">关闭</el-button>
              <el-button type="primary" @click="goToWellness">查看完整方案</el-button>
            </span>
          </template>
        </el-dialog>

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
                <el-icon :size="32"><Location /></el-icon>
                <span>附近未找到中医馆</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部快捷导航 -->
        <div class="quick-nav">
          <div class="nav-item" @click="goToCommunity">
            <img src="@/assets/icons/chat.svg" alt="" />
            <span>养生社区</span>
          </div>
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
      <div v-else class="welcome-section">
        <div class="hero">
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
        </div>

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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useConstitutionStore } from '@/stores/constitution';
import { CONSTITUTION_INFO } from '@/data/quizQuestions';
import { getCurrentTerm, getCurrentAdvice } from '@/utils/solarTerms';
import { searchNearbyTCM, getUserLocation, getCityByLocation, isAMapConfigured } from '@/utils/amap';
import { Bell, Plus, ChatDotRound, Location, ArrowLeft, ArrowRight, InfoFilled } from '@element-plus/icons-vue';
import { ElMessage, ElDialog } from 'element-plus';

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

// ====================== Banner轮播图 ======================
const currentBanner = ref(0);
let bannerInterval = null;

const banners = [
  {
    title: '小甘草',
    subtitle: 'AI中医养生顾问',
    description: '融合千年中医智慧与现代AI技术，为您提供个性化、温暖、专业的健康管理服务',
    image: new URL('@/assets/轮播图/首页背景图.jpg', import.meta.url).href
  },
  {
    title: '体质辨识',
    subtitle: '了解您的体质类型',
    description: '基于中医九种体质理论，通过科学问卷精准识别您的体质，提供个性化养生方案',
    image: new URL('@/assets/轮播图/体质辨识.jpg', import.meta.url).href
  },
  {
    title: '智能问诊',
    subtitle: '24小时在线中医咨询',
    description: 'AI助手随时为您解答养生疑问，提供专业的中医养生建议和健康指导',
    image: new URL('@/assets/轮播图/智能问诊.jpg', import.meta.url).href
  },
  {
    title: '养生方案',
    subtitle: '个性化养生指导',
    description: '根据您的体质类型，定制专属的饮食、运动和生活方式建议',
    image: new URL('@/assets/轮播图/养生方案.jpg', import.meta.url).href
  },
  {
    title: '养生社区',
    subtitle: '与志同道合的朋友交流',
    description: '分享养生心得，交流中医智慧，获取更多实用的养生经验和建议',
    image: new URL('@/assets/轮播图/养生社区.jpg', import.meta.url).href
  },
  {
    title: '健康档案',
    subtitle: '记录您的健康历程',
    description: '跟踪健康数据，记录体质变化，为您的健康管理提供科学依据',
    image: new URL('@/assets/轮播图/健康档案.jpg', import.meta.url).href
  }
];

const nextBanner = () => {
  currentBanner.value = (currentBanner.value + 1) % banners.length;
};

const prevBanner = () => {
  currentBanner.value = (currentBanner.value - 1 + banners.length) % banners.length;
};

const goToBanner = (index) => {
  currentBanner.value = index;
};

const startBannerCarousel = () => {
  if (bannerInterval) clearInterval(bannerInterval);
  bannerInterval = setInterval(() => {
    nextBanner();
  }, 5000);
};

const stopBannerCarousel = () => {
  if (bannerInterval) {
    clearInterval(bannerInterval);
    bannerInterval = null;
  }
};

// ====================== 天气（Open-Meteo 无KEY·不跨域·100%可用）======================
const weatherData = ref({
  loading: true,
  temp: '--',
  condition: '加载中',
  city: '定位中...',
  icon: '☀️'
});

// 天气图标映射
const weatherIcons = {
  'clear': '☀️',
  'partly cloudy': '⛅',
  'cloudy': '☁️',
  'fog': '🌫️',
  'rain': '🌧️',
  'snow': '❄️',
  'thunderstorm': '⛈️',
  'default': '☀️'
};

// 天气状况映射
const weatherConditions = {
  0: '晴',
  1: '晴间多云',
  2: '多云',
  3: '阴天',
  45: '雾',
  48: '霾',
  51: '小雨',
  53: '中雨',
  55: '大雨',
  56: '冻雨',
  57: '冻雨',
  61: '小雨',
  63: '中雨',
  65: '大雨',
  66: '冻雨',
  67: '冻雨',
  71: '小雪',
  73: '中雪',
  75: '大雪',
  77: '雨夹雪',
  80: '阵雨',
  81: '中阵雨',
  82: '大阵雨',
  85: '小阵雪',
  86: '大阵雪',
  95: '雷暴',
  96: '雷暴',
  99: '雷暴'
};

// 天气获取（核心用 Open-Meteo）
const fetchWeather = async () => {
  try {
    weatherData.value.loading = true;
    
    // 使用优化后的定位函数
    const location = await getUserLocation();
    const { lat, lng } = location;
    const AMAP_KEY = import.meta.env.VITE_AMAP_KEY || '';

    // 1. 获取城市名
    const city = await getCityByLocation(lng, lat);

    // 2. 无KEY天气接口（不会跨域！）
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=weathercode&timezone=Asia/Shanghai`
    );
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (!data.current_weather) {
      throw new Error('天气数据获取失败');
    }
    
    const temp = Math.round(data.current_weather.temperature);
    const weatherCode = data.current_weather.weathercode;
    const condition = weatherConditions[weatherCode] || '晴';
    const icon = getWeatherIcon(weatherCode);

    weatherData.value = {
      loading: false,
      temp: temp,
      condition: condition,
      city: city,
      icon: icon
    };

  } catch (err) {
    console.error('天气获取失败:', err);
    weatherData.value = {
      loading: false,
      temp: '22',
      condition: '晴',
      city: '成都市',
      icon: '☀️'
    };
  }
};

// 获取天气图标
function getWeatherIcon(weatherCode) {
  if (weatherCode >= 0 && weatherCode <= 3) return weatherIcons.clear;
  if (weatherCode >= 45 && weatherCode <= 48) return weatherIcons.fog;
  if (weatherCode >= 51 && weatherCode <= 67) return weatherIcons.rain;
  if (weatherCode >= 71 && weatherCode <= 77) return weatherIcons.snow;
  if (weatherCode >= 80 && weatherCode <= 86) return weatherIcons.rain;
  if (weatherCode >= 95 && weatherCode <= 99) return weatherIcons.thunderstorm;
  return weatherIcons.default;
}
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
const goToCommunity = () => router.push('/community');
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

// 推荐运动
const getRecommendedExercise = (constitution) => {
  const exercises = {
    '阳虚质': '散步、太极拳、八段锦等温和运动，避免过度出汗',
    '阴虚质': '瑜伽、太极、冥想等舒缓运动，避免剧烈运动',
    '气虚质': '散步、慢跑、太极等适度运动，避免过度劳累',
    '痰湿质': '有氧运动如快走、游泳、羽毛球等，促进湿气排出',
    '湿热质': '游泳、瑜伽、太极等清爽运动，避免高温环境',
    '血瘀质': '快走、太极拳、按摩等促进血液循环的运动',
    '气郁质': '散步、瑜伽、舞蹈等放松心情的运动',
    '特禀质': '温和的运动如太极、散步，避免剧烈运动',
    '平和质': '各种运动都适宜，保持适度即可'
  };
  return exercises[constitution] || '根据个人情况选择合适的运动';
};

// 日常注意事项
const getDailyTips = (constitution) => {
  const tips = {
    '阳虚质': '注意保暖，尤其是腰腹部和足部，避免贪凉',
    '阴虚质': '保持充足睡眠，避免熬夜，注意滋阴润燥',
    '气虚质': '避免过度劳累，保持规律作息，注意休息',
    '痰湿质': '保持环境干燥，避免久坐，注意饮食清淡',
    '湿热质': '保持皮肤清洁，避免辛辣刺激食物，注意清热',
    '血瘀质': '保持情绪舒畅，避免久坐，注意保暖',
    '气郁质': '保持心情舒畅，多参加社交活动，避免独处',
    '特禀质': '避免接触过敏源，保持环境清洁，增强体质',
    '平和质': '保持良好的生活习惯，维持健康状态'
  };
  return tips[constitution] || '保持健康的生活方式';
};

// 详细信息对话框
const dialogVisible = ref(false);
const showConstitutionDetails = () => {
  dialogVisible.value = true;
};

// 养生建议
const getWellnessAdvice = (constitution) => {
  const advice = {
    '阳虚质': '阳虚体质的人应注重温阳散寒，可适当食用温热性食物，如羊肉、狗肉、桂圆等。同时注意保暖，尤其是腰腹部和足部。适当进行温和的运动，如散步、太极拳等。',
    '阴虚质': '阴虚体质的人应注重滋阴润燥，可适当食用滋阴食物，如银耳、百合、鸭肉、梨等。保持充足睡眠，避免熬夜。适当进行舒缓的运动，如瑜伽、太极等。',
    '气虚质': '气虚体质的人应注重补气健脾，可适当食用补气食物，如山药、黄芪、大枣、鸡肉等。避免过度劳累，保持规律作息。适当进行适度的运动，如散步、慢跑等。',
    '痰湿质': '痰湿体质的人应注重祛湿化痰，可适当食用祛湿食物，如冬瓜、萝卜、薏米、荷叶茶等。保持环境干燥，避免久坐。适当进行有氧运动，如快走、游泳等。',
    '湿热质': '湿热体质的人应注重清热利湿，可适当食用清热食物，如绿豆、苦瓜、莲藕、冬瓜等。保持皮肤清洁，避免辛辣刺激食物。适当进行清爽的运动，如游泳、瑜伽等。',
    '血瘀质': '血瘀体质的人应注重活血化瘀，可适当食用活血化瘀食物，如山楂、玫瑰花、黑豆、红糖等。保持情绪舒畅，避免久坐。适当进行促进血液循环的运动，如快走、太极拳等。',
    '气郁质': '气郁体质的人应注重疏肝解郁，可适当食用疏肝食物，如玫瑰花茶、柑橘、佛手、菊花等。保持心情舒畅，多参加社交活动。适当进行放松心情的运动，如散步、瑜伽、舞蹈等。',
    '特禀质': '特禀体质的人应注重增强体质，避免接触过敏源，可适当食用增强体质的食物，如蜂蜜、大枣、胡萝卜等。保持环境清洁，适当进行温和的运动，如太极、散步等。',
    '平和质': '平和体质的人应保持良好的生活习惯，均衡饮食，适当运动，保持心情舒畅，维持健康状态。'  
  };
  return advice[constitution] || '保持健康的生活方式，定期体检，预防疾病。';
};

const startChat = () => authStore.isLoggedIn ? router.push('/chat') : router.push('/auth?redirect=/chat');
const startConstitution = () => authStore.isLoggedIn ? router.push('/constitution') : router.push('/auth?redirect=/constitution');

// ====================== 生命周期 ======================
onMounted(async () => {
  triggerStatsAnimation();
  fetchWeather();
  startBannerCarousel();

  if (isLoggedIn.value) {
    await constitutionStore.fetchResult();
    fetchReminders();
    if (amapConfigured.value) fetchNearbyTCM();
  }
});

onBeforeUnmount(() => {
  stopBannerCarousel();
});
</script>

<style scoped>
/* 首页主样式 */
.home-page {
  min-height: calc(100vh - var(--header-height));
  background: var(--bg-primary);
  font-family: var(--font-family);
}

/* 主内容区域 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

/* 品牌 Banner 轮播图 */
.brand-banner {
  position: relative;
  padding: 0;
  margin-bottom: var(--spacing-2xl);
  overflow: hidden;
  min-height: 500px;
  height: 60vh;
  background: var(--bg-secondary);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  height: 60vh;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 500px;
  height: 60vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(74, 124, 89, 0.3) 0%, rgba(212, 165, 116, 0.2) 100%);
  z-index: 1;
}

.carousel-slide.active {
  opacity: 1;
}

.banner-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  padding: var(--spacing-2xl) var(--spacing-xl);
  max-width: 800px;
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.banner-title {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
}

.title-main {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 700;
  letter-spacing: 4px;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  font-family: var(--font-family-serif);
}

.title-sub {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 400;
  opacity: 0.95;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.banner-desc {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto var(--spacing-xl);
  line-height: 1.6;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.banner-actions {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary-glow {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  border: none;
  box-shadow: 0 4px 16px rgba(74, 124, 89, 0.4);
  transition: all 0.3s ease;
}

.btn-primary-glow:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 124, 89, 0.5);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

/* 轮播指示器 */
.carousel-indicators {
  position: absolute;
  bottom: var(--spacing-xl);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--spacing-sm);
  z-index: 10;
}

.indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.1);
}

.indicator.active {
  background: white;
  transform: scale(1.3);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

/* 轮播控制按钮 */
.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.carousel-btn:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.carousel-btn.prev {
  left: var(--spacing-xl);
}

.carousel-btn.next {
  right: var(--spacing-xl);
}

.carousel-btn .el-icon {
  font-size: 28px;
}

/* 用户 Dashboard */
.user-dashboard {
  max-width: 1200px;
  margin: 0 auto var(--spacing-2xl);
  padding: var(--spacing-xl);
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
}

/* 顶部状态栏 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.weather-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: linear-gradient(135deg, var(--bg-secondary), var(--bg-card));
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.weather-icon {
  font-size: var(--font-size-xl);
  margin-right: var(--spacing-xs);
}

.weather-temp {
  font-weight: 600;
  color: var(--primary-color);
  font-size: var(--font-size-lg);
}

.weather-condition {
  color: var(--text-secondary);
}

.weather-city {
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
  padding-left: var(--spacing-sm);
  border-left: 1px solid var(--border-color);
}

.solar-term-badge {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

.greeting {
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.message-badge {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.message-badge:hover {
  transform: scale(1.1);
}

.user-avatar {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.1);
}

/* 节气养生提示 */
.solar-term-tip {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  background: linear-gradient(135deg, #F0F7F4, #E8F0EA);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-xl);
  color: var(--primary-color);
  font-size: var(--font-size-md);
  line-height: 1.6;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.solar-term-tip .el-icon {
  font-size: var(--font-size-xl);
  color: var(--secondary-color);
  margin-top: 4px;
}

/* 体质卡片 */
.constitution-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
  position: relative;
  overflow: hidden;
}

.constitution-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.constitution-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-hover);
  border-color: var(--primary-light);
}

.card-left {
  flex: 1;
}

.constitution-type {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
  font-family: var(--font-family-serif);
}

.constitution-desc {
  color: var(--text-secondary);
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.constitution-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.info-item {
  display: flex;
  margin-bottom: var(--spacing-sm);
  align-items: flex-start;
  flex-wrap: wrap;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 600;
  color: var(--text-primary);
  margin-right: var(--spacing-sm);
  min-width: 80px;
}

.info-value {
  color: var(--text-secondary);
  line-height: 1.5;
  flex: 1;
}

.card-actions {
  display: flex;
  gap: var(--spacing-md);
}

.card-right {
  margin-left: var(--spacing-2xl);
}

.constitution-icon {
  width: 120px;
  height: 120px;
  transition: transform 0.3s ease;
}

.constitution-card:hover .constitution-icon {
  transform: scale(1.1) rotate(5deg);
}

/* 体质详细信息对话框 */
.constitution-details {
  padding: var(--spacing-lg);
}

.detail-section {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.detail-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.detail-section h4 {
  color: var(--primary-color);
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.detail-section h4::before {
  content: '•';
  color: var(--primary-color);
  font-size: var(--font-size-xl);
  font-weight: bold;
}

.detail-section p {
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: var(--font-size-md);
  margin: 0;
}

/* 功能区网格布局 */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-xl);
  margin: var(--spacing-2xl) 0;
}

.grid-item {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-md);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  border: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
  position: relative;
  overflow: hidden;
  min-height: 320px;
  display: flex;
  flex-direction: column;
}

.grid-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.grid-item:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-hover);
  border-color: var(--primary-light);
}

/* 通用标题样式 */
.section-title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  position: relative;
  font-family: var(--font-family-serif);
}

.section-title::after {
  content: '';
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, var(--primary-light), transparent);
  margin-left: var(--spacing-md);
}

/* 今日养生活动 */
.today-activities {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.activities-scroll {
  display: flex;
  gap: var(--spacing-md);
  overflow-x: auto;
  padding-bottom: var(--spacing-md);
  flex: 1;
}

.activities-scroll::-webkit-scrollbar {
  height: 6px;
}

.activities-scroll::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
}

.activities-scroll::-webkit-scrollbar-thumb {
  background: var(--primary-light);
  border-radius: var(--radius-full);
}

.activities-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}

.activity-card {
  flex: 0 0 auto;
  width: 220px;
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  background: linear-gradient(135deg, white 0%, #f8f9fa 100%);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.activity-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--secondary-color), var(--accent-color));
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.activity-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-hover);
  border-color: var(--secondary-light);
}

.activity-icon {
  width: 48px;
  height: 48px;
  margin-bottom: var(--spacing-sm);
}

.activity-title {
  font-weight: 600;
  font-size: var(--font-size-md);
  color: var(--text-primary);
}

.activity-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  flex: 1;
  line-height: 1.5;
}

/* AI 问诊入口 */
.ai-chat-entry {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-search {
  margin-bottom: var(--spacing-lg);
}

.chat-search .el-input {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.chat-search .el-input:hover {
  border-color: var(--primary-light);
  box-shadow: 0 0 0 3px rgba(74, 124, 89, 0.1);
}

.hot-questions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  flex: 1;
}

.hot-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 600;
}

.hot-tag {
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.hot-tag:hover {
  background: var(--primary-light);
  border-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

/* 养生提醒预览 */
.reminders-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.preview-header h3 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  font-family: var(--font-family-serif);
}

.reminder-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  flex: 1;
}

.reminder-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: linear-gradient(135deg, var(--bg-secondary), var(--bg-card));
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.reminder-item:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
}

.reminder-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.reminder-time {
  font-weight: 600;
  color: var(--primary-color);
  font-size: var(--font-size-md);
  min-width: 60px;
}

.reminder-title {
  font-size: var(--font-size-md);
  color: var(--text-primary);
  flex: 1;
}

.empty-reminders {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-2xl);
  color: var(--text-tertiary);
  flex: 1;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--border-color);
}

.empty-reminders .el-icon {
  font-size: 48px;
  opacity: 0.5;
}

/* 附近中医馆 */
.tcm-stores-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-header h3 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-family: var(--font-family-serif);
}

.amap-tip {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  flex: 1;
  justify-content: center;
  text-align: center;
}

.loading-stores {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xl);
  justify-content: center;
  color: var(--text-secondary);
  flex: 1;
}

.stores-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  flex: 1;
}

.store-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: linear-gradient(135deg, var(--bg-secondary), var(--bg-card));
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.store-item:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
}

.store-info {
  flex: 1;
}

.store-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.store-address {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.4;
}

.store-distance {
  font-weight: 600;
  color: var(--primary-color);
  font-size: var(--font-size-sm);
}

.empty-stores {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--text-secondary);
  flex: 1;
  justify-content: center;
}

.empty-stores .el-icon {
  font-size: 48px;
  color: var(--primary-light);
  margin-bottom: var(--spacing-md);
}

/* 快捷导航 */
.quick-nav {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-2xl);
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  margin: var(--spacing-2xl) auto;
  box-shadow: var(--shadow-md);
  max-width: 1200px;
  padding: 0 var(--spacing-lg);
}

.nav-item {
  flex: 1;
  text-align: center;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
  position: relative;
  overflow: hidden;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.nav-item:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
  border-color: var(--primary-light);
}

.nav-icon {
  width: 48px;
  height: 48px;
  margin-bottom: var(--spacing-sm);
}

.nav-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

/* 响应式布局 */
@media (max-width: 768px) {
  /* 通用布局 */
  .section-container {
    padding: 0 var(--spacing-md);
  }
  
  /* Hero区域 */
  .hero {
    padding: var(--spacing-xl);
  }
  
  .hero-content {
    padding: var(--spacing-xl) var(--spacing-md);
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-stats {
    gap: var(--spacing-lg);
  }
  
  /* 用户Dashboard */
  .user-dashboard {
    padding: var(--spacing-md);
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .header-left {
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }
  
  .solar-term-badge {
    font-size: var(--font-size-xs);
    padding: 2px 8px;
  }
  
  /* 体质卡片 */
  .constitution-card {
    flex-direction: column;
    text-align: center;
    padding: var(--spacing-lg);
  }
  
  .card-right {
    margin-left: 0;
    margin-top: var(--spacing-md);
  }
  
  .constitution-icon {
    width: 64px;
    height: 64px;
  }
  
  /* 网格布局 */
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
    padding: 0 var(--spacing-md);
  }
  
  .grid-item {
    padding: var(--spacing-lg);
  }
  
  /* 活动卡片 */
  .activities-scroll {
    gap: var(--spacing-sm);
  }
  
  .activity-card {
    width: 160px;
    padding: var(--spacing-md);
  }
  
  /* 快捷导航 */
  .quick-nav {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .nav-item {
    min-height: 100px;
  }
  
  /* 轮播控制 */
  .carousel-btn {
    width: 40px;
    height: 40px;
  }
  
  .carousel-btn .el-icon {
    font-size: 20px;
  }
  
  /* 轮播指示器 */
  .indicator {
    width: 12px;
    height: 12px;
  }
}

/* 未登录用户样式 */
.welcome-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

/* Hero Section */
.hero {
  position: relative;
  padding: var(--spacing-4xl) var(--spacing-lg);
  margin-bottom: var(--spacing-4xl);
  text-align: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-light), var(--secondary-light));
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.bg-circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.bg-circle-2 {
  width: 400px;
  height: 400px;
  bottom: -200px;
  right: -100px;
  animation-delay: 2s;
}

.bg-circle-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  right: 10%;
  animation-delay: 4s;
}

.leaf-decoration {
  position: absolute;
  color: var(--primary-light);
  opacity: 0.1;
  animation: float 8s ease-in-out infinite;
}

.leaf-1 {
  width: 100px;
  height: 100px;
  top: 20%;
  left: 5%;
  animation-delay: 0s;
  transform: rotate(15deg);
}

.leaf-2 {
  width: 150px;
  height: 150px;
  bottom: 10%;
  right: 5%;
  animation-delay: 3s;
  transform: rotate(-20deg);
}

.leaf-3 {
  width: 80px;
  height: 80px;
  top: 60%;
  left: 8%;
  animation-delay: 6s;
  transform: rotate(45deg);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.title-line {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-family-serif);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.title-line.active {
  opacity: 1;
  transform: translateY(0);
}

.fade-in-up-delay-1 {
  transition-delay: 0.2s;
}

.fade-in-up-delay-2 {
  transition-delay: 0.4s;
}

.fade-in-up-delay-3 {
  transition-delay: 0.6s;
}

.fade-in-up-delay-4 {
  transition-delay: 0.8s;
}

.hero-subtitle {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-2xl);
  line-height: 1.6;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.hero-subtitle.active {
  opacity: 1;
  transform: translateY(0);
}

.hero-actions {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: var(--spacing-3xl);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.hero-actions.active {
  opacity: 1;
  transform: translateY(0);
}

.btn-border-animated {
  position: relative;
  overflow: hidden;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
  transition: all 0.3s ease;
}

.btn-border-animated:hover {
  color: white;
  border-color: var(--primary-color);
}

.btn-border-animated::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(74, 124, 89, 0.2), transparent);
  transition: left 0.6s ease;
}

.btn-border-animated:hover::before {
  left: 100%;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: var(--spacing-2xl);
  flex-wrap: wrap;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.hero-stats.active {
  opacity: 1;
  transform: translateY(0);
}

.stat-item {
  text-align: center;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.stat-number {
  display: block;
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: var(--spacing-xs);
  font-family: var(--font-family-serif);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Features Section */
.features {
  margin-bottom: var(--spacing-4xl);
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-xl);
  margin-top: var(--spacing-2xl);
}

.feature-card {
  padding: var(--spacing-2xl);
  border-radius: var(--radius-xl);
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.feature-icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--spacing-lg);
  background: linear-gradient(135deg, var(--primary-light), var(--secondary-light));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

.feature-icon {
  font-size: var(--font-size-3xl);
}

.feature-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
  font-family: var(--font-family-serif);
}

.feature-desc {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* How It Works */
.how-it-works {
  margin-bottom: var(--spacing-4xl);
}

.steps {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
  margin-top: var(--spacing-2xl);
}

.step {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.step.active {
  opacity: 1;
  transform: translateY(0);
}

.step-number-wrapper {
  flex: 0 0 auto;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  margin-top: 4px;
}

.step-number {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: white;
  font-family: var(--font-family-serif);
}

.step-content {
  flex: 1;
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.step-content h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
  font-family: var(--font-family-serif);
}

.step-content p {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Testimonials */
.testimonials {
  margin-bottom: var(--spacing-4xl);
}

.testimonial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-xl);
  margin-top: var(--spacing-2xl);
}

.testimonial-card {
  padding: var(--spacing-2xl);
  border-radius: var(--radius-xl);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.testimonial-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--secondary-color), var(--accent-color));
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.testimonial-avatar {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.testimonial-text {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
  font-style: italic;
}

.testimonial-author {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.author-name {
  font-weight: 600;
  color: var(--text-primary);
}

.author-type {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

/* Health Tips */
.health-tips {
  margin-bottom: var(--spacing-4xl);
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-xl);
  margin-top: var(--spacing-2xl);
}

.tip-card {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.tip-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent-color), var(--primary-color));
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.tip-icon {
  flex: 0 0 auto;
  width: 64px;
  height: 64px;
  margin-top: 4px;
}

.tip-content {
  flex: 1;
}

.tip-content h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
  font-family: var(--font-family-serif);
}

.tip-content p {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  position: relative;
  padding: var(--spacing-4xl) var(--spacing-lg);
  margin-bottom: var(--spacing-4xl);
  text-align: center;
  overflow: hidden;
  background: linear-gradient(135deg, var(--bg-secondary), var(--bg-primary));
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.cta-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.bg-circle-cta-1 {
  width: 200px;
  height: 200px;
  top: -50px;
  right: -50px;
  animation: float 6s ease-in-out infinite;
  animation-delay: 0s;
}

.bg-circle-cta-2 {
  width: 300px;
  height: 300px;
  bottom: -150px;
  left: -100px;
  animation: float 6s ease-in-out infinite;
  animation-delay: 3s;
}

.cta-content {
  position: relative;
  z-index: 1;
  max-width: 600px;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.cta-content.active {
  opacity: 1;
  transform: translateY(0);
}

.cta-content h2 {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
  font-family: var(--font-family-serif);
}

.cta-content p {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-2xl);
  line-height: 1.6;
}

.cta-actions {
  display: flex;
  justify-content: center;
}

/* Disclaimer Section */
.disclaimer-section {
  margin-bottom: var(--spacing-4xl);
}

.disclaimer-card {
  padding: var(--spacing-2xl);
  border-radius: var(--radius-xl);
  display: flex;
  gap: var(--spacing-lg);
  align-items: flex-start;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.disclaimer-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #ffa726);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.disclaimer-icon {
  flex: 0 0 auto;
  font-size: var(--font-size-2xl);
  margin-top: 4px;
}

.disclaimer-content {
  flex: 1;
}

.disclaimer-content h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
  font-family: var(--font-family-serif);
}

.disclaimer-content p {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 通用动画类 */
.fade-in-up {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.fade-in-up.active {
  opacity: 1;
  transform: translateY(0);
}

.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

/* 玻璃效果 */
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb {
  background: var(--primary-light);
  border-radius: var(--radius-full);
  transition: background 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}

/* 加载动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.loading {
  animation: pulse 1.5s ease-in-out infinite;
}

/* 响应式调整 */
@media (max-width: 768px) {
  /* 通用布局 */
  .section-container {
    padding: 0 var(--spacing-md);
  }
  
  /* Hero区域 */
  .hero {
    padding: var(--spacing-xl);
  }
  
  .hero-content {
    padding: var(--spacing-xl) var(--spacing-md);
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-stats {
    gap: var(--spacing-lg);
  }
  
  /* 功能区 */
  .feature-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .feature-card {
    padding: var(--spacing-lg);
  }
  
  /* 步骤区 */
  .step {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .step-number-wrapper {
    margin-top: 0;
  }
  
  /* 推荐语 */
  .testimonial-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  /* 养生小贴士 */
  .tips-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .tip-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  /* CTA区域 */
  .cta-section {
    padding: var(--spacing-2xl);
  }
  
  /* 免责声明 */
  .disclaimer-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  /* 通用卡片 */
  .glass {
    background: rgba(255, 255, 255, 0.9);
  }
}
</style>