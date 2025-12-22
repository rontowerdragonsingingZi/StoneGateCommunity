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
                                    
       FUTURE GADGET LABORATORY
</pre>
        </div>

        <div class="system-status">
          <p>> SYSTEM: ONLINE</p>
          <p>> CONNECTION: ENCRYPTED (SG-VPN)</p>
          <p>> DIVERGENCE: 1.048596%</p>
        </div>

        <div class="auth-form">
          <div class="input-group">
            <span class="prompt">root@fg-lab:~$</span>
            <span class="cmd-label">codename:</span>
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
            <span class="cmd-label">passphrase:</span>
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
            <button class="term-btn" @click="handleLogin">[ EXECUTE ]</button>
            <button class="term-btn secondary" @click="toggleMode">[ SWITCH_MODE ]</button>
            <button class="term-btn warning" @click="$router.push('/')">[ ABORT ]</button>
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
  "BIOS Date 07/28/10 15:24:12 Ver: 08.00.10",
  "CPU: Amadeus Neural Engine @ 128THz",
  "Checking Memory...",
  "Memory Test: 65536K OK",
  "Detecting Primary Master... IBN 5100",
  "Detecting Secondary Master... Amadeus System",
  "Loading OS...",
  "Initializing Divergence Meter drivers...",
  "Connecting to World Line 1.048596...",
  "Connection Established.",
  "System Ready."
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

const handleLogin = () => {
  if (!loginForm.username || !loginForm.password) {
    message.value = "ERROR: Credentials required."
    return
  }
  
  message.value = "Authenticating..."
  setTimeout(() => {
    if (loginForm.username === 'Okabe' || true) { // Mock logic
      message.value = "Access Granted. Welcome, Labmem."
      setTimeout(() => {
        router.push('/')
      }, 1000)
    }
  }, 800)
}

const toggleMode = () => {
  message.value = "COMMAND NOT RECOGNIZED: Registration disabled by Organization."
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
