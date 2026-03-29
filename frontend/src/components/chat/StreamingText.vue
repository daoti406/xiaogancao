<template>
  <div class="streaming-text" v-html="renderedContent"></div>
</template>

<script setup>
import { computed } from 'vue';
import { marked } from 'marked';

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  isStreaming: {
    type: Boolean,
    default: false
  }
});

// 配置marked选项
marked.setOptions({
  breaks: true,
  gfm: true
});

const renderedContent = computed(() => {
  if (!props.content) return '';
  
  try {
    return marked.parse(props.content);
  } catch (e) {
    return props.content;
  }
});
</script>

<style scoped>
.streaming-text {
  line-height: 1.8;
  word-wrap: break-word;
}

.streaming-text :deep(h1),
.streaming-text :deep(h2),
.streaming-text :deep(h3),
.streaming-text :deep(h4),
.streaming-text :deep(h5),
.streaming-text :deep(h6) {
  margin-top: 16px;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

.streaming-text :deep(p) {
  margin-bottom: 12px;
}

.streaming-text :deep(ul),
.streaming-text :deep(ol) {
  padding-left: 20px;
  margin-bottom: 12px;
}

.streaming-text :deep(li) {
  margin-bottom: 4px;
}

.streaming-text :deep(strong) {
  font-weight: 600;
  color: var(--text-primary);
}

.streaming-text :deep(code) {
  background: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-family: monospace;
  font-size: 0.9em;
}

.streaming-text :deep(pre) {
  background: var(--bg-secondary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin-bottom: var(--spacing-md);
}

.streaming-text :deep(pre code) {
  background: transparent;
  padding: 0;
}

.streaming-text :deep(blockquote) {
  border-left: 3px solid var(--primary-color);
  padding-left: var(--spacing-md);
  margin: var(--spacing-md) 0;
  color: var(--text-secondary);
}

.streaming-text :deep(a) {
  color: var(--primary-color);
}

.streaming-text :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--spacing-md);
}

.streaming-text :deep(th),
.streaming-text :deep(td) {
  border: 1px solid var(--border-color);
  padding: var(--spacing-sm);
  text-align: left;
}

.streaming-text :deep(th) {
  background: var(--bg-secondary);
  font-weight: 600;
}

.streaming-text :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: var(--spacing-lg) 0;
}
</style>
