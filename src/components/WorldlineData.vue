<template>
  <div class="worldline-container">
    <div class="worldline-header">
      <div class="header-left">
        <span class="status-dot"></span>
        <span class="title">DIVERGENCE_METER::MONITORING</span>
      </div>
      <div class="header-right">
        <span class="divergence-value">{{ divergenceValue }}</span>
      </div>
    </div>
    
    <div ref="canvasContainer" class="canvas-container"></div>
    
    <div class="worldline-footer">
      <div class="info-row">
        <span class="label">ATTRACTOR_FIELD:</span>
        <span class="value" :class="attractorClass">{{ attractorField }}</span>
      </div>
      <div class="info-row">
        <span class="label">STATUS:</span>
        <span class="value status-active">ACTIVE_OBSERVATION</span>
      </div>
      <div class="info-row">
        <span class="label">LAST_UPDATE:</span>
        <span class="value">{{ lastUpdate }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as THREE from 'three'

const canvasContainer = ref(null)
const divergenceValue = ref('1.048596')
const lastUpdate = ref('--:--:--')

// 根据变动率判断吸引子场
const attractorField = computed(() => {
  const val = parseFloat(divergenceValue.value)
  if (val < 1) return 'ALPHA'
  if (val >= 1 && val < 2) return 'BETA'
  return 'UNKNOWN'
})

const attractorClass = computed(() => {
  const field = attractorField.value
  if (field === 'ALPHA') return 'field-alpha'
  if (field === 'BETA') return 'field-beta'
  return 'field-unknown'
})

let scene, camera, renderer, lines = []
let animationId = null
let dataPoints = []
const maxPoints = 100

// 生成随机变动率
const generateDivergence = () => {
  const base = 1.048596
  const variation = (Math.random() - 0.5) * 0.0001
  return (base + variation).toFixed(6)
}

// 更新时间
const updateTime = () => {
  const now = new Date()
  lastUpdate.value = now.toTimeString().split(' ')[0]
}

// 初始化 Three.js 场景
const initScene = () => {
  const container = canvasContainer.value
  if (!container) return

  const width = container.clientWidth
  const height = container.clientHeight

  // 场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a0f)

  // 相机
  camera = new THREE.OrthographicCamera(
    -width / 2, width / 2,
    height / 2, -height / 2,
    0.1, 1000
  )
  camera.position.z = 100

  // 渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.appendChild(renderer.domElement)

  // 初始化数据点
  for (let i = 0; i < maxPoints; i++) {
    dataPoints.push({
      value: 0.5 + Math.random() * 0.3,
      targetValue: 0.5 + Math.random() * 0.3
    })
  }

  // 创建网格线
  createGrid(width, height)
  
  // 创建 K 线
  createKLines(width, height)

  // 添加扫描线效果
  createScanLine(width, height)
}

// 创建网格背景
const createGrid = (width, height) => {
  const gridMaterial = new THREE.LineBasicMaterial({ 
    color: 0x1a1a2e,
    transparent: true,
    opacity: 0.5
  })

  // 水平线
  for (let i = -height / 2; i <= height / 2; i += 30) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-width / 2, i, 0),
      new THREE.Vector3(width / 2, i, 0)
    ])
    const line = new THREE.Line(geometry, gridMaterial)
    scene.add(line)
  }

  // 垂直线
  for (let i = -width / 2; i <= width / 2; i += 30) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(i, -height / 2, 0),
      new THREE.Vector3(i, height / 2, 0)
    ])
    const line = new THREE.Line(geometry, gridMaterial)
    scene.add(line)
  }
}

// 创建 K 线
const createKLines = (width, height) => {
  const barWidth = width / maxPoints
  const maxHeight = height * 0.8

  for (let i = 0; i < maxPoints; i++) {
    // K线柱体
    const geometry = new THREE.PlaneGeometry(barWidth * 0.6, 1)
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x58a6ff,
      transparent: true,
      opacity: 0.8
    })
    const bar = new THREE.Mesh(geometry, material)
    
    const x = -width / 2 + i * barWidth + barWidth / 2
    bar.position.set(x, 0, 0)
    
    lines.push({
      mesh: bar,
      index: i,
      maxHeight: maxHeight
    })
    
    scene.add(bar)
  }
}

// 创建扫描线
const createScanLine = (width, height) => {
  const geometry = new THREE.PlaneGeometry(3, height)
  const material = new THREE.MeshBasicMaterial({
    color: 0x58a6ff,
    transparent: true,
    opacity: 0.3
  })
  const scanLine = new THREE.Mesh(geometry, material)
  scanLine.position.set(-width / 2, 0, 1)
  scanLine.userData.isScanLine = true
  scanLine.userData.width = width
  scene.add(scanLine)
}

// 动画循环
const animate = () => {
  animationId = requestAnimationFrame(animate)

  // 更新数据点
  dataPoints.forEach((point, i) => {
    // 平滑过渡到目标值
    point.value += (point.targetValue - point.value) * 0.1
    
    // 随机更新目标值
    if (Math.random() < 0.05) {
      point.targetValue = 0.3 + Math.random() * 0.5
    }
  })

  // 更新 K 线高度
  lines.forEach((line, i) => {
    const height = dataPoints[i].value * line.maxHeight
    line.mesh.scale.y = height
    line.mesh.position.y = -line.maxHeight / 2 + height / 2
    
    // 根据高度变化颜色
    const hue = 0.55 + dataPoints[i].value * 0.15 // 蓝色到青色
    line.mesh.material.color.setHSL(hue, 0.8, 0.5)
  })

  // 更新扫描线
  scene.children.forEach(child => {
    if (child.userData.isScanLine) {
      child.position.x += 3
      if (child.position.x > child.userData.width / 2) {
        child.position.x = -child.userData.width / 2
        
        // 扫描线经过时更新变动率
        divergenceValue.value = generateDivergence()
        updateTime()
      }
    }
  })

  renderer.render(scene, camera)
}

// 处理窗口大小变化
const handleResize = () => {
  if (!canvasContainer.value || !renderer) return
  
  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight
  
  camera.left = -width / 2
  camera.right = width / 2
  camera.top = height / 2
  camera.bottom = -height / 2
  camera.updateProjectionMatrix()
  
  renderer.setSize(width, height)
}

onMounted(() => {
  initScene()
  animate()
  updateTime()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
  
  if (renderer) {
    renderer.dispose()
    canvasContainer.value?.removeChild(renderer.domElement)
  }
})
</script>

<style scoped>
.worldline-container {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  overflow: hidden;
  font-family: 'JetBrains Mono', monospace;
}

.worldline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #30363d;
  background: #161b22;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #238636;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(35, 134, 54, 0.7); }
  50% { opacity: 0.8; box-shadow: 0 0 0 6px rgba(35, 134, 54, 0); }
}

.title {
  font-size: 12px;
  color: #8b949e;
  letter-spacing: 1px;
}

.divergence-value {
  font-size: 24px;
  font-weight: bold;
  color: #58a6ff;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(88, 166, 255, 0.5);
}

.canvas-container {
  width: 100%;
  height: 300px;
  position: relative;
}

.worldline-footer {
  padding: 16px 20px;
  border-top: 1px solid #30363d;
  background: #161b22;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #484f58;
}

.value {
  color: #8b949e;
}

.field-alpha {
  color: #f0883e;
}

.field-beta {
  color: #58a6ff;
}

.field-unknown {
  color: #f85149;
}

.status-active {
  color: #238636;
}
</style>
