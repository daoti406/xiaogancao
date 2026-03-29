import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';

import App from './App.vue';
import router from './router';

// 导入全局样式
import './styles/variables.css';
import './styles/global.css';
import './styles/animations.css';

const app = createApp(App);

// 使用Pinia状态管理
const pinia = createPinia();
app.use(pinia);

// 使用Element Plus
app.use(ElementPlus, {
  locale: zhCn
});

// 使用路由
app.use(router);

// 挂载应用
app.mount('#app');
