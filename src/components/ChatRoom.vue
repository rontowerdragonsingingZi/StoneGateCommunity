<template>
  <div class="chat-interface">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="header-info">
        <span class="channel-status">[ENCRYPTED]</span>
        <h2 class="channel-name"># ROUND_TABLE_CONFERENCE</h2>
        <span class="online-count">ONLINE: 4</span>
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
import { ref, onMounted, nextTick } from 'vue'

const messageContainer = ref(null)
const inputText = ref('')

const messages = ref([
  {
    id: '0x1A4',
    author: 'Daru',
    avatarChar: 'Da',
    color: '#e67e22',
    time: '14:02:33',
    text: '今天的服务器状态看起来很稳定，IBN 5100 的解码进度已经到 48% 了。',
    isSelf: false
  },
  {
    id: '0x1A5',
    author: 'Kurisu',
    avatarChar: 'Ku',
    color: '#9b59b6',
    time: '14:03:12',
    text: '冈部，你上次提到的那个理论漏洞，我重新推导了一遍，确实存在因果倒置的可能性。',
    isSelf: false
  },
  {
    id: '0x1A6',
    author: 'Mayuri',
    avatarChar: 'Ma',
    color: '#2ecc71',
    time: '14:04:00',
    text: '嘟嘟噜~ 大家的炸鸡块已经买回来了哦！',
    isSelf: false
  },
  {
    id: '0x1A7',
    author: 'Phoenix',
    avatarChar: 'Ph',
    color: '#3498db',
    time: '14:04:45',
    text: '干得好，真由理！这就是命运石之门的选择！',
    isSelf: true
  }
])

const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

const sendMessage = () => {
  if (!inputText.value.trim()) return

  const now = new Date()
  const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

  messages.value.push({
    id: `0x${Math.floor(Math.random()*1000).toString(16).toUpperCase()}`,
    author: 'Phoenix',
    avatarChar: 'Ph',
    color: '#3498db',
    time: timeString,
    text: inputText.value,
    isSelf: true
  })

  inputText.value = ''
  scrollToBottom()

  // 模拟 Amadeus 自动回复
  setTimeout(() => {
    messages.value.push({
      id: `0x${Math.floor(Math.random()*1000).toString(16).toUpperCase()}`,
      author: 'Amadeus',
      avatarChar: 'AI',
      color: '#e74c3c',
      time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
      text: '已接收到数据。正在根据当前世界线变动率进行分析...',
      isSelf: false
    })
    scrollToBottom()
  }, 1500)
}

onMounted(() => {
  scrollToBottom()
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
  align-items: baseline;
  gap: 12px;
}

.channel-status {
  font-size: 12px;
  color: #238636;
  font-weight: bold;
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