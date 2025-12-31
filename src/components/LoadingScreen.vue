<template>
  <div class="loading-screen" :class="{ fullscreen }">
    <div class="loading-content">
      <div class="loading-logo">FG_LAB</div>
      <div class="loading-bar">
        <div class="loading-progress"></div>
      </div>
      <div class="loading-text">{{ text }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  fullscreen: { type: Boolean, default: false },
  minDuration: { type: Number, default: 1000 }
})

const emit = defineEmits(['loaded'])
const text = ref('INITIALIZING SYSTEM...')

onMounted(() => {
  const start = Date.now()
  setTimeout(() => {
    text.value = 'LOADING RESOURCES...'
  }, 300)
  
  // 确保至少显示 minDuration
  setTimeout(() => {
    emit('loaded')
  }, props.minDuration)
})
</script>

<style scoped>
.loading-screen {
  width: 100%;
  height: 100%;
  background: #0d1117;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-screen.fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
}

.loading-content {
  text-align: center;
}

.loading-logo {
  font-family: 'JetBrains Mono', monospace;
  font-size: 32px;
  font-weight: bold;
  color: #58a6ff;
  margin-bottom: 24px;
  letter-spacing: 4px;
}

.loading-bar {
  width: 200px;
  height: 4px;
  background: #21262d;
  margin: 0 auto 16px;
  overflow: hidden;
}

.loading-progress {
  height: 100%;
  background: #58a6ff;
  animation: progress 1s ease-in-out infinite;
}

.loading-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #8b949e;
  letter-spacing: 2px;
}

@keyframes progress {
  0% { width: 0; margin-left: 0; }
  50% { width: 60%; margin-left: 20%; }
  100% { width: 0; margin-left: 100%; }
}
</style>
