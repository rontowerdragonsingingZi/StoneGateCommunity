<template>
  <div class="chat-interface">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="header-info">
        <button class="back-btn" @click="$emit('back')">← BACK</button>
        <span class="channel-status" :class="{ connected: isConnected }">
          {{ isConnected ? '[CONNECTED]' : '[CONNECTING...]' }}
        </span>
        <h2 class="channel-name"># {{ channel?.display_name || 'UNKNOWN' }}</h2>
        <span class="online-count">ONLINE: {{ onlineUsers.length }}</span>
      </div>
      <div class="header-decor">
        <div class="signal-bars">
          <div class="bar" style="height: 40%"></div>
          <div class="bar" style="height: 70%"></div>
          <div class="bar" style="height: 100%"></div>
        </div>
      </div>
    </div>

    <!-- 消息列表区域 -->
    <div class="message-area" ref="messageContainer">
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
            <p>{{ msg.text }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-console">
        <span class="prompt">phoenix@chat:~$</span>
        <input 
          v-model="inputText" 
          type="text" 
          placeholder="Enter transmission..." 
          @keyup.enter="sendMessage"
          spellcheck="false"
        />
        <button class="send-btn" @click="sendMessage">SEND_DATA</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getEcho, disconnectEcho } from '../echo'
import { sendMessage as apiSendMessage, getChatHistory } from '../api/chat'
import { getToken } from '../api/request'

// Props
const props = defineProps({
  channel: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['back'])

// 从 localStorage 获取当前用户信息
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

const messageContainer = ref(null)
const inputText = ref('')
const messages = ref([])
const onlineUsers = ref([])
const isConnected = ref(false)
const isLoading = ref(false)
const currentUser = ref(getCurrentUser())

// 用户颜色映射（根据 ID 生成稳定颜色）
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

// 格式化时间
const formatTime = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-GB', { hour12: false })
}

// 格式化消息ID
const formatId = (id) => `0x${id.toString(16).toUpperCase()}`

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

// 加载历史消息
const loadHistory = async () => {
  if (!getToken() || !props.channel?.name) return
  
  isLoading.value = true
  try {
    const res = await getChatHistory({ channel: props.channel.name, limit: 50 })
    if (res.code === 200 && res.data?.items) {
      messages.value = res.data.items.map(msg => ({
        id: formatId(msg.id),
        visid: msg.id,
        author: msg.user?.name || 'Unknown',
        avatarChar: getAvatarChar(msg.user?.name),
        color: getUserColor(msg.user?.id || 0),
        time: formatTime(msg.created_at),
        text: msg.content,
        isSelf: msg.user?.id === currentUser.value?.id
      }))
      scrollToBottom()
    }
  } catch (err) {
    console.error('Failed to load chat history:', err)
  } finally {
    isLoading.value = false
  }
}

// 发送消息
const sendMessage = async () => {
  if (!inputText.value.trim()) return
  if (!getToken()) {
    Message.warning('请先登录后再发送消息')
    return
  }
  if (!props.channel?.name) {
    Message.error('频道信息不完整')
    return
  }

  const content = inputText.value.trim()
  inputText.value = ''

  try {
    const res = await apiSendMessage(props.channel.name, content)
    if (res.code === 201 && res.data) {
      // 添加自己发送的消息
      messages.value.push({
        id: formatId(res.data.id),
        rawId: res.data.id,
        author: res.data.user?.name || currentUser.value?.name || 'Me',
        avatarChar: getAvatarChar(res.data.user?.name || currentUser.value?.name),
        color: getUserColor(res.data.user?.id || currentUser.value?.id || 0),
        time: formatTime(res.data.created_at),
        text: res.data.content,
        isSelf: true
      })
      scrollToBottom()
    } else {
      Message.error(res.message || '发送失败')
    }
  } catch (err) {
    Message.error('网络错误，发送失败')
    console.error('Send message error:', err)
  }
}

// 连接 WebSocket
let echoChannel = null

const connectWebSocket = () => {
  if (!getToken()) {
    console.log('No token, skip WebSocket connection')
    return
  }

  if (!props.channel?.name) {
    console.log('No channel, skip WebSocket connection')
    return
  }

  try {
    const echo = getEcho()
    const wsChannelName = `chat.${props.channel.name}`
    
    echoChannel = echo.join(wsChannelName)
      .here((users) => {
        // 当前在线用户列表
        onlineUsers.value = users
        isConnected.value = true
        console.log(`Connected to ${wsChannelName}, online users:`, users)
      })
      .joining((user) => {
        // 有用户加入
        onlineUsers.value.push(user)
        console.log('User joined:', user)
      })
      .leaving((user) => {
        // 有用户离开
        onlineUsers.value = onlineUsers.value.filter(u => u.id !== user.id)
        console.log('User left:', user)
      })
      .listen('.message.sent', (e) => {
        // 收到新消息（来自其他用户）
        console.log('Message received:', e)
        
        // 避免重复添加自己的消息
        if (e.user?.id === currentUser.value?.id) return
        
        messages.value.push({
          id: formatId(e.id),
          rawId: e.id,
          author: e.user?.name || 'Unknown',
          avatarChar: getAvatarChar(e.user?.name),
          color: getUserColor(e.user?.id || 0),
          time: formatTime(e.created_at),
          text: e.content,
          isSelf: false
        })
        scrollToBottom()
      })
      .error((error) => {
        console.error('WebSocket error:', error)
        isConnected.value = false
      })
  } catch (err) {
    console.error('Failed to connect WebSocket:', err)
    isConnected.value = false
  }
}

// 监听频道变化，重新连接
watch(() => props.channel, (newChannel, oldChannel) => {
  if (newChannel?.name !== oldChannel?.name) {
    // 断开旧连接
    if (echoChannel) {
      echoChannel.leave()
      echoChannel = null
    }
    // 清空消息
    messages.value = []
    isConnected.value = false
    // 重新加载
    loadHistory()
    connectWebSocket()
  }
}, { deep: true })

onMounted(() => {
  loadHistory()
  connectWebSocket()
})

onUnmounted(() => {
  if (echoChannel) {
    echoChannel.leave()
  }
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

/* Message Area */
.message-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  scroll-behavior: smooth;
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
  border-left-width: 4px; /* Default left border for others */
  position: relative;
  line-height: 1.5;
  font-size: 14px;
}

.message-row.self .msg-bubble {
  border-left-width: 1px;
  border-right-width: 4px; /* Right border for self */
  background: rgba(56, 139, 253, 0.1); /* Subtle blue tint */
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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>