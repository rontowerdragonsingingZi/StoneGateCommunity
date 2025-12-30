<template>
  <div class="chat-interface">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="header-info">
        <button class="back-btn" @click="$emit('back')">← BACK</button>
        <span class="channel-status" :class="{ connected: isConnected }">
          {{ isConnected ? '[CONNECTED]' : '[CONNECTING...]' }}
        </span>
        <h2 class="channel-name">{{ titlePrefix }} {{ title }}</h2>
        <span v-if="showOnlineCount" class="online-count">ONLINE: {{ onlineCount }}</span>
      </div>
      <div class="header-decor">
        <div class="signal-bars">
          <div class="bar" style="height: 40%"></div>
          <div class="bar" style="height: 70%"></div>
          <div class="bar" style="height: 100%"></div>
        </div>
      </div>
    </div>

    <!-- 主内容区域：消息列表 + 右侧面板 -->
    <div class="chat-main">
      <!-- 消息列表区域 -->
      <CustomScrollbar class="message-area" ref="messageContainer">
        <div 
          v-for="(msg, index) in messages" 
          :key="index" 
          class="message-row"
          :class="{ 'self': msg.isSelf }"
        >
          <div class="msg-avatar" :style="{ borderColor: msg.color }">
            <span class="avatar-char">{{ msg.avatarChar }}</span>
          </div>
          
          <div class="msg-content-wrapper">
            <div class="msg-meta">
              <span class="msg-author" :style="{ color: msg.color }">{{ msg.author }}</span>
              <span class="msg-time">{{ msg.time }}</span>
              <span class="msg-id">ID:{{ msg.id }}</span>
            </div>
            <div class="msg-bubble" :style="{ borderColor: msg.color }">
              <!-- 文本消息 -->
              <p v-if="msg.type === 'text' || !msg.type">{{ msg.text }}</p>
              <!-- 图片消息 -->
              <div v-else-if="msg.type === 'image'" class="msg-image">
                <img :src="msg.text" alt="image" @click="previewImage(msg.text)" />
              </div>
              <!-- 文件消息 -->
              <div v-else-if="msg.type === 'file'" class="msg-file">
                <a :href="msg.text" target="_blank" class="file-link">
                  <span class="file-icon">📄</span>
                  <span class="file-name">{{ getFileName(msg.text) }}</span>
                  <span class="file-action">[下载]</span>
                </a>
              </div>
              <!-- 表情消息 -->
              <div v-else-if="msg.type === 'sticker'" class="msg-sticker">
                <img :src="msg.text" alt="sticker" />
              </div>
              <!-- 系统消息 -->
              <p v-else-if="msg.type === 'system'" class="system-msg">{{ msg.text }}</p>
            </div>
          </div>
        </div>
      </CustomScrollbar>

      <!-- 右侧面板：在线用户 + 频道公告 -->
      <div class="side-panel" v-if="showSidePanel">
        <!-- 频道公告 -->
        <div class="panel-section announcement-section" v-if="announcement">
          <div class="section-header">
            <span class="section-title">频道公告</span>
            <span class="section-icon">▶</span>
          </div>
          <div class="announcement-content">
            <p>{{ announcement }}</p>
          </div>
        </div>

        <!-- 在线用户列表 -->
        <div class="panel-section members-section">
          <div class="section-header">
            <span class="section-title">在线成员</span>
            <span class="member-count">{{ onlineUsers.length }}</span>
          </div>
          <CustomScrollbar class="member-list-scroll">
            <div 
              v-for="user in onlineUsers" 
              :key="user.id" 
              class="member-item"
            >
              <div class="member-avatar" :style="{ borderColor: getUserColor(user.id) }">
                <img v-if="user.avatar" :src="user.avatar" :alt="user.name" />
                <span v-else class="avatar-char">{{ getAvatarChar(user.name) }}</span>
              </div>
              <div class="member-info">
                <span class="member-name" :style="{ color: getUserColor(user.id) }">{{ user.name }}</span>
                <span v-if="user.is_bot" class="bot-badge">BOT</span>
              </div>
            </div>
            <div v-if="onlineUsers.length === 0" class="no-members">
              <span>暂无在线成员</span>
            </div>
          </CustomScrollbar>
        </div>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <div v-if="previewImageUrl" class="image-preview-overlay" @click="previewImageUrl = null">
      <img :src="previewImageUrl" alt="preview" />
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-console">
        <span class="prompt">{{ prompt }}</span>
        <input 
          v-model="inputText" 
          type="text" 
          placeholder="Enter transmission..." 
          @keyup.enter="handleSend"
          spellcheck="false"
        />
        <input 
          ref="fileInput"
          type="file" 
          style="display: none"
          @change="handleFileSelect"
        />
        <button class="sticker-btn" @click="toggleStickerPicker">
          😀
        </button>
        <button class="file-btn" @click="triggerFileSelect" :disabled="isUploading">
          {{ isUploading ? 'UPLOADING...' : '📎 FILE' }}
        </button>
        <button class="send-btn" @click="handleSend">SEND_DATA</button>
        
        <!-- 表情选择面板 -->
        <StickerPicker 
          :visible="showStickerPicker" 
          @select="handleStickerSelect"
          @close="showStickerPicker = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { uploadFile } from '../api/upload'
import StickerPicker from './StickerPicker.vue'
import CustomScrollbar from './CustomScrollbar.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'UNKNOWN'
  },
  titlePrefix: {
    type: String,
    default: '#'
  },
  prompt: {
    type: String,
    default: 'user@chat:~$'
  },
  messages: {
    type: Array,
    default: () => []
  },
  isConnected: {
    type: Boolean,
    default: false
  },
  onlineCount: {
    type: Number,
    default: 0
  },
  showOnlineCount: {
    type: Boolean,
    default: true
  },
  onlineUsers: {
    type: Array,
    default: () => []
  },
  announcement: {
    type: String,
    default: ''
  },
  showSidePanel: {
    type: Boolean,
    default: true
  }
})

// 用户颜色映射
const userColors = [
  '#e67e22', '#9b59b6', '#2ecc71', '#3498db', 
  '#e74c3c', '#1abc9c', '#f39c12', '#8e44ad'
]
const getUserColor = (userId) => userColors[userId % userColors.length]

// 获取头像字符
const getAvatarChar = (name) => {
  if (!name) return '??'
  return name.substring(0, 2)
}

const emit = defineEmits(['back', 'send', 'sendFile', 'sendSticker'])

const messageContainer = ref(null)
const inputText = ref('')
const fileInput = ref(null)
const isUploading = ref(false)
const previewImageUrl = ref(null)
const showStickerPicker = ref(false)

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

// 发送消息
const handleSend = () => {
  if (!inputText.value.trim()) return
  emit('send', inputText.value.trim())
  inputText.value = ''
}

// 触发文件选择
const triggerFileSelect = () => {
  fileInput.value?.click()
}

// 文件选择处理
const handleFileSelect = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  
  // 限制文件大小 100MB
  if (file.size > 100 * 1024 * 1024) {
    alert('文件大小不能超过 100MB')
    e.target.value = ''
    return
  }
  
  isUploading.value = true
  try {
    const res = await uploadFile(file)
    if (res.code === 201 && res.data?.url) {
      // 判断是图片还是普通文件
      const isImage = file.type.startsWith('image/')
      emit('sendFile', {
        url: res.data.url,
        type: isImage ? 'image' : 'file',
        name: res.data.name,
        mime: res.data.mime,
        size: res.data.size
      })
    } else {
      alert(res.message || '上传失败')
    }
  } catch (err) {
    console.error('Upload error:', err)
    alert('上传失败，请重试')
  } finally {
    isUploading.value = false
    e.target.value = ''
  }
}

// 从 URL 获取文件名
const getFileName = (url) => {
  if (!url) return 'unknown'
  const parts = url.split('/')
  return parts[parts.length - 1] || 'file'
}

// 预览图片
const previewImage = (url) => {
  previewImageUrl.value = url
}

// 切换表情选择面板
const toggleStickerPicker = () => {
  showStickerPicker.value = !showStickerPicker.value
}

// 选择表情
const handleStickerSelect = (sticker) => {
  emit('sendSticker', sticker)
  showStickerPicker.value = false
}

// 监听消息变化，自动滚动
watch(() => props.messages.length, () => {
  scrollToBottom()
})

// 暴露方法给父组件
defineExpose({
  scrollToBottom
})
</script>

<style scoped>
.chat-interface {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0d1117;
  color: #c9d1d9;
  font-family: 'JetBrains Mono', monospace;
  overflow: hidden;
  border-left: 1px solid #30363d;
}

/* Header */
.chat-header {
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
  align-items: center;
  gap: 12px;
}

.back-btn {
  background: transparent;
  border: 1px solid #30363d;
  color: #8b949e;
  font-family: inherit;
  font-size: 12px;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 8px;
}

.back-btn:hover {
  border-color: #58a6ff;
  color: #58a6ff;
}

.channel-status {
  font-size: 12px;
  color: #f0883e;
  font-weight: bold;
}

.channel-status.connected {
  color: #238636;
}

.channel-name {
  font-size: 16px;
  color: #c9d1d9;
  margin: 0;
  letter-spacing: 1px;
}

.online-count {
  font-size: 12px;
  color: #8b949e;
}

.signal-bars {
  display: flex;
  gap: 3px;
  align-items: flex-end;
  height: 20px;
}

.bar {
  width: 4px;
  background: #238636;
  animation: signal 1.5s infinite ease-in-out;
}
.bar:nth-child(2) { animation-delay: 0.2s; }
.bar:nth-child(3) { animation-delay: 0.4s; }

@keyframes signal {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* Main Content Area */
.chat-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* Message Area */
.message-area {
  flex: 1;
  min-height: 0; /* 允许在 flex 容器中收缩，触发滚动 */
}

.message-area :deep(.scrollbar-content) {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  scroll-behavior: smooth;
}

/* Side Panel */
.side-panel {
  width: 240px;
  background: #161b22;
  border-left: 1px solid #30363d;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-section {
  border-bottom: 1px solid #30363d;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #0d1117;
  border-bottom: 1px solid #21262d;
}

.section-title {
  font-size: 12px;
  color: #8b949e;
  font-weight: bold;
}

.section-icon {
  color: #58a6ff;
  font-size: 10px;
}

.member-count {
  background: #238636;
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
}

/* Announcement */
.announcement-content {
  padding: 12px 16px;
  font-size: 13px;
  color: #c9d1d9;
  line-height: 1.5;
}

.announcement-content p {
  margin: 0;
}

/* Member List */
.members-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.member-list-scroll {
  flex: 1;
  min-height: 0;
}

.member-list-scroll :deep(.scrollbar-content) {
  padding: 8px 0;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  transition: background 0.2s;
  cursor: pointer;
}

.member-item:hover {
  background: #21262d;
}

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: #010409;
  border: 2px solid #30363d;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-avatar .avatar-char {
  font-size: 12px;
}

.member-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.member-name {
  font-size: 13px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bot-badge {
  background: #8957e5;
  color: #fff;
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 2px;
  font-weight: bold;
}

.no-members {
  padding: 20px 16px;
  text-align: center;
  color: #484f58;
  font-size: 12px;
}

.message-row {
  display: flex;
  gap: 16px;
  max-width: 80%;
  animation: fadeIn 0.3s ease;
}

.message-row.self {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 40px;
  height: 40px;
  background: #010409;
  border: 2px solid #30363d;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-char {
  font-weight: bold;
  font-size: 14px;
  color: #c9d1d9;
}

.msg-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.msg-meta {
  font-size: 12px;
  color: #8b949e;
  display: flex;
  gap: 8px;
  align-items: center;
}

.message-row.self .msg-meta {
  flex-direction: row-reverse;
}

.msg-author {
  font-weight: bold;
}

.msg-bubble {
  background: #161b22;
  padding: 12px 16px;
  border: 1px solid #30363d;
  border-left-width: 4px;
  position: relative;
  line-height: 1.5;
  font-size: 14px;
}

.msg-bubble p {
  margin: 0;
}

.message-row.self .msg-bubble {
  border-left-width: 1px;
  border-right-width: 4px;
  background: rgba(56, 139, 253, 0.1);
}

/* Input Area */
.input-area {
  padding: 24px;
  border-top: 1px solid #30363d;
  background: #0d1117;
}

.input-console {
  display: flex;
  align-items: center;
  background: #010409;
  border: 1px solid #30363d;
  padding: 12px 16px;
  gap: 12px;
  transition: border-color 0.3s;
  position: relative;
}

.input-console:focus-within {
  border-color: #58a6ff;
}

.prompt {
  color: #238636;
  font-weight: bold;
  user-select: none;
}

.input-console input {
  flex: 1;
  background: transparent;
  border: none;
  color: #c9d1d9;
  font-family: inherit;
  font-size: 14px;
  outline: none;
}

.send-btn {
  background: transparent;
  border: 1px solid #30363d;
  color: #58a6ff;
  font-family: inherit;
  font-size: 12px;
  padding: 4px 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:hover {
  background: #58a6ff;
  color: #0d1117;
}

.file-btn {
  background: transparent;
  border: 1px solid #30363d;
  color: #f0883e;
  font-family: inherit;
  font-size: 12px;
  padding: 4px 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.file-btn:hover {
  background: #f0883e;
  color: #0d1117;
}

.file-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sticker-btn {
  background: transparent;
  border: 1px solid #30363d;
  color: #c9d1d9;
  font-size: 16px;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.sticker-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #58a6ff;
}

/* 图片消息 */
.msg-image img {
  max-width: 300px;
  max-height: 200px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.msg-image img:hover {
  transform: scale(1.02);
}

/* 文件消息 */
.msg-file {
  display: flex;
  align-items: center;
}

.file-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #58a6ff;
  text-decoration: none;
  padding: 8px 12px;
  background: rgba(88, 166, 255, 0.1);
  border-radius: 4px;
  transition: background 0.2s;
}

.file-link:hover {
  background: rgba(88, 166, 255, 0.2);
}

.file-icon {
  font-size: 20px;
}

.file-name {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-action {
  color: #8b949e;
  font-size: 12px;
}

/* 系统消息 */
.system-msg {
  color: #8b949e;
  font-style: italic;
}

/* 表情消息 */
.msg-sticker img {
  max-width: 120px;
  max-height: 120px;
  object-fit: contain;
}

/* 图片预览 */
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.image-preview-overlay img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
