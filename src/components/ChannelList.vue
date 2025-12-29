<template>
  <div class="channel-list-container">
    <!-- 频道列表头部 -->
    <div class="channel-header">
      <div class="header-info">
        <span class="header-tag">[CHANNELS]</span>
        <h2 class="header-title">ROUND_TABLE_CONFERENCE</h2>
        <span class="channel-count">TOTAL: {{ channels.length }}</span>
      </div>
    </div>

    <!-- 频道列表 -->
    <div class="channel-grid">
      <div class="grid-header">
        <span class="col-id">ID</span>
        <span class="col-name">NAME</span>
        <span class="col-desc">DESCRIPTION</span>
        <span class="col-creator">CREATOR</span>
        <span class="col-action">ACTION</span>
      </div>

      <div v-if="isLoading" class="loading-row">
        <span class="loading-text">>> LOADING CHANNELS...</span>
        <span class="cursor blink">_</span>
      </div>

      <div
        v-else
        v-for="(channel, index) in channels"
        :key="channel.id"
        class="channel-row"
        :class="{ 'default-channel': channel.is_default }"
        @click="enterChannel(channel)"
      >
        <span class="col-id">#{{ String(index + 1).padStart(3, '0') }}</span>
        <span class="col-name">
          <span class="channel-icon">{{ channel.is_default ? '★' : '○' }}</span>
          {{ channel.display_name }}
        </span>
        <span class="col-desc">{{ channel.description || '---' }}</span>
        <span class="col-creator">@{{ channel.creator?.name || 'SYSTEM' }}</span>
        <span class="col-action">
          <button class="enter-btn" @click.stop="enterChannel(channel)">
            ENTER >>
          </button>
        </span>
      </div>

      <div v-if="!isLoading && channels.length === 0" class="empty-row">
        <span>>> NO CHANNELS AVAILABLE</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getChannels } from '../api/channel'

const emit = defineEmits(['enter-channel'])

const channels = ref([])
const isLoading = ref(false)

// 加载频道列表
const loadChannels = async () => {
  isLoading.value = true
  try {
    const res = await getChannels()
    if (res.code === 0 && res.data) {
      channels.value = res.data
    }
  } catch (err) {
    console.error('Failed to load channels:', err)
    Message.error('加载频道列表失败')
  } finally {
    isLoading.value = false
  }
}

// 进入频道
const enterChannel = (channel) => {
  emit('enter-channel', channel)
}

onMounted(() => {
  loadChannels()
})
</script>

<style scoped>
.channel-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0d1117;
  color: #c9d1d9;
  font-family: 'JetBrains Mono', monospace;
}

/* Header */
.channel-header {
  height: 60px;
  border-bottom: 1px solid #30363d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #161b22;
}

.header-info {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.header-tag {
  font-size: 12px;
  color: #7ee787;
  font-weight: bold;
}

.header-title {
  font-size: 16px;
  color: #c9d1d9;
  margin: 0;
  letter-spacing: 1px;
}

.channel-count {
  font-size: 12px;
  color: #8b949e;
}

/* Channel Grid */
.channel-grid {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.grid-header {
  display: grid;
  grid-template-columns: 60px 200px 1fr 120px 100px;
  padding: 10px 16px;
  color: #484f58;
  font-size: 11px;
  font-weight: bold;
  border-bottom: 1px solid #30363d;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.channel-row {
  display: grid;
  grid-template-columns: 60px 200px 1fr 120px 100px;
  padding: 16px;
  background: #161b22;
  border: 1px solid #30363d;
  margin-top: 8px;
  cursor: pointer;
  transition: all 0.2s;
  align-items: center;
}

.channel-row:hover {
  border-color: #58a6ff;
  background: #1c2128;
}

.channel-row.default-channel {
  border-left: 3px solid #f0883e;
}

.col-id {
  color: #79c0ff;
  font-size: 12px;
}

.col-name {
  color: #c9d1d9;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.channel-icon {
  color: #f0883e;
  font-size: 14px;
}

.col-desc {
  color: #8b949e;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 16px;
}

.col-creator {
  color: #d2a8ff;
  font-size: 12px;
}

.col-action {
  text-align: right;
}

.enter-btn {
  background: transparent;
  border: 1px solid #30363d;
  color: #58a6ff;
  font-family: inherit;
  font-size: 11px;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.enter-btn:hover {
  background: #58a6ff;
  color: #0d1117;
}

.loading-row,
.empty-row {
  padding: 40px;
  text-align: center;
  color: #8b949e;
  font-size: 14px;
}

.loading-text {
  margin-right: 8px;
}

.cursor {
  color: #58a6ff;
}

.blink {
  animation: blink 1s infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>
