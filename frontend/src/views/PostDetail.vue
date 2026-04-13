<template>
  <div class="post-detail-page">
    <div class="back-btn" @click="goBack">
      <el-icon><ArrowLeft /></el-icon>
      返回社区
    </div>

    <div class="detail-container" v-if="post">
      <div class="main-content">
        <div class="post-card">
          <div class="post-header">
            <div class="author-info">
              <el-avatar :size="48" class="author-avatar">
                {{ post.author.charAt(0) }}
              </el-avatar>
              <div class="author-details">
                <span class="author-name">{{ post.author }}</span>
                <span class="post-time">{{ formatTime(post.created_at) }}</span>
              </div>
            </div>
            <el-tag :type="getCategoryType(post.category)" size="large">
              {{ getCategoryLabel(post.category) }}
            </el-tag>
          </div>

          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-content">{{ post.content }}</div>

          <div class="post-images" v-if="post.images && post.images.length > 0">
            <img
              v-for="(img, index) in post.images"
              :key="index"
              :src="img"
              class="post-image"
              alt=""
              @click="previewImage(img)"
            />
          </div>

          <div class="post-stats">
            <div class="stat-item">
              <el-icon><View /></el-icon>
              <span>{{ post.views }}</span>
              <span class="stat-label">浏览</span>
            </div>
            <div class="stat-item">
              <el-icon><ChatDotRound /></el-icon>
              <span>{{ post.comments_count }}</span>
              <span class="stat-label">评论</span>
            </div>
            <div class="stat-item">
              <el-icon><Star /></el-icon>
              <span>{{ post.likes }}</span>
              <span class="stat-label">点赞</span>
            </div>
          </div>

          <div class="post-actions">
            <el-button type="primary" @click="likePost" :class="{ 'liked': isLiked }">
              <el-icon><Star /></el-icon>
              {{ isLiked ? '已点赞' : '点赞' }}
            </el-button>
            <el-button @click="sharePost">
              <el-icon><Share /></el-icon>
              分享
            </el-button>
            <el-button @click="followAuthor" v-if="!isFollowing">
              <el-icon><Plus /></el-icon>
              关注作者
            </el-button>
          </div>
        </div>

        <div class="comments-section">
          <div class="comments-header">
            <h3>评论 ({{ comments.length }})</h3>
          </div>

          <div class="comment-form">
            <el-input
              v-model="newComment"
              type="textarea"
              :rows="3"
              placeholder="写下您的评论..."
              maxlength="200"
              show-word-limit
            />
            <div class="comment-actions">
              <el-button type="primary" @click="submitComment" :loading="submitting">
                发表评论
              </el-button>
            </div>
          </div>

          <div class="comments-list">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="comment-item"
            >
              <el-avatar :size="36" class="comment-avatar">
                {{ comment.author.charAt(0) }}
              </el-avatar>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.author }}</span>
                  <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
                </div>
                <p class="comment-text">{{ comment.content }}</p>
                <div class="comment-actions">
                  <el-button text size="small" @click="replyComment(comment)">
                    <el-icon><ChatDotRound /></el-icon>
                    回复
                  </el-button>
                  <el-button text size="small" @click="likeComment(comment)">
                    <el-icon><Star /></el-icon>
                    {{ comment.likes }}
                  </el-button>
                </div>

                <div v-if="comment.replies && comment.replies.length > 0" class="replies">
                  <div
                    v-for="reply in comment.replies"
                    :key="reply.id"
                    class="reply-item"
                  >
                    <el-avatar :size="28" class="reply-avatar">
                      {{ reply.author.charAt(0) }}
                    </el-avatar>
                    <div class="reply-content">
                      <div class="reply-header">
                        <span class="reply-author">{{ reply.author }}</span>
                        <span class="reply-time">{{ formatTime(reply.created_at) }}</span>
                      </div>
                      <p class="reply-text">{{ reply.content }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="empty-comments" v-if="comments.length === 0">
              <span class="empty-icon">💬</span>
              <p>暂无评论，快来发表第一条评论吧！</p>
            </div>
          </div>
        </div>
      </div>

      <div class="sidebar">
        <div class="sidebar-card">
          <h4 class="sidebar-title">相关帖子</h4>
          <div class="related-posts">
            <div
              v-for="related in relatedPosts"
              :key="related.id"
              class="related-post-item"
              @click="viewPost(related.id)"
            >
              <h5>{{ related.title }}</h5>
              <div class="related-meta">
                <span>{{ related.author }}</span>
                <span>{{ related.comments_count }}评论</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-card">
          <h4 class="sidebar-title">热门话题</h4>
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
      </div>
    </div>

    <div class="loading-state" v-else>
      <el-icon class="is-loading"><Loading /></el-icon>
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, View, ChatDotRound, Star, Share, Plus, Loading } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();

const post = ref(null);
const comments = ref([]);
const newComment = ref('');
const submitting = ref(false);
const isLiked = ref(false);
const isFollowing = ref(false);

const relatedPosts = ref([
  { id: 2, title: '气虚体质的调理心得', author: '李先生', comments_count: 45 },
  { id: 4, title: '夏季养生的注意事项', author: '陈医生', comments_count: 56 },
  { id: 5, title: '八段锦练习心得', author: '刘老师', comments_count: 34 }
]);

const hotTopics = ref([
  { id: 1, rank: 1, name: '春季养生', count: 156 },
  { id: 2, rank: 2, name: '气虚体质', count: 134 },
  { id: 3, rank: 3, name: '穴位按摩', count: 98 }
]);

const loadPost = () => {
  const postId = route.params.id;
  const mockPosts = [
    {
      id: 1,
      author: '张阿姨',
      created_at: new Date(Date.now() - 3600000 * 2),
      title: '春季养肝护肝的小妙招',
      content: '春天是养肝的好时节，分享几个我常用的养肝方法：\n\n1. 早起喝一杯温水：清晨起床后，先喝一杯温开水，可以帮助肝脏排毒，促进新陈代谢。\n\n2. 多吃绿色蔬菜：春季应季蔬菜如菠菜、芹菜、韭菜等，都是养肝的好食材。\n\n3. 保持心情舒畅：肝主疏泄，情绪舒畅对肝脏健康非常重要。建议多到户外活动，呼吸新鲜空气。\n\n4. 适当运动：春季适合做一些舒缓的运动，如太极、散步、八段锦等，有助于气血运行。\n\n坚持了一个月，感觉精神状态好多了，睡眠质量也提高了！',
      category: 'seasonal',
      images: [],
      views: 156,
      comments_count: 23,
      likes: 45
    }
  ];

  post.value = mockPosts.find(p => p.id === parseInt(postId)) || mockPosts[0];
  post.value.views++;
};

const loadComments = () => {
  comments.value = [
    {
      id: 1,
      author: '李医生',
      created_at: new Date(Date.now() - 3600000),
      content: '张阿姨分享的养肝方法很实用，特别是早起喝温水这一点，很多人容易忽略。建议可以加一点蜂蜜，效果更好。',
      likes: 12,
      replies: [
        {
          id: 11,
          author: '张阿姨',
          created_at: new Date(Date.now() - 1800000),
          content: '谢谢李医生的建议！我试试加蜂蜜。'
        }
      ]
    },
    {
      id: 2,
      author: '王女士',
      created_at: new Date(Date.now() - 7200000),
      content: '我也在养肝，除了张阿姨提到的方法，我还会按揉太冲穴，效果也不错。',
      likes: 8,
      replies: []
    },
    {
      id: 3,
      author: '陈先生',
      created_at: new Date(Date.now() - 10800000),
      content: '请问太极和八段锦哪个更适合养肝？',
      likes: 3,
      replies: [
        {
          id: 31,
          author: '刘老师',
          created_at: new Date(Date.now() - 5400000),
          content: '两者都很好，太极更注重内在的调息，八段锦更注重外在的动作。建议可以都试试，选择自己喜欢的。'
        }
      ]
    }
  ];
};

const goBack = () => {
  router.push('/community');
};

const likePost = () => {
  isLiked.value = !isLiked.value;
  if (isLiked.value) {
    post.value.likes++;
    ElMessage.success('点赞成功！');
  } else {
    post.value.likes--;
  }
};

const sharePost = () => {
  ElMessage.success('分享链接已复制到剪贴板！');
};

const followAuthor = () => {
  isFollowing.value = true;
  ElMessage.success('关注成功！');
};

const submitComment = () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容');
    return;
  }

  submitting.value = true;
  setTimeout(() => {
    const comment = {
      id: comments.value.length + 1,
      author: '我',
      created_at: new Date(),
      content: newComment.value,
      likes: 0,
      replies: []
    };
    comments.value.unshift(comment);
    post.value.comments_count++;
    newComment.value = '';
    submitting.value = false;
    ElMessage.success('评论发表成功！');
  }, 1000);
};

const replyComment = (comment) => {
  newComment.value = `@${comment.author} `;
};

const likeComment = (comment) => {
  comment.likes++;
  ElMessage.success('点赞成功！');
};

const viewPost = (id) => {
  router.push(`/community/post/${id}`);
};

const searchByTopic = (topic) => {
  ElMessage.info(`正在搜索话题：${topic}`);
};

const previewImage = (img) => {
  ElMessage.info('图片预览功能');
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
  const categories = {
    diet: '饮食养生',
    exercise: '运动健身',
    acupoint: '穴位按摩',
    emotion: '情志调养',
    seasonal: '时令养生',
    experience: '经验分享',
    question: '疑问求助'
  };
  return categories[category] || category;
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
  loadPost();
  loadComments();
});
</script>

<style scoped>
.post-detail-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: var(--spacing-xl) 0;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  margin-bottom: var(--spacing-lg);
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.back-btn:hover {
  background: var(--bg-secondary);
  transform: translateX(-4px);
}

.detail-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.post-card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
  position: relative;
  overflow: hidden;
}

.post-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.author-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.author-avatar {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  font-weight: 600;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-size-lg);
}

.post-time {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.post-title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  line-height: var(--line-height-tight);
}

.post-content {
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
  font-size: var(--font-size-lg);
  white-space: pre-wrap;
  margin-bottom: var(--spacing-lg);
}

.post-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.post-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.post-image:hover {
  transform: scale(1.05);
}

.post-stats {
  display: flex;
  gap: var(--spacing-xl);
  padding: var(--spacing-lg) 0;
  margin-bottom: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
  font-size: var(--font-size-md);
}

.stat-label {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.post-actions {
  display: flex;
  gap: var(--spacing-md);
}

.post-actions .el-button {
  flex: 1;
}

.post-actions .el-button.liked {
  background: var(--secondary-color);
  color: white;
}

.comments-section {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
}

.comments-header {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--primary-color);
}

.comments-header h3 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
}

.comment-form {
  margin-bottom: var(--spacing-xl);
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-md);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.comment-item {
  display: flex;
  gap: var(--spacing-md);
}

.comment-avatar {
  background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
  color: white;
  font-weight: 600;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  background: var(--bg-secondary);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.comment-author {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-size-md);
}

.comment-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.comment-text {
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-sm);
}

.comment-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.replies {
  margin-top: var(--spacing-md);
  padding-left: var(--spacing-lg);
  border-left: 2px solid var(--border-color);
}

.reply-item {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.reply-avatar {
  background: linear-gradient(135deg, var(--secondary-light), var(--secondary-color));
  color: white;
  font-weight: 600;
  flex-shrink: 0;
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.reply-author {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.reply-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.reply-text {
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
  font-size: var(--font-size-sm);
}

.empty-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-2xl);
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-lg);
}

.empty-comments p {
  color: var(--text-tertiary);
  font-size: var(--font-size-md);
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

.related-posts {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.related-post-item {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.related-post-item:hover {
  background: var(--bg-secondary);
  transform: translateX(4px);
}

.related-post-item h5 {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.related-meta {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  gap: var(--spacing-md);
}

.loading-state .el-icon {
  font-size: 48px;
  color: var(--primary-color);
}

.loading-state p {
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .detail-container {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: -1;
  }

  .post-title {
    font-size: 1.5rem;
  }

  .post-content {
    font-size: var(--font-size-md);
  }
}
</style>