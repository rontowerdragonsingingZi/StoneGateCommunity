<template>
  <div class="image-hosting-panel">
    <!-- 顶部状态 -->
    <div class="hosting-header">
      <div class="storage-info">
        <span class="label">STORAGE_USAGE:</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 42%"></div>
        </div>
        <span class="value">42% (2.1GB / 5.0GB)</span>
      </div>
      <div class="action-buttons">
        <button class="tool-btn" @click="triggerUpload">
          <icon-upload /> UPLOAD_IMAGE
        </button>
      </div>
    </div>

    <!-- 上传区域 (拖拽) -->
    <div 
      class="upload-zone"
      :class="{ dragging: isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerUpload"
    >
      <input 
        type="file" 
        ref="fileInput" 
        multiple 
        accept="image/*" 
        style="display: none"
        @change="handleFileSelect"
      />
      <div class="zone-content">
        <icon-upload :size="48" class="upload-icon" />
        <p class="zone-text">DRAG & DROP IMAGES HERE</p>
        <p class="zone-subtext">OR CLICK TO SELECT FILES</p>
      </div>
    </div>

    <!-- 上传确认弹窗 -->
    <TerminalConfirm
      v-model:visible="showUploadConfirm"
      type="info"
      title="CONFIRM UPLOAD"
      :loading="isUploading"
      confirm-text="开始传输"
      loading-text="传输中..."
      @confirm="confirmUpload"
      @cancel="cancelUpload"
    >
      <div class="upload-preview">
        <p class="preview-title">> 即将上传 {{ pendingFiles.length }} 个文件到 R2 世界线:</p>
        <ul class="file-list">
          <li v-for="(file, idx) in pendingFiles" :key="idx" class="file-item">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </li>
        </ul>
        <p class="upload-hint">支持格式: JPG, PNG, GIF, WebP, AVIF (最大 10MB)</p>
      </div>
    </TerminalConfirm>

    <!-- 上传结果弹窗 -->
    <TerminalConfirm
      v-model:visible="showResultDialog"
      :type="uploadResult.success ? 'info' : 'danger'"
      :title="uploadResult.success ? 'UPLOAD COMPLETE' : 'UPLOAD FAILED'"
      confirm-text="确认"
      cancel-text=""
      @confirm="showResultDialog = false"
    >
      <div class="result-content">
        <p v-if="uploadResult.success">> 金属乌帕已成功穿越至 R2 世界线</p>
        <p v-else>> 传输失败: {{ uploadResult.message }}</p>
        <div v-if="uploadResult.success && uploadResult.url" class="result-url">
          <span class="url-label">URL:</span>
          <code class="url-value">{{ uploadResult.url }}</code>
          <button class="copy-btn" @click="copyLink(uploadResult.url)">复制</button>
        </div>
      </div>
    </TerminalConfirm>

    <!-- 图片网格 -->
    <div class="image-grid">
      <div v-for="img in imageList" :key="img.id" class="image-card">
        <div class="image-wrapper">
          <img :src="img.url" :alt="img.name" loading="lazy" />
          <div class="image-overlay">
            <button class="overlay-btn" @click="copyLink(img.url)">
              <icon-copy />
            </button>
            <button class="overlay-btn delete" @click="deleteImage(img.id)">
              <icon-delete />
            </button>
          </div>
        </div>
        <div class="image-meta">
          <div class="image-name" :title="img.name">{{ img.name }}</div>
          <div class="image-info">
            <span class="size">{{ img.size }}</span>
            <span class="date">{{ img.date }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { 
  IconUpload, IconCopy, IconDelete 
} from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import { uploadImage, getImages } from '../api/upload'
import TerminalConfirm from './TerminalConfirm.vue'

const isDragging = ref(false)
const fileInput = ref(null)
const showUploadConfirm = ref(false)
const showResultDialog = ref(false)
const isUploading = ref(false)
const pendingFiles = ref([])
const uploadResult = reactive({
  success: false,
  message: '',
  url: ''
})

const imageList = ref([])
const isLoading = ref(false)
const currentPage = ref(1)
const totalImages = ref(0)
const perPage = 50

// 加载图片列表
const loadImages = async (page = 1) => {
  isLoading.value = true
  try {
    const res = await getImages({ folder: 'community', per_page: perPage, page, deep: 1 })
    
    if (res.code === 200 && res.data) {
      totalImages.value = res.data.total || 0
      currentPage.value = res.data.page || 1
      
      // 转换数据格式
      imageList.value = (res.data.items || []).map((item, idx) => ({
        id: item.key || idx,
        url: item.url || '',
        name: item.key ? item.key.split('/').pop() : 'unknown',
        size: '',
        date: extractDateFromKey(item.key)
      })).filter(img => img.url) // 过滤掉没有URL的
    }
  } catch (error) {
    Message.error('加载图片列表失败')
    console.error('Load images error:', error)
  } finally {
    isLoading.value = false
  }
}

// 从 key 中提取日期
const extractDateFromKey = (key) => {
  if (!key) return ''
  // key 格式: folder/2025/12/23/xxx.jpg
  const match = key.match(/(\d{4})\/(\d{2})\/(\d{2})/)
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`
  }
  return ''
}

onMounted(() => {
  loadImages()
})

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = (e) => {
  const files = e.target.files
  if (files.length > 0) {
    prepareUpload(Array.from(files))
  }
  e.target.value = ''
}

const handleDrop = (e) => {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    prepareUpload(Array.from(files))
  }
}

// 准备上传：验证文件并显示确认弹窗
const prepareUpload = (files) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
  const validFiles = []
  
  for (const file of files) {
    if (!validTypes.includes(file.type)) {
      Message.error(`不支持的文件类型: ${file.name}`)
      continue
    }
    if (file.size > 10 * 1024 * 1024) {
      Message.error(`文件过大: ${file.name} (最大10MB)`)
      continue
    }
    validFiles.push(file)
  }
  
  if (validFiles.length > 0) {
    pendingFiles.value = validFiles
    showUploadConfirm.value = true
  }
}

// 取消上传
const cancelUpload = () => {
  pendingFiles.value = []
  showUploadConfirm.value = false
}

// 确认上传
const confirmUpload = async () => {
  isUploading.value = true
  let lastUrl = ''
  let hasSuccess = false
  let lastError = ''
  
  for (const file of pendingFiles.value) {
    try {
      const res = await uploadImage(file, 'community')
      
      if (res.code === 201) {
        hasSuccess = true
        lastUrl = res.data.url
      } else {
        lastError = res.message || '上传失败'
      }
    } catch (error) {
      lastError = '网络错误: 无法连接到服务器'
      console.error('Upload error:', error)
    }
  }
  
  // 设置结果
  if (hasSuccess) {
    uploadResult.success = true
    uploadResult.message = '上传成功'
    uploadResult.url = lastUrl
    // 刷新列表
    loadImages(1)
  } else {
    uploadResult.success = false
    uploadResult.message = lastError
    uploadResult.url = ''
  }
  
  isUploading.value = false
  showUploadConfirm.value = false
  pendingFiles.value = []
  showResultDialog.value = true
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB'
}

const copyLink = (url) => {
  navigator.clipboard.writeText(url)
  Message.success('LINK COPIED TO CLIPBOARD')
}

const deleteImage = (id) => {
  imageList.value = imageList.value.filter(img => img.id !== id)
  Message.success('IMAGE DELETED')
}
</script>

<style scoped>
.image-hosting-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.hosting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #161b22;
  border: 1px solid #30363d;
  padding: 12px 20px;
  border-radius: 6px;
}

.storage-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #8b949e;
  flex: 1;
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: #21262d;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #238636;
  border-radius: 4px;
}

.tool-btn {
  background: #238636;
  border: 1px solid rgba(240, 246, 252, 0.1);
  color: #ffffff;
  padding: 6px 16px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-btn:hover { background: #2ea043; }

.upload-zone {
  border: 2px dashed #30363d;
  border-radius: 6px;
  padding: 40px;
  text-align: center;
  background: #0d1117;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-zone:hover, .upload-zone.dragging {
  border-color: #58a6ff;
  background: #161b22;
}

.upload-icon {
  color: #8b949e;
  margin-bottom: 12px;
}

.zone-text {
  color: #c9d1d9;
  font-weight: 600;
  margin: 0;
}

.zone-subtext {
  color: #8b949e;
  font-size: 12px;
  margin: 4px 0 0;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.image-card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  overflow: hidden;
  transition: transform 0.2s;
}

.image-card:hover {
  transform: translateY(-2px);
  border-color: #58a6ff;
}

.image-wrapper {
  position: relative;
  aspect-ratio: 16/9;
  background: #0d1117;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(13, 17, 23, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-card:hover .image-overlay {
  opacity: 1;
}

.overlay-btn {
  background: transparent;
  border: 1px solid #58a6ff;
  color: #58a6ff;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-btn:hover {
  background: #58a6ff;
  color: #0d1117;
}

.overlay-btn.delete {
  border-color: #da3633;
  color: #da3633;
}

.overlay-btn.delete:hover {
  background: #da3633;
  color: #ffffff;
}

.image-meta {
  padding: 8px 12px;
}

.image-name {
  font-size: 13px;
  color: #c9d1d9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.image-info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #8b949e;
}

/* 上传确认弹窗内容样式 */
.upload-preview {
  font-family: 'JetBrains Mono', monospace;
}

.preview-title {
  color: #58a6ff;
  margin: 0 0 12px;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
  max-height: 200px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(88, 166, 255, 0.1);
  border-left: 2px solid #58a6ff;
  margin-bottom: 4px;
}

.file-name {
  color: #c9d1d9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.file-size {
  color: #8b949e;
  margin-left: 12px;
}

.upload-hint {
  color: #8b949e;
  font-size: 12px;
  margin: 0;
}

/* 上传结果弹窗样式 */
.result-content p {
  margin: 0 0 12px;
}

.result-url {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #0d1117;
  padding: 10px;
  border: 1px solid #30363d;
  border-radius: 4px;
}

.url-label {
  color: #8b949e;
}

.url-value {
  flex: 1;
  color: #7ee787;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: transparent;
}

.copy-btn {
  background: #238636;
  border: none;
  color: #fff;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
}

.copy-btn:hover {
  background: #2ea043;
}
</style>
