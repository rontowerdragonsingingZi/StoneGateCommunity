<template>
  <div class="terminal-container">
    <div class="crt-overlay"></div>
    <div class="scanline"></div>
    
    <div class="terminal-content">
      <div v-if="!systemReady" class="boot-sequence">
        <p v-for="(line, index) in bootLines" :key="index" class="boot-line">
          {{ line }}
        </p>
      </div>

      <div v-else class="login-interface">
        <div class="ascii-logo">
<pre>
   _____ _______ ____  _   _ ______ 
  / ____|__   __/ __ \| \ | |  ____|
 | (___    | | | |  | |  \| | |__   
  \___ \   | | | |  | | . ` |  __|  
  ____) |  | | | |__| | |\  | |____ 
 |_____/   |_|  \____/|_| \_|______|
                                    
         未来道具研究所
</pre>
        </div>

        <div class="system-status">
          <p>> 系统: 在线</p>
          <p>> 连接: 加密 (SG-VPN)</p>
          <p>> 变动率: 1.048596%</p>
        </div>

        <div class="auth-form">
          <div class="input-group">
            <span class="prompt">root@fg-lab:~$</span>
            <span class="cmd-label">代号:</span>
            <input 
              v-model="loginForm.username" 
              type="text" 
              class="terminal-input" 
              autofocus 
              spellcheck="false"
              @keyup.enter="focusPassword"
            />
          </div>
          <div class="input-group">
            <span class="prompt">root@fg-lab:~$</span>
            <span class="cmd-label">密码:</span>
            <input 
              ref="passwordInput"
              v-model="loginForm.password" 
              type="password" 
              class="terminal-input"
              spellcheck="false" 
              @keyup.enter="handleLogin"
            />
          </div>
          
          <div class="terminal-actions">
            <button class="term-btn" @click="handleLogin">[ 执行 ]</button>
            <button class="term-btn secondary" @click="toggleMode">[ 申请入部 ]</button>
            <button class="term-btn warning" @click="$router.push('/')">[ 返回 ]</button>
          </div>

          <div v-if="message" class="system-message">
            > {{ message }}<span class="blink">_</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../api/user'

const router = useRouter()
const systemReady = ref(false)
const bootLines = ref([])
const message = ref('')
const passwordInput = ref(null)

const loginForm = reactive({
  username: '',
  password: ''
})

const fullBootLog = [
  "BIOS 日期 07/28/10 15:24:12 版本: 08.00.10",
  "CPU: Amadeus 神经引擎 @ 128THz",
  "正在检查内存...",
  "内存测试: 65536K OK",
  "检测主设备... IBN 5100",
  "检测副设备... Amadeus 系统",
  "加载操作系统...",
  "初始化变动率仪表驱动...",
  "连接到世界线 1.048596...",
  "连接已建立。",
  "系统就绪。"
]

onMounted(() => {
  runBootSequence()
})

const runBootSequence = async () => {
  for (const line of fullBootLog) {
    bootLines.value.push(line)
    await new Promise(r => setTimeout(r, Math.random() * 300 + 50))
  }
  setTimeout(() => {
    systemReady.value = true
  }, 500)
}

const focusPassword = () => {
  passwordInput.value.focus()
}

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    message.value = "错误: 请输入凭证。"
    return
  }
  
  message.value = "正在验证..."
  
  try {
    const res = await login({
      name: loginForm.username,
      password: loginForm.password
    })
    
    if (res.code === 200) {
      message.value = res.message || "访问已授权。欢迎, Labmem。"
      // 存储用户信息到 localStorage
      localStorage.setItem('user', JSON.stringify(res.data))
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else if (res.code === 404) {
      message.value = res.message || "该Labmem不存在于此世界线"
    } else if (res.code === 401) {
      message.value = res.message || "认证失败，D-Mail密钥不匹配"
    } else {
      message.value = res.message || "未知错误，请重试"
    }
  } catch (error) {
    message.value = "网络错误: 无法连接到服务器"
    console.error('Login error:', error)
  }
}

const toggleMode = () => {
  router.push('/register')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');

.terminal-container {
  background-color: #000;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  font-family: 'VT323', monospace;
  color: #33ff00; /* Classic Terminal Green */
  font-size: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* CRT Screen Effects */
.crt-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 100%), 
              linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), 
              linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  background-size: 100% 2px, 3px 100%;
  pointer-events: none;
  z-index: 10;
}

.scanline {
  width: 100%;
  height: 100px;
  z-index: 10;
  background: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(33, 255, 0, 0.04) 50%, rgba(0,0,0,0) 100%);
  opacity: 0.1;
  position: absolute;
  bottom: 100%;
  animation: scanline 10s linear infinite;
  pointer-events: none;
}

@keyframes scanline {
  0% { bottom: 100%; }
  100% { bottom: -100px; }
}

.terminal-content {
  width: 800px;
  max-width: 90%;
  z-index: 5;
  text-shadow: 0 0 5px #33ff00, 0 0 10px #33ff00; /* Glow effect */
}

/* Boot Sequence */
.boot-sequence {
  padding: 2rem;
}

.boot-line {
  margin: 0.2rem 0;
  opacity: 0.8;
}

/* Login Interface */
.ascii-logo pre {
  font-family: 'VT323', monospace;
  font-size: 1rem;
  line-height: 1;
  margin-bottom: 2rem;
  color: #33ff00;
  white-space: pre-wrap;
  overflow-x: hidden;
}

.system-status {
  border-bottom: 2px dashed #33ff00;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
}

.system-status p {
  margin: 0.5rem 0;
}

.input-group {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.prompt {
  color: #00ccff; /* Blue prompt for contrast */
  margin-right: 0.5rem;
}

.cmd-label {
  margin-right: 0.5rem;
}

.terminal-input {
  background: transparent;
  border: none;
  color: #fff;
  font-family: 'VT323', monospace;
  font-size: 1.5rem;
  flex: 1;
  outline: none;
  text-shadow: 0 0 5px #fff;
}

.terminal-actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
}

.term-btn {
  background: transparent;
  border: 1px solid #33ff00;
  color: #33ff00;
  font-family: 'VT323', monospace;
  font-size: 1.2rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.2s;
  text-shadow: 0 0 5px #33ff00;
}

.term-btn:hover {
  background: #33ff00;
  color: #000;
  box-shadow: 0 0 20px #33ff00;
}

.term-btn.secondary {
  border-color: #00ccff;
  color: #00ccff;
  text-shadow: 0 0 5px #00ccff;
}

.term-btn.secondary:hover {
  background: #00ccff;
  color: #000;
  box-shadow: 0 0 20px #00ccff;
}

.term-btn.warning {
  border-color: #ff3300;
  color: #ff3300;
  text-shadow: 0 0 5px #ff3300;
}

.term-btn.warning:hover {
  background: #ff3300;
  color: #000;
  box-shadow: 0 0 20px #ff3300;
}

.system-message {
  margin-top: 2rem;
  color: #ffaa00;
  min-height: 2rem;
}

.blink {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Responsiveness */
@media (max-width: 600px) {
  .ascii-logo pre {
    font-size: 0.6rem;
  }
  .terminal-content {
    font-size: 1.2rem;
  }
}
</style>
