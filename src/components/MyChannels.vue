<template>
  <div class="my-channels-container">
    <!-- 头部 -->
    <div class="channel-header">
      <div class="header-info">
        <span class="header-tag">[MY_CHANNELS]</span>
        <h2 class="header-title">MY_CONFERENCES</h2>
        <span class="channel-count">TOTAL: {{ channels.length }}</span>
      </div>
      <div class="header-actions">
        <button class="create-btn" @click="showCreateModal = true">
          <span class="btn-icon">+</span> NEW_CHANNEL
        </button>
      </div>
    </div>

    <!-- 频道列表 -->
    <div class="channel-grid">
      <div class="grid-header">
        <span class="col-id">ID</span>
        <span class="col-name">NAME</span>
        <span class="col-desc">DESCRIPTION</span>
        <span class="col-type">TYPE</span>
        <span class="col-action">ACTION</span>
      </div>

      <div v-if="isLoading" class="loading-row">
        <span class="loading-text">>> LOADING MY CHANNELS...</span>
        <span class="cursor blink">_</span>
      </div>

      <div
        v-else
        v-for="(channel, index) in channels"
        :key="channel.id"
        class="channel-row"
        @click="enterChannel(channel)"
      >
        <span class="col-id">#{{ String(index + 1).padStart(3, '0') }}</span>
        <span class="col-name">
          <span class="channel-icon">{{ channel.is_private ? '●' : '○' }}</span>
          {{ channel.display_name }}
        </span>
        <span class="col-desc">{{ channel.description || '---' }}</span>
        <span class="col-type">
          <span :class="['type-badge', channel.is_private ? 'private' : 'public']">
            {{ channel.is_private ? 'PRIVATE' : 'PUBLIC' }}
          </span>
        </span>
        <span class="col-action">
          <button class="enter-btn" @click.stop="enterChannel(channel)">
            ENTER >>
          </button>
        </span>
      </div>

      <div v-if="!isLoading && channels.length === 0" class="empty-row">
        <span>>> NO CHANNELS CREATED</span>
        <p class="empty-hint">点击上方按钮创建你的第一个会议</p>
      </div>
    </div>

    <!-- 创建频道模态框 -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">[CREATE_NEW_CHANNEL]</span>
          <button class="close-btn" @click="showCreateModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>>> NAME (lowercase, a-z, 0-9, _, -):</label>
            <input
              v-model="newChannel.name"
              type="text"
              placeholder="channel_name"
              class="terminal-input"
              pattern="[a-z0-9_-]+"
            />
          </div>
          <div class="form-group">
            <label>>> DISPLAY_NAME:</label>
            <input
              v-model="newChannel.display_name"
              type="text"
              placeholder="显示名称"
              class="terminal-input"
            />
          </div>
          <div class="form-group">
            <label>>> DESCRIPTION (optional):</label>
            <input
              v-model="newChannel.description"
              type="text"
              placeholder="频道描述..."
              class="terminal-input"
            />
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="newChannel.is_private" />
              <span class="checkbox-text">PRIVATE_CHANNEL (仅受邀成员可见)</span>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showCreateModal = false">CANCEL</button>
          <button class="submit-btn" @click="handleCreateChannel" :disabled="isCreating">
            {{ isCreating ? 'CREATING...' : 'CREATE_CHANNEL()' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getMyChannels, createChannel } from '../api/channel'
import { getToken } from '../api/request'

const emit = defineEmits(['enter-channel'])

const channels = ref([])
const isLoading = ref(false)
const showCreateModal = ref(false)
const isCreating = ref(false)

const newChannel = ref({
  name: '',
  display_name: '',
  description: '',
  is_private: false
})

// 加载我的频道列表
const loadChannels = async () => {
  if (!getToken()) return
  isLoading.value = true
  try {
    const res = await getMyChannels()
    if (res.code === 0 && res.data) {
      channels.value = res.data
    }
  } catch (err) {
    console.error('Failed to load my channels:', err)
    Message.error('加载频道列表失败')
  } finally {
    isLoading.value = false
  }
}

// 进入频道
const enterChannel = (channel) => {
  emit('enter-channel', channel)
}

// 创建新频道
const handleCreateChannel = async () => {
  if (!getToken()) {
    Message.warning('请先登录')
    return
  }

  if (!newChannel.value.name || !newChannel.value.display_name) {
    Message.warning('请填写频道名称和显示名称')
    return
  }

  // 验证频道名格式
  if (!/^[a-z0-9_-]+$/.test(newChannel.value.name)) {
    Message.warning('频道名称只能包含小写字母、数字、下划线和短横线')
    return
  }

  isCreating.value = true
  try {
    const res = await createChannel({
      name: newChannel.value.name,
      display_name: newChannel.value.display_name,
      description: newChannel.value.description || null,
      is_private: newChannel.value.is_private
    })

    if (res.code === 0 && res.data) {
      Message.success('频道创建成功')
      channels.value.unshift(res.data)
      showCreateModal.value = false
      newChannel.value = { name: '', display_name: '', description: '', is_private: false }
    } else {
      Message.error(res.message || '创建失败')
    }
  } catch (err) {
    console.error('Failed to create channel:', err)
    Message.error('创建频道失败')
  } finally {
    isCreating.value = false
  }
}

onMounted(() => {
  loadChannels()
})
</script>

<style scoped>
.my-channels-container {
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
  color: #f0883e;
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

.create-btn {
  background: transparent;
  border: 1px solid #238636;
  color: #238636;
  font-family: inherit;
  font-size: 12px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.create-btn:hover {
  background: #238636;
  color: #ffffff;
}

.btn-icon {
  font-weight: bold;
}

/* Channel Grid */
.channel-grid {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.grid-header {
  display: grid;
  grid-template-columns: 60px 200px 1fr 100px 100px;
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
  grid-template-columns: 60px 200px 1fr 100px 100px;
  padding: 16px;
  background: #161b22;
  border: 1px solid #30363d;
  margin-top: 8px;
  cursor: pointer;
  transition: all 0.2s;
  align-items: center;
}

.channel-row:hover {
  border-color: #f0883e;
  background: #1c2128;
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

.type-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 2px;
}

.type-badge.public {
  background: rgba(35, 134, 54, 0.2);
  color: #238636;
  border: 1px solid #238636;
}

.type-badge.private {
  background: rgba(240, 136, 62, 0.2);
  color: #f0883e;
  border: 1px solid #f0883e;
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

.empty-hint {
  font-size: 12px;
  margin-top: 8px;
  color: #484f58;
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

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #161b22;
  border: 1px solid #30363d;
  width: 480px;
  max-width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #30363d;
}

.modal-title {
  color: #f0883e;
  font-size: 14px;
  font-weight: bold;
}

.close-btn {
  background: transparent;
  border: none;
  color: #8b949e;
  font-size: 20px;
  cursor: pointer;
}

.close-btn:hover {
  color: #c9d1d9;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  color: #8b949e;
  font-size: 12px;
  margin-bottom: 8px;
}

.terminal-input {
  width: 100%;
  background: #010409;
  border: 1px solid #30363d;
  color: #c9d1d9;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.terminal-input:focus {
  border-color: #58a6ff;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #f0883e;
}

.checkbox-text {
  color: #c9d1d9;
  font-size: 13px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #30363d;
}

.cancel-btn {
  background: transparent;
  border: 1px solid #30363d;
  color: #8b949e;
  font-family: inherit;
  font-size: 12px;
  padding: 8px 16px;
  cursor: pointer;
}

.cancel-btn:hover {
  border-color: #8b949e;
  color: #c9d1d9;
}

.submit-btn {
  background: #238636;
  border: 1px solid #238636;
  color: #ffffff;
  font-family: inherit;
  font-size: 12px;
  padding: 8px 16px;
  cursor: pointer;
}

.submit-btn:hover:not(:disabled) {
  background: #2ea043;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
