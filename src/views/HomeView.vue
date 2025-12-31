<template>
  <div class="home-container">
    <!-- Fixed Background -->
    <div class="canvas-layer" ref="threeContainer"></div>

    <!-- Scrollable Content -->
    <div class="content-layer">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="divergence-meter">
          <div class="meter-value">
            <span class="digit">1</span>
            <span class="dot">.</span>
            <span class="digit">0</span>
            <span class="digit">4</span>
            <span class="digit">8</span>
            <span class="digit">5</span>
            <span class="digit">9</span>
            <span class="digit">6</span>
          </div>
          <div class="meter-label">变动率仪表</div>
        </div>

        <div class="hero-text-area">
          <h1 class="main-title">
            <span class="zh">石头门社区</span>
            <span class="en">STEINS;GATE COMMUNITY</span>
          </h1>
          <div class="decoration-line"></div>
          <p class="slogan">宇宙虽有起始，却无终结。—— 无限。</p>
        </div>

        <div class="action-area">
          <button class="cyber-btn primary" @click="$router.push('/community')">
            <span class="btn-content">进入社区</span>
          </button>
          <button class="cyber-btn secondary" @click="scrollToContent">
            <span class="btn-content">数据日志</span>
          </button>
        </div>
        
        <div class="scroll-indicator">
          <span>向下滚动</span>
          <div class="scroll-line"></div>
        </div>
      </section>

      <!-- Story Section -->
      <section class="info-section" id="story">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">阿玛迪斯计划</h2>
            <div class="section-line"></div>
          </div>
          <div class="story-content">
            <div class="story-text">
              <p>“宇宙有着开始，但没有终结。—— 无限。”</p>
              <p>这里是世界线收束范围 α 与 β 之外的观测站。我们记录着每一次微小的变动，无论是 IBN 5100 的下落，还是金属乌帕的丢失。</p>
              <p>加入 Future Gadget Lab，成为 Labmem，共同探索未知的领域。</p>
            </div>
            <div class="story-graphic">
              <!-- Simple CSS Graphic representing a Gear -->
              <div class="gear-spinner"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="info-section dark-bg">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">实验室功能</h2>
            <div class="section-line"></div>
          </div>
          <div class="feature-grid">
            <div class="feature-card timeline-card">
              <div class="card-border"></div>
              <div class="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M3 12h3l3-9 6 18 3-9h3" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 12h20" stroke-opacity="0.2" stroke-dasharray="2 2"/>
                </svg>
              </div>
              <h3>时间线观测</h3>
              <p>实时监控世界线变动率，记录每一次 Butterfly Effect。</p>
              <div class="card-decor"></div>
            </div>
            
            <div class="feature-card gadget-card">
              <div class="card-border"></div>
              <div class="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </div>
              <h3>未来道具</h3>
              <p>分享你的发明创造，无论是微波炉还是时间跳跃机。</p>
              <div class="card-decor"></div>
            </div>
            
            <div class="feature-card amadeus-card">
              <div class="card-border"></div>
              <div class="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                   <rect x="4" y="4" width="16" height="16" rx="2" />
                   <rect x="9" y="9" width="6" height="6" />
                   <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
                </svg>
              </div>
              <h3>阿玛迪斯系统</h3>
              <p>与 AI 助手进行对话，获取来自未来的建议。</p>
              <div class="card-decor"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="home-footer">
        <p>El Psy Kongroo.</p>
        <p class="copyright">&copy; 2010-2025 Future Gadget Laboratory</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'

defineOptions({ name: 'HomeView' })
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const threeContainer = ref(null)
let scene, camera, renderer, composer
let lines, particles
let mouseX = 0, mouseY = 0

onMounted(() => {
  initThree()
  animate()
  
  // Simple Intersection Observer for fade-in effects
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.info-section').forEach(section => {
    observer.observe(section)
  })
})

onBeforeUnmount(() => {
  if (renderer) renderer.dispose()
  if (composer) composer.dispose()
  window.removeEventListener('mousemove', onDocumentMouseMove)
  window.removeEventListener('resize', onWindowResize)
})

function scrollToContent() {
  document.getElementById('story').scrollIntoView({ behavior: 'smooth' })
}

function initThree() {
  const width = window.innerWidth
  const height = window.innerHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x050505)
  scene.fog = new THREE.FogExp2(0x050505, 0.0015)

  camera = new THREE.PerspectiveCamera(60, width / height, 1, 2000)
  camera.position.z = 400

  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  
  if (threeContainer.value) {
    threeContainer.value.appendChild(renderer.domElement)
  }

  createNetwork()

  const renderScene = new RenderPass(scene, camera)
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.5, 0.4, 0.85)
  bloomPass.threshold = 0.1
  bloomPass.strength = 0.6
  bloomPass.radius = 0.5

  composer = new EffectComposer(renderer)
  composer.addPass(renderScene)
  composer.addPass(bloomPass)

  document.addEventListener('mousemove', onDocumentMouseMove)
  window.addEventListener('resize', onWindowResize)
}

function createNetwork() {
  const particleCount = 600
  const r = 800
  const geometry = new THREE.BufferGeometry()
  const positions = []
  
  for (let i = 0; i < particleCount; i++) {
    const x = Math.random() * r - r / 2
    const y = Math.random() * r - r / 2
    const z = Math.random() * r - r / 2
    positions.push(x, y, z)
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  
  const pMaterial = new THREE.PointsMaterial({
    color: 0x00aaff,
    size: 2,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.6
  })
  
  particles = new THREE.Points(geometry, pMaterial)
  scene.add(particles)
  
  const wiregeo = new THREE.IcosahedronGeometry(300, 2)
  const wireMat = new THREE.MeshBasicMaterial({ 
    color: 0x222222, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.05
  })
  const wireMesh = new THREE.Mesh(wiregeo, wireMat)
  scene.add(wireMesh)
  lines = wireMesh
}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - window.innerWidth / 2) * 0.1
  mouseY = (event.clientY - window.innerHeight / 2) * 0.1
}

function onWindowResize() {
  if (!camera || !renderer || !composer) return
  const width = window.innerWidth
  const height = window.innerHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  composer.setSize(width, height)
}

function animate() {
  requestAnimationFrame(animate)
  
  if (particles) {
    particles.rotation.y += 0.0005
    particles.rotation.x += 0.0002
  }
  if (lines) {
    lines.rotation.y -= 0.001
    lines.rotation.x -= 0.0005
  }

  camera.position.x += (mouseX - camera.position.x) * 0.05
  camera.position.y += (-mouseY - camera.position.y) * 0.05
  camera.lookAt(scene.position)

  composer.render()
}
</script>

<style scoped>
.home-container {
  width: 100%;
  min-height: 100vh;
  position: relative;
  background: #000;
  font-family: 'Share Tech Mono', monospace;
  overflow-x: hidden;
}

.canvas-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 0;
}

.content-layer {
  position: relative;
  z-index: 10;
  width: 100%;
}

/* Hero Section */
.hero-section {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.divergence-meter {
  margin-bottom: 3rem;
  text-align: center;
}

.meter-value {
  font-size: 5rem;
  color: #ffaa00;
  text-shadow: 0 0 20px rgba(255, 170, 0, 0.6), 0 0 40px rgba(255, 170, 0, 0.3);
  letter-spacing: 0.5rem;
  font-weight: bold;
}

.meter-label {
  font-size: 1rem;
  color: rgba(255, 170, 0, 0.5);
  letter-spacing: 0.2rem;
  margin-top: 0.5rem;
  text-transform: uppercase;
}

.hero-text-area {
  text-align: center;
  margin-bottom: 4rem;
  color: #fff;
}

.main-title {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.zh {
  font-size: 3rem;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  letter-spacing: 1rem;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  margin-bottom: 0.5rem;
}

.en {
  font-size: 1.2rem;
  letter-spacing: 0.8rem;
  opacity: 0.7;
}

.decoration-line {
  width: 2px;
  height: 40px;
  background: linear-gradient(to bottom, #fff, transparent);
  margin: 1.5rem auto;
}

.slogan {
  font-size: 1rem;
  opacity: 0.6;
  font-style: italic;
  font-family: 'Cinzel', serif;
}

.action-area {
  display: flex;
  gap: 2rem;
}

.cyber-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 1rem 2.5rem;
  font-family: 'Share Tech Mono', monospace;
  font-size: 1.1rem;
  letter-spacing: 0.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  clip-path: polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%);
}

.cyber-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  letter-spacing: 0.3rem;
}

.cyber-btn.primary {
  border-color: #00aaff;
  color: #00aaff;
}

.cyber-btn.primary:hover {
  background: rgba(0, 170, 255, 0.1);
  box-shadow: 0 0 20px rgba(0, 170, 255, 0.4);
}

.scroll-indicator {
  position: absolute;
  bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.8rem;
  letter-spacing: 0.2rem;
  animation: float 2s infinite ease-in-out;
}

.scroll-line {
  width: 1px;
  height: 30px;
  background: linear-gradient(to bottom, #fff, transparent);
  margin-top: 10px;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(10px); }
}

/* Info Sections */
.info-section {
  padding: 6rem 2rem;
  background: rgba(0, 0, 0, 0.6); /* Semi-transparent to show three.js background */
  backdrop-filter: blur(5px);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  opacity: 0;
  transform: translateY(20px);
  transition: all 1s ease;
}

.info-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.section-header {
  margin-bottom: 4rem;
  text-align: center;
}

.section-title {
  font-size: 2rem;
  color: #fff;
  letter-spacing: 0.5rem;
  font-family: 'Cinzel', serif;
}

.section-line {
  width: 60px;
  height: 2px;
  background: #00aaff;
  margin: 1rem auto;
}

/* Story Content */
.story-content {
  display: flex;
  align-items: center;
  gap: 4rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  line-height: 1.8;
}

.story-text {
  flex: 1;
}

.story-graphic {
  flex: 1;
  display: flex;
  justify-content: center;
}

.gear-spinner {
  width: 100px;
  height: 100px;
  border: 2px dashed #00aaff;
  border-radius: 50%;
  animation: spin 10s linear infinite;
  position: relative;
}

.gear-spinner::before {
  content: '';
  position: absolute;
  top: 10%;
  left: 10%;
  right: 10%;
  bottom: 10%;
  border: 2px dotted #ffaa00;
  border-radius: 50%;
  animation: spin 5s linear infinite reverse;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Feature Grid */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 3rem;
  padding: 0 1rem;
}

.feature-card {
  position: relative;
  background: rgba(10, 10, 12, 0.6);
  padding: 3rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  clip-path: polygon(
    20px 0, 100% 0, 
    100% calc(100% - 20px), calc(100% - 20px) 100%, 
    0 100%, 0 20px
  );
}

/* 动态发光边框效果 */
.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    45deg, 
    transparent 40%, 
    rgba(0, 170, 255, 0.1) 45%, 
    rgba(0, 170, 255, 0.3) 50%, 
    rgba(0, 170, 255, 0.1) 55%, 
    transparent 60%
  );
  background-size: 200% 200%;
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
  z-index: 1;
}

/* 扫描线效果 */
.feature-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 170, 255, 0.05) 3px,
    rgba(0, 170, 255, 0.05) 4px
  );
  opacity: 0;
  pointer-events: none;
  z-index: 1;
  transition: opacity 0.4s;
}

.feature-card:hover {
  transform: translateY(-5px) scale(1.02);
  border-color: rgba(0, 170, 255, 0.5);
  box-shadow: 0 0 30px rgba(0, 170, 255, 0.1);
  background: rgba(0, 170, 255, 0.05);
}

.feature-card:hover::before {
  opacity: 1;
  animation: shine 1.5s infinite linear;
}

.feature-card:hover::after {
  opacity: 1;
}

/* 特殊卡片颜色定制 */
.feature-card.gadget-card:hover {
  border-color: rgba(255, 170, 0, 0.5); /* 橙色 */
  box-shadow: 0 0 30px rgba(255, 170, 0, 0.1);
  background: rgba(255, 170, 0, 0.05);
}
.feature-card.gadget-card:hover::after {
  background: repeating-linear-gradient(
    0deg, transparent, transparent 2px,
    rgba(255, 170, 0, 0.05) 3px, rgba(255, 170, 0, 0.05) 4px
  );
}

.feature-card.amadeus-card:hover {
  border-color: rgba(255, 0, 100, 0.5); /* 红色 */
  box-shadow: 0 0 30px rgba(255, 0, 100, 0.1);
  background: rgba(255, 0, 100, 0.05);
}
.feature-card.amadeus-card:hover::after {
  background: repeating-linear-gradient(
    0deg, transparent, transparent 2px,
    rgba(255, 0, 100, 0.05) 3px, rgba(255, 0, 100, 0.05) 4px
  );
}

.card-icon {
  font-size: 0; /* Clear font space */
  width: 60px;
  height: 60px;
  margin: 0 auto 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.4s ease;
  position: relative;
  z-index: 2;
}

.card-icon svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 5px rgba(255,255,255,0.3));
}

.feature-card:hover .card-icon {
  color: #00aaff;
  transform: scale(1.1);
  filter: drop-shadow(0 0 10px #00aaff);
}

.gadget-card:hover .card-icon {
  color: #ffaa00;
  filter: drop-shadow(0 0 10px #ffaa00);
  animation: spin 4s linear infinite;
}

.amadeus-card:hover .card-icon {
  color: #ff0066;
  filter: drop-shadow(0 0 10px #ff0066);
  animation: pulse 1s ease-in-out infinite alternate;
}

.feature-card h3 {
  color: #fff;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  letter-spacing: 0.2rem;
  font-family: 'Share Tech Mono', monospace;
  position: relative;
  z-index: 2;
  transition: color 0.3s;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  line-height: 1.6;
  position: relative;
  z-index: 2;
  transition: color 0.3s;
}

.feature-card:hover h3 { color: #fff; text-shadow: 0 0 5px currentColor; }
.feature-card:hover p { color: rgba(255, 255, 255, 0.9); }

/* Card Decor */
.card-decor {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 20px;
  height: 20px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  border-right: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.feature-card:hover .card-decor {
  width: calc(100% - 20px);
  height: calc(100% - 20px);
  border-color: inherit;
  opacity: 0.5;
}

@keyframes shine {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes pulse {
  from { transform: scale(1); opacity: 0.8; }
  to { transform: scale(1.1); opacity: 1; }
}

/* Footer */
.home-footer {
  text-align: center;
  padding: 3rem;
  background: #000;
  border-top: 1px solid #222;
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .meter-value { font-size: 3rem; }
  .zh { font-size: 2rem; letter-spacing: 0.5rem; }
  .en { font-size: 0.9rem; }
  .story-content { flex-direction: column; text-align: center; }
}
</style>
