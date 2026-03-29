<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-main">
        <div class="footer-brand">
          <div class="brand-logo">
            <img :src="logoSrc" alt="小甘草" class="logo-img" />
          </div>
          <p class="brand-desc">您的中医养生AI助手</p>
        </div>

        <div class="footer-links">
          <div class="link-group">
            <h4>产品</h4>
            <a href="#">体质辨识</a>
            <a href="#">智能问诊</a>
            <a href="#">养生方案</a>
          </div>
          <div class="link-group">
            <h4>关于</h4>
            <a href="#">关于我们</a>
            <a href="#">使用条款</a>
            <a href="#">隐私政策</a>
          </div>
          <div class="link-group">
            <h4>帮助</h4>
            <a href="#">使用指南</a>
            <a href="#">常见问题</a>
            <a href="#">联系我们</a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="disclaimer">
          ⚠️ 免责声明：本平台提供的养生建议仅供参考，不构成医疗诊断或处方。如有身体不适，请及时就医。
        </p>
        <p class="copyright">
          © {{ currentYear }} 小甘草—AI中医养生顾问. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import logoSrc from '@/assets/title-logo.png';

const currentYear = new Date().getFullYear();
</script>

<style scoped>
.footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.footer-container {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
}

.footer-main {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
}

.footer-brand {
  max-width: 280px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--primary-color);
}

.brand-desc {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.footer-links {
  display: flex;
  gap: var(--spacing-2xl);
}

.link-group h4 {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.link-group a {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  transition: color var(--transition-fast);
}

.link-group a:hover {
  color: var(--primary-color);
}

.footer-bottom {
  border-top: 1px solid var(--border-color);
  padding-top: var(--spacing-lg);
  text-align: center;
}

.disclaimer {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-sm);
}

.copyright {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

@media (max-width: 768px) {
  .footer-main {
    flex-direction: column;
    gap: var(--spacing-xl);
  }

  .footer-links {
    flex-wrap: wrap;
    gap: var(--spacing-lg);
  }
}
</style>
