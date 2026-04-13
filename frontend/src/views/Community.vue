<template>
  <div class="community-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">养生社区</h1>
          <p class="page-subtitle">与志同道合的朋友分享养生心得，交流中医智慧</p>
        </div>
        <el-button type="primary" size="large" @click="showCreatePost" class="create-btn">
          <el-icon><Plus /></el-icon>
          发布帖子
        </el-button>
      </div>
    </div>

    <!-- 分类筛选 -->
    <div class="category-filter">
      <el-button
        v-for="category in categories"
        :key="category.value"
        :type="selectedCategory === category.value ? 'primary' : 'default'"
        @click="selectCategory(category.value)"
        class="category-btn"
      >
        <span class="category-icon">{{ category.icon }}</span>
        {{ category.label }}
      </el-button>
    </div>

    <!-- 帖子列表 -->
    <div class="posts-container">
      <div class="posts-list">
        <div
          v-for="post in filteredPosts"
          :key="post.id"
          class="post-card"
          @click="viewPost(post.id)"
        >
          <div class="post-header">
            <div class="author-info">
              <el-avatar :size="40" class="author-avatar">
                {{ post.author.charAt(0) }}
              </el-avatar>
              <div class="author-details">
                <span class="author-name">{{ post.author }}</span>
                <span class="post-time">{{ formatTime(post.created_at) }}</span>
              </div>
            </div>
            <el-tag :type="getCategoryType(post.category)" size="small">
              {{ getCategoryLabel(post.category) }}
            </el-tag>
          </div>

          <h3 class="post-title">{{ post.title }}</h3>
          <p class="post-content">{{ post.content }}</p>

          <div class="post-images" v-if="post.images && post.images.length > 0">
            <img
              v-for="(img, index) in post.images.slice(0, 3)"
              :key="index"
              :src="img"
              class="post-image"
              alt=""
            />
            <div v-if="post.images.length > 3" class="more-images">
              +{{ post.images.length - 3 }}
            </div>
          </div>

          <div class="post-footer">
            <div class="post-stats">
              <span class="stat-item">
                <el-icon><View /></el-icon>
                {{ post.views }}
              </span>
              <span class="stat-item">
                <el-icon><ChatDotRound /></el-icon>
                {{ post.comments_count }}
              </span>
              <span class="stat-item">
                <el-icon><Star /></el-icon>
                {{ post.likes }}
              </span>
            </div>
            <div class="post-actions">
              <el-button text size="small" @click.stop="likePost(post)">
                <el-icon><Star /></el-icon>
                点赞
              </el-button>
              <el-button text size="small" @click.stop="sharePost(post)">
                <el-icon><Share /></el-icon>
                分享
              </el-button>
            </div>
          </div>
        </div>

        <div class="empty-state" v-if="filteredPosts.length === 0">
          <div class="empty-content">
            <span class="empty-icon">💬</span>
            <h3>暂无帖子</h3>
            <p>成为第一个分享养生心得的人吧！</p>
          </div>
        </div>
      </div>

      <!-- 热门话题 -->
      <div class="sidebar">
        <div class="sidebar-card">
          <h4 class="sidebar-title">🔥 热门话题</h4>
          <div class="hot-topics">
            <div
              v-for="topic in hotTopics"
              :key="topic.id"
              class="topic-item"
              @click="searchByTopic(topic.name)"
            >
              <span class="topic-rank">{{ topic.rank }}</span>
              <span class="topic-name">{{ topic.name }}</span>
              <span class="topic-count">{{ topic.count }}帖</span>
            </div>
          </div>
        </div>

        <div class="sidebar-card">
          <h4 class="sidebar-title">🏆 活跃用户</h4>
          <div class="active-users">
            <div
              v-for="user in activeUsers"
              :key="user.id"
              class="user-item"
            >
              <el-avatar :size="32">{{ user.name.charAt(0) }}</el-avatar>
              <span class="user-name">{{ user.name }}</span>
              <span class="user-posts">{{ user.posts }}帖</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 发帖对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="发布新帖子"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="postFormRef"
        :model="postForm"
        :rules="postFormRules"
        label-width="80px"
      >
        <el-form-item label="分类" prop="category">
          <el-select v-model="postForm.category" placeholder="选择分类">
            <el-option
              v-for="category in categories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            >
              <span class="category-icon">{{ category.icon }}</span>
              {{ category.label }}
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input
            v-model="postForm.title"
            placeholder="请输入帖子标题"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input
            v-model="postForm.content"
            type="textarea"
            :rows="6"
            placeholder="分享您的养生心得、疑问或经验..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="图片">
          <el-upload
            v-model:file-list="postForm.images"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :limit="3"
            accept="image/*"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPost" :loading="submitting">
          发布
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Plus, View, ChatDotRound, Star, Share } from '@element-plus/icons-vue';

const router = useRouter();

const selectedCategory = ref('all');
const createDialogVisible = ref(false);
const submitting = ref(false);
const postFormRef = ref(null);

const postForm = ref({
  category: '',
  title: '',
  content: '',
  images: []
});

const postFormRules = {
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 5, max: 50, message: '标题长度在5-50个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 10, max: 500, message: '内容长度在10-500个字符', trigger: 'blur' }
  ]
};

const categories = [
  { value: 'all', label: '全部', icon: '📋' },
  { value: 'diet', label: '饮食养生', icon: '🍵' },
  { value: 'exercise', label: '运动健身', icon: '🏃' },
  { value: 'acupoint', label: '穴位按摩', icon: '📍' },
  { value: 'emotion', label: '情志调养', icon: '😊' },
  { value: 'seasonal', label: '时令养生', icon: '🌸' },
  { value: 'experience', label: '经验分享', icon: '💡' },
  { value: 'question', label: '疑问求助', icon: '❓' }
];

const posts = ref([
  {
    id: 1,
    author: '张阿姨',
    created_at: new Date(Date.now() - 3600000 * 2),
    title: '春季养肝护肝的小妙招',
    content: '春天是养肝的好时节，分享几个我常用的养肝方法：1. 早起喝一杯温水；2. 多吃绿色蔬菜；3. 保持心情舒畅；4. 适当运动。坚持了一个月，感觉精神状态好多了！',
    category: 'seasonal',
    images: [],
    views: 156,
    comments_count: 23,
    likes: 45
  },
  {
    id: 2,
    author: '李先生',
    created_at: new Date(Date.now() - 3600000 * 5),
    title: '气虚体质的调理心得',
    content: '我是气虚体质，平时容易疲劳。经过中医调理后，现在每天坚持：1. 太极拳30分钟；2. 按摩足三里穴；3. 喝黄芪茶。效果很明显，推荐给大家！',
    category: 'experience',
    images: [],
    views: 234,
    comments_count: 45,
    likes: 67
  },
  {
    id: 3,
    author: '王女士',
    created_at: new Date(Date.now() - 3600000 * 8),
    title: '请问阳虚体质适合喝什么茶？',
    content: '最近感觉手脚冰凉，可能是阳虚体质。想请教大家，阳虚体质适合喝什么养生茶？有没有好的推荐？',
    category: 'question',
    images: [],
    views: 89,
    comments_count: 12,
    likes: 8
  },
  {
    id: 4,
    author: '陈医生',
    created_at: new Date(Date.now() - 3600000 * 12),
    title: '夏季养生的注意事项',
    content: '夏季阳气最盛，也是养生的关键时期。1. 饮食宜清淡，多喝绿豆汤；2. 避免过度贪凉；3. 适当午休；4. 保持心情平和。这些方法简单易行，效果显著。',
    category: 'seasonal',
    images: [],
    views: 312,
    comments_count: 56,
    likes: 89
  },
  {
    id: 5,
    author: '刘老师',
    created_at: new Date(Date.now() - 3600000 * 24),
    title: '八段锦练习心得',
    content: '坚持练习八段锦半年了，分享一下我的心得：1. 动作要标准；2. 配合呼吸；3. 持之以恒。现在感觉身体轻盈，睡眠质量也提高了。推荐大家试试！',
    category: 'exercise',
    images: [],
    views: 178,
    comments_count: 34,
    likes: 52
  }
]);

const hotTopics = ref([
  { id: 1, rank: 1, name: '春季养生', count: 156 },
  { id: 2, rank: 2, name: '气虚体质', count: 134 },
  { id: 3, rank: 3, name: '穴位按摩', count: 98 },
  { id: 4, rank: 4, name: '养生茶饮', count: 87 },
  { id: 5, rank: 5, name: '八段锦', count: 65 }
]);

const activeUsers = ref([
  { id: 1, name: '陈医生', posts: 23 },
  { id: 2, name: '张阿姨', posts: 18 },
  { id: 3, name: '李先生', posts: 15 },
  { id: 4, name: '王女士', posts: 12 },
  { id: 5, name: '刘老师', posts: 10 }
]);

const filteredPosts = computed(() => {
  if (selectedCategory.value === 'all') {
    return posts.value;
  }
  return posts.value.filter(post => post.category === selectedCategory.value);
});

const selectCategory = (category) => {
  selectedCategory.value = category;
};

const showCreatePost = () => {
  createDialogVisible.value = true;
};

const viewPost = (id) => {
  router.push(`/community/post/${id}`);
};

const likePost = (post) => {
  post.likes++;
  ElMessage.success('点赞成功！');
};

const sharePost = (post) => {
  ElMessage.success('分享链接已复制到剪贴板！');
};

const searchByTopic = (topic) => {
  ElMessage.info(`正在搜索话题：${topic}`);
};

const submitPost = async () => {
  if (!postFormRef.value) return;

  await postFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        const newPost = {
          id: posts.value.length + 1,
          author: '我',
          created_at: new Date(),
          title: postForm.value.title,
          content: postForm.value.content,
          category: postForm.value.category,
          images: [],
          views: 0,
          comments_count: 0,
          likes: 0
        };
        posts.value.unshift(newPost);
        createDialogVisible.value = false;
        resetForm();
        ElMessage.success('发布成功！');
      } catch (error) {
        ElMessage.error('发布失败，请重试');
      } finally {
        submitting.value = false;
      }
    }
  });
};

const resetForm = () => {
  postForm.value = {
    category: '',
    title: '',
    content: '',
    images: []
  };
  if (postFormRef.value) {
    postFormRef.value.clearValidate();
  }
};

const formatTime = (date) => {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString();
};

const getCategoryLabel = (category) => {
  const cat = categories.find(c => c.value === category);
  return cat ? cat.label : category;
};

const getCategoryType = (category) => {
  const types = {
    diet: 'success',
    exercise: 'primary',
    acupoint: 'warning',
    emotion: 'info',
    seasonal: 'danger',
    experience: 'success',
    question: 'warning'
  };
  return types[category] || 'info';
};

onMounted(() => {
  console.log('社区页面已加载');
});
</script>

<style scoped>
.community-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: var(--spacing-xl) 0;
}

.page-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  padding: var(--spacing-2xl) var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 400px;
  height: 400px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
  color: white;
}

.page-subtitle {
  font-size: var(--font-size-lg);
  opacity: 0.9;
  margin: 0;
}

.create-btn {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-lg);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.category-filter {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0 auto var(--spacing-xl);
  padding: 0 var(--spacing-lg);
}

.category-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  border-radius: var(--radius-full);
  padding: var(--spacing-sm) var(--spacing-lg);
  transition: all 0.3s ease;
}

.category-icon {
  font-size: var(--font-size-lg);
}

.posts-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.post-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.post-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
  border-color: var(--primary-light);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.author-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.author-avatar {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  font-weight: 600;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-size-md);
}

.post-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.post-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  line-height: var(--line-height-tight);
}

.post-content {
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-md);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-images {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.post-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.post-image:hover {
  transform: scale(1.05);
}

.more-images {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: var(--radius-md);
  font-weight: 600;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.post-stats {
  display: flex;
  gap: var(--spacing-lg);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.post-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-2xl);
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  border: 2px dashed var(--border-color);
}

.empty-content {
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-lg);
}

.empty-content h3 {
  font-size: var(--font-size-xl);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.empty-content p {
  color: var(--text-tertiary);
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.sidebar-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
}

.sidebar-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--primary-color);
}

.hot-topics {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.topic-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.topic-item:hover {
  background: var(--bg-secondary);
  transform: translateX(4px);
}

.topic-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.topic-name {
  flex: 1;
  color: var(--text-primary);
  font-weight: 500;
}

.topic-count {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.active-users {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.user-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.user-item:hover {
  background: var(--bg-secondary);
  transform: translateX(4px);
}

.user-name {
  flex: 1;
  color: var(--text-primary);
  font-weight: 500;
}

.user-posts {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .posts-container {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: -1;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .page-title {
    font-size: 1.5rem;
  }

  .category-filter {
    gap: var(--spacing-sm);
  }

  .category-btn {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-sm);
  }
}
</style>