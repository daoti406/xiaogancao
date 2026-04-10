import { createRouter, createWebHistory } from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useAuthStore } from '@/stores/auth';
import { getToken } from '@/utils/storage';

// 配置 NProgress
NProgress.configure({ showSpinner: false, trickleSpeed: 200 });

// 页面组件
const Home = () => import('@/views/Home.vue');
const Auth = () => import('@/views/Auth.vue');
const Constitution = () => import('@/views/Constitution.vue');
const ConstitutionReport = () => import('@/views/ConstitutionReport.vue');
const Chat = () => import('@/views/Chat.vue');
const HealthProfile = () => import('@/views/HealthProfile.vue');
const WellnessPlan = () => import('@/views/WellnessPlan.vue');
const Reminders = () => import('@/views/Reminders.vue');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth,
    meta: { title: '登录', guest: true }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('@/views/AuthCallback.vue'),
    meta: { title: '登录中...' }
  },
  {
    path: '/constitution',
    name: 'Constitution',
    component: Constitution,
    meta: { title: '体质辨识', requiresAuth: true }
  },
  {
    path: '/constitution/report',
    name: 'ConstitutionReport',
    component: ConstitutionReport,
    meta: { title: '体质报告', requiresAuth: true }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
    meta: { title: '智能问诊', requiresAuth: true }
  },
  {
    path: '/chat/:sessionId',
    name: 'ChatSession',
    component: Chat,
    meta: { title: '对话详情', requiresAuth: true }
  },
  {
    path: '/health',
    name: 'HealthProfile',
    component: HealthProfile,
    meta: { title: '健康档案', requiresAuth: true }
  },
  {
    path: '/wellness',
    name: 'WellnessPlan',
    component: WellnessPlan,
    meta: { title: '养生方案', requiresAuth: true }
  },
  {
    path: '/reminders',
    name: 'Reminders',
    component: Reminders,
    meta: { title: '提醒管理', requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面不存在' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  }
});

// 防止无限重定向的计数器
let redirectCount = 0;
const MAX_REDIRECTS = 5;

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 启动进度条
  NProgress.start();

  // 设置页面标题
  document.title = `${to.meta.title || '小甘草'} - AI中医养生顾问`;

  const token = getToken();

  // 需要认证的页面
  if (to.meta.requiresAuth) {
    if (!token) {
      // 未登录，重定向到登录页
      redirectCount++;
      if (redirectCount > MAX_REDIRECTS) {
        console.error('检测到无限重定向，重置计数器并停止');
        redirectCount = 0;
        next({ path: '/auth' });
        return;
      }
      next({
        path: '/auth',
        query: { redirect: to.fullPath }
      });
      return;
    }

    // 验证登录状态
    const authStore = useAuthStore();
    if (!authStore.user) {
      try {
        await authStore.fetchCurrentUser();
      } catch (error) {
        // token无效，重置计数器后重定向
        redirectCount = 0;
        next({
          path: '/auth',
          query: { redirect: to.fullPath }
        });
        return;
      }
    }
  }

  // 已登录用户访问guest页面，重定向到首页
  if (to.meta.guest && token) {
    next('/');
    return;
  }

  // 成功的导航，重置计数器
  redirectCount = 0;
  next();
});

router.afterEach(() => {
  // 结束进度条
  NProgress.done();
});

export default router;
