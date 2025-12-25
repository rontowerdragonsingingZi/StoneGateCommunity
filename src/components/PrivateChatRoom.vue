<template>
  <BaseChatRoom
    :title="friend?.name || 'UNKNOWN'"
    title-prefix="@"
    prompt="dm@private:~$"
    :messages="messages"
    :is-connected="isConnected"
    :online-count="0"
    :show-online-count="false"
    @back="$emit('back')"
    @send="sendMessage"
    @send-file="sendFileMessage"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getEcho } from '../echo'
import { sendPrivateMessage, getPrivateChatHistory, makeConversationId } from '../api/privateChat'
import { getToken } from '../api/request'
import BaseChatRoom from './BaseChatRoom.vue'

// Props
const props = defineProps({
  friend: {
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
const isConnected = ref(false)
const isLoading = ref(false)
const currentUser = ref(getCurrentUser())

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

// 格式化时间
const formatTime = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-GB', { hour12: false })
}

// 格式化消息ID
const formatId = (id) => `0x${id.toString(16).toUpperCase()}`

// 加载历史消息
const loadHistory = async () => {
  if (!getToken() || !props.friend?.id) return
  
  isLoading.value = true
  try {
    const res = await getPrivateChatHistory({ friendId: props.friend.id, limit: 50 })
    if (res.code === 200 && res.data?.items) {
      messages.value = res.data.items.map(msg => ({
        id: formatId(msg.id),
        rawId: msg.id,
        author: msg.sender?.name || 'Unknown',
        avatarChar: getAvatarChar(msg.sender?.name),
        color: getUserColor(msg.sender?.id || 0),
        time: formatTime(msg.created_at),
        text: msg.content,
        type: msg.type || 'text',
        isSelf: msg.sender?.id === currentUser.value?.id
      }))
    }
  } catch (err) {
    console.error('Failed to load private chat history:', err)
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
  if (!props.friend?.id) {
    Message.error('好友信息不完整')
    return
  }

  try {
    const res = await sendPrivateMessage(props.friend.id, content, type)
    if (res.code === 201 && res.data) {
      messages.value.push({
        id: formatId(res.data.id),
        rawId: res.data.id,
        author: res.data.sender?.name || currentUser.value?.name || 'Me',
        avatarChar: getAvatarChar(res.data.sender?.name || currentUser.value?.name),
        color: getUserColor(res.data.sender?.id || currentUser.value?.id || 0),
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

// 连接 WebSocket (Private Channel)
let echoChannel = null

const connectWebSocket = () => {
  if (!getToken()) {
    console.log('No token, skip WebSocket connection')
    return
  }

  if (!props.friend?.id || !currentUser.value?.id) {
    console.log('No friend or user info, skip WebSocket connection')
    return
  }

  try {
    const echo = getEcho()
    const conversationId = makeConversationId(currentUser.value.id, props.friend.id)
    const wsChannelName = `private-chat.${conversationId}`
    
    // 使用 private() 而非 join()，因为这是 Private Channel
    echoChannel = echo.private(wsChannelName)
      .listen('.message.sent', (e) => {
        console.log('Private message received:', e)
        
        // 避免重复添加自己的消息
        if (e.sender?.id === currentUser.value?.id) return
        
        messages.value.push({
          id: formatId(e.id),
          rawId: e.id,
          author: e.sender?.name || 'Unknown',
          avatarChar: getAvatarChar(e.sender?.name),
          color: getUserColor(e.sender?.id || 0),
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
    
    isConnected.value = true
    console.log(`Connected to ${wsChannelName}`)
  } catch (err) {
    console.error('Failed to connect WebSocket:', err)
    isConnected.value = false
  }
}

// 监听好友变化，重新连接
watch(() => props.friend, (newFriend, oldFriend) => {
  if (newFriend?.id !== oldFriend?.id) {
    // 断开旧连接
    if (echoChannel) {
      const oldConversationId = oldFriend ? makeConversationId(currentUser.value.id, oldFriend.id) : null
      if (oldConversationId) {
        try {
          const echo = getEcho()
          echo.leave(`private-chat.${oldConversationId}`)
        } catch (e) {}
      }
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
  if (echoChannel && currentUser.value?.id && props.friend?.id) {
    try {
      const echo = getEcho()
      const conversationId = makeConversationId(currentUser.value.id, props.friend.id)
      echo.leave(`private-chat.${conversationId}`)
    } catch (e) {}
  }
})
</script>
