<template>
  <div class="terminal-container">
    <div class="crt-overlay"></div>
    <div class="scanline"></div>
    
    <div class="terminal-content">
      <div class="login-interface">
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
          <p>> 状态: 招募新成员</p>
          <p>> 协议: 开放 (需要审核)</p>
          <p>> 变动率: 1.048596%</p>
        </div>

        <div class="auth-form">
          <div class="input-group">
            <span class="prompt">root@fg-lab:~$</span>
            <span class="cmd-label">代号:</span>
            <input 
              v-model="registerForm.username" 
              type="text" 
              class="terminal-input" 
              autofocus 
              spellcheck="false"
            />
          </div>
          <div class="input-group">
            <span class="prompt">root@fg-lab:~$</span>
            <span class="cmd-label">D-Mail:</span>
            <input 
              v-model="registerForm.email" 
              type="email" 
              class="terminal-input"
              spellcheck="false" 
            />
          </div>
          <div class="input-group">
            <span class="prompt">root@fg-lab:~$</span>
            <span class="cmd-label">密码:</span>
            <input 
              v-model="registerForm.password" 
              type="password" 
              class="terminal-input"
              spellcheck="false" 
            />
          </div>
           <div class="input-group">
            <span class="prompt">root@fg-lab:~$</span>
            <span class="cmd-label">确认:</span>
            <input 
              v-model="registerForm.confirmPassword" 
              type="password" 
              class="terminal-input"
              spellcheck="false" 
              @keyup.enter="handleRegister"
            />
          </div>
          
          <div class="terminal-actions">
            <button class="term-btn" @click="handleRegister">[ 提交申请 ]</button>
            <button class="term-btn warning" @click="$router.push('/login')">[ 返回登录 ]</button>
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../api/user'

const router = useRouter()
const message = ref('')

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleRegister = async () => {
  if (!registerForm.username || !registerForm.password) {
    message.value = "错误: 代号和密码为必填项。"
    return
  }
  
  if (registerForm.password.length < 6) {
    message.value = "错误: D-Mail密钥至少6位。"
    return
  }
  
  if (registerForm.password !== registerForm.confirmPassword) {
    message.value = "错误: 密码不匹配。"
    return
  }
  
  message.value = "正在加密数据并发送至未来..."
  
  try {
    const res = await register({
      name: registerForm.username,
      password: registerForm.password,
      email: registerForm.email || undefined
    })
    
    if (res.code === 201) {
      message.value = res.message || "欢迎加入Future Gadget Lab，Labmem注册完成"
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      message.value = res.message || "注册失败，请重试"
    }
  } catch (error) {
    message.value = "网络错误: 无法连接到服务器"
    console.error('Register error:', error)
  }
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
  min-width: 60px;
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
