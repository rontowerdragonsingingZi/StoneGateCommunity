<template>
  <Teleport to="body">
    <div v-if="visible" class="confirm-overlay" @click.self="handleCancel">
      <div class="confirm-dialog" :class="type">
        <div class="confirm-title">
          > {{ title }}<span class="blink">_</span>
        </div>
        <div class="confirm-content">
          <slot>
            <p v-for="(line, i) in contentLines" :key="i">{{ line }}</p>
          </slot>
        </div>
        <div class="confirm-actions">
          <button class="term-btn" @click="handleCancel">[ {{ cancelText }} ]</button>
          <button 
            class="term-btn" 
            :class="type" 
            @click="handleConfirm" 
            :disabled="loading"
          >
            [ {{ loading ? loadingText : confirmText }} ]
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'CONFIRM OPERATION'
  },
  content: {
    type: [String, Array],
    default: ''
  },
  type: {
    type: String,
    default: 'warning', // 'warning' | 'danger' | 'info'
    validator: (v) => ['warning', 'danger', 'info'].includes(v)
  },
  confirmText: {
    type: String,
    default: '确认'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  loadingText: {
    type: String,
    default: '处理中...'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel', 'update:visible'])

const contentLines = computed(() => {
  if (Array.isArray(props.content)) return props.content
  return props.content ? [props.content] : []
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  if (props.loading) return
  emit('update:visible', false)
  emit('cancel')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.confirm-dialog {
  background: rgba(5, 10, 5, 0.98);
  border: 2px solid #ffaa00;
  padding: 2rem;
  max-width: 500px;
  min-width: 320px;
  box-shadow: 0 0 30px rgba(255, 170, 0, 0.2);
  font-family: 'Share Tech Mono', monospace;
  animation: dialogIn 0.2s ease-out;
}

.confirm-dialog.danger {
  border-color: #ff3300;
  box-shadow: 0 0 30px rgba(255, 51, 0, 0.3);
}

.confirm-dialog.info {
  border-color: #00ccff;
  box-shadow: 0 0 30px rgba(0, 204, 255, 0.2);
}

@keyframes dialogIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.confirm-title {
  color: #ffaa00;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  text-shadow: 0 0 10px rgba(255, 170, 0, 0.5);
}

.confirm-dialog.danger .confirm-title {
  color: #ff3300;
  text-shadow: 0 0 10px rgba(255, 51, 0, 0.5);
}

.confirm-dialog.info .confirm-title {
  color: #00ccff;
  text-shadow: 0 0 10px rgba(0, 204, 255, 0.5);
}

.confirm-content {
  color: #aaa;
  line-height: 1.6;
}

.confirm-content p {
  margin: 0.5rem 0;
}

.confirm-actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.term-btn {
  background: transparent;
  border: 1px solid #33ff00;
  color: #33ff00;
  font-family: 'Share Tech Mono', monospace;
  font-size: 1rem;
  padding: 0.5rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  text-shadow: 0 0 5px #33ff00;
}

.term-btn:hover:not(:disabled) {
  background: #33ff00;
  color: #000;
  box-shadow: 0 0 20px #33ff00;
}

.term-btn.warning {
  border-color: #ffaa00;
  color: #ffaa00;
  text-shadow: 0 0 5px #ffaa00;
}

.term-btn.warning:hover:not(:disabled) {
  background: #ffaa00;
  color: #000;
  box-shadow: 0 0 20px #ffaa00;
}

.term-btn.danger {
  border-color: #ff3300;
  color: #ff3300;
  text-shadow: 0 0 5px #ff3300;
}

.term-btn.danger:hover:not(:disabled) {
  background: #ff3300;
  color: #000;
  box-shadow: 0 0 20px #ff3300;
}

.term-btn.info {
  border-color: #00ccff;
  color: #00ccff;
  text-shadow: 0 0 5px #00ccff;
}

.term-btn.info:hover:not(:disabled) {
  background: #00ccff;
  color: #000;
  box-shadow: 0 0 20px #00ccff;
}

.term-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.blink {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
