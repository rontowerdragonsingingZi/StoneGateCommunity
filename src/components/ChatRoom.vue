<template>
  <BaseChatRoom
    :title="channel?.display_name || 'UNKNOWN'"
    title-prefix="#"
    prompt="phoenix@chat:~$"
    :messages="messages"
    :is-connected="isConnected"
    :online-count="onlineUsers.length"
    :show-online-count="true"
    @back="$emit('back')"
    @send="sendMessage"
    @send-file="sendFileMessage"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getEcho } from '../echo'
import { sendMessage as apiSendMessage, getChatHistory } from '../api/chat'
import { getToken } from '../api/request'
import BaseChatRoom from './BaseChatRoom.vue'

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
        type: msg.type || 'text',
        isSelf: msg.user?.id === currentUser.value?.id
      }))
    }
  } catch (err) {
    console.error('Failed to load chat history:', err)
  } finally {
    isLoading.value = false
  }
}

// 发送消息
const sendMessage = async (content, type = 'text') => {
  if (!content) return
  if (!getToken()) {
    Message.warning('请先登录后再发送消息')
    return
  }
  if (!props.channel?.name) {
    Message.error('频道信息不完整')
    return
  }

  try {
    const res = await apiSendMessage(props.channel.name, content, type)
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
        type: res.data.type || 'text',
        isSelf: true
      })
    } else {
      Message.error(res.message || '发送失败')
    }
  } catch (err) {
    Message.error('网络错误，发送失败')
    console.error('Send message error:', err)
  }
}

// 发送文件消息
const sendFileMessage = async (fileInfo) => {
  // fileInfo: { url, type, name, mime, size }
  await sendMessage(fileInfo.url, fileInfo.type)
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
          type: e.type || 'text',
          isSelf: false
        })
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
