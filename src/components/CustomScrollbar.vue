<template>
  <div class="custom-scrollbar" :style="containerStyle">
    <div class="scrollbar-content" ref="contentRef">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  maxHeight: {
    type: String,
    default: 'auto'
  },
  height: {
    type: String,
    default: 'auto'
  }
})

const contentRef = ref(null)

const containerStyle = computed(() => ({
  maxHeight: props.maxHeight,
  height: props.height
}))

// 暴露内容区域ref供父组件使用
defineExpose({
  contentRef
})
</script>

<style scoped>
.custom-scrollbar {
  overflow: hidden;
  position: relative;
  height: 100%;
  min-height: 0; /* 重要：允许在 flex 容器中收缩 */
}

.scrollbar-content {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #30363d #0d1117;
}

/* Webkit 浏览器滚动条样式 */
.scrollbar-content::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-content::-webkit-scrollbar-track {
  background: #0d1117;
  border-left: 1px solid #21262d;
}

.scrollbar-content::-webkit-scrollbar-thumb {
  background: #30363d;
  border-radius: 3px;
  transition: background 0.2s;
}

.scrollbar-content::-webkit-scrollbar-thumb:hover {
  background: #484f58;
}

.scrollbar-content::-webkit-scrollbar-thumb:active {
  background: #58a6ff;
}

/* 滚动条角落 */
.scrollbar-content::-webkit-scrollbar-corner {
  background: #0d1117;
}
</style>
