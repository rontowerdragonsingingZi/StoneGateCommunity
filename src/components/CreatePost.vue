<template>
  <div class="create-post-container">
    <!-- 头部 -->
    <div class="post-header">
      <button class="back-btn" @click="$emit('back')">
        <span class="arrow">&lt;&lt;</span> BACK
      </button>
      <div class="header-info">
        <span class="header-tag">[NEW_LOG]</span>
        <h2 class="header-title">OBSERVATION_RECORD</h2>
      </div>
    </div>

    <!-- 表单区域 -->
    <div class="post-form">
      <div class="form-section">
        <div class="input-row">
          <span class="prompt">TITLE &gt;</span>
          <input 
            v-model="form.title" 
            type="text" 
            class="terminal-input"
            placeholder="输入观测日志标题..."
            maxlength="200"
          />
        </div>
        <div class="char-count">{{ form.title.length }}/200</div>
      </div>

      <div class="form-section">
        <div class="input-row">
          <span class="prompt">TAG &gt;</span>
          <div class="tag-selector">
            <button 
              v-for="tag in tags" 
              :key="tag.value"
              class="tag-btn"
              :class="{ active: form.tag === tag.value }"
              @click="form.tag = tag.value"
            >
              [{{ tag.label }}]
            </button>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="input-row">
          <span class="prompt">COVER &gt;</span>
          <div class="upload-area">
            <input 
              ref="fileInput"
              type="file" 
              accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
              class="file-input"
              @change="handleFileSelect"
            />
            <button 
              type="button" 
              class="upload-btn" 
              :disabled="uploading"
              @click="$refs.fileInput.click()"
            >
              <span v-if="uploading">[UPLOADING... {{ uploadProgress }}%]</span>
              <span v-else-if="form.cover">[CHANGE_IMAGE]</span>
              <span v-else>[SELECT_IMAGE]</span>
            </button>
            <span class="upload-hint">// jpg/png/gif/webp, ≤ 50MB</span>
          </div>
        </div>
        <div v-if="form.cover" class="cover-preview">
          <img :src="form.cover" @error="coverError = true" @load="coverError = false" />
          <button v-if="!coverError" class="remove-btn" @click="removeCover">×</button>
          <span v-if="coverError" class="error-text">[IMAGE_LOAD_FAILED]</span>
        </div>
      </div>

      <div class="form-section content-section">
        <div class="content-header">
          <span class="prompt">CONTENT &gt;</span>
          <span class="hint">// 记录你的观测数据</span>
        </div>
        <textarea 
          v-model="form.content"
          class="terminal-textarea"
          placeholder="在此输入观测内容...&#10;&#10;支持详细描述你的发现、理论推测或任务记录。"
          rows="12"
        ></textarea>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <button class="action-btn cancel" @click="$emit('back')">
          [CANCEL]
        </button>
        <button 
          class="action-btn submit" 
          :disabled="!canSubmit || submitting"
          @click="handleSubmit"
        >
          <span v-if="submitting" class="loading-dots">SUBMITTING...</span>
          <span v-else>[SUBMIT_LOG]</span>
        </button>
      </div>

      <!-- 状态提示 -->
      <div v-if="statusMessage" class="status-bar" :class="statusType">
        >> {{ statusMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { createPost } from '../api/post'
import { uploadImage } from '../api/upload'
import { getToken } from '../api/request'

const emit = defineEmits(['back', 'created'])

const fileInput = ref(null)
const form = ref({
  title: '',
  content: '',
  cover: '',
  tag: 'GENERAL'
})

const tags = [
  { value: 'GENERAL', label: 'GENERAL' },
  { value: 'THEORY', label: 'THEORY' },
  { value: 'TECH', label: 'TECH' },
  { value: 'MISSION', label: 'MISSION' }
]

const submitting = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const coverError = ref(false)
const statusMessage = ref('')
const statusType = ref('info')

// 处理文件选择
const handleFileSelect = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  
  // 检查登录状态
  if (!getToken()) {
    statusMessage.value = 'AUTH_REQUIRED: 请先登录'
    statusType.value = 'error'
    return
  }
  
  // 校验文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
  if (!allowedTypes.includes(file.type)) {
    statusMessage.value = 'INVALID_FILE_TYPE: Only jpg/png/gif/webp/avif allowed'
    statusType.value = 'error'
    return
  }
  
  // 校验文件大小 (50MB)
  if (file.size > 50 * 1024 * 1024) {
    statusMessage.value = 'FILE_TOO_LARGE: Max 50MB allowed'
    statusType.value = 'error'
    return
  }
  
  uploading.value = true
  uploadProgress.value = 0
  statusMessage.value = 'UPLOADING_TO_R2...'
  statusType.value = 'info'
  
  // 模拟上传进度
  const progressInterval = setInterval(() => {
    if (uploadProgress.value < 90) {
      uploadProgress.value += Math.random() * 20
    }
  }, 200)
  
  try {
    const res = await uploadImage(file)
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    // 检查是否返回了有效 JSON
    if (typeof res !== 'object') {
      throw new Error('Server returned invalid response')
    }
    
    if (res.code === 201 && res.data?.url) {
      form.value.cover = res.data.url
      coverError.value = false
      statusMessage.value = 'IMAGE_UPLOADED_SUCCESSFULLY'
      statusType.value = 'success'
      setTimeout(() => {
        if (statusMessage.value === 'IMAGE_UPLOADED_SUCCESSFULLY') {
          statusMessage.value = ''
        }
      }, 2000)
    } else {
      statusMessage.value = res.message || 'UPLOAD_FAILED: ' + (res.code || 'Unknown error')
      statusType.value = 'error'
    }
  } catch (e) {
    clearInterval(progressInterval)
    console.error('上传失败', e)
    // 更友好的错误提示
    let errMsg = e.message || 'UNKNOWN'
    if (errMsg.includes('<!DOCTYPE') || errMsg.includes('not valid JSON')) {
      errMsg = 'SERVER_ERROR: 服务器返回异常，可能是文件过大或服务器错误'
    }
    statusMessage.value = errMsg
    statusType.value = 'error'
  } finally {
    uploading.value = false
    // 清空 input 以便再次选择同一文件
    if (fileInput.value) fileInput.value.value = ''
  }
}

// 移除封面
const removeCover = () => {
  form.value.cover = ''
  coverError.value = false
}

const canSubmit = computed(() => {
  return form.value.title.trim() && form.value.content.trim()
})

const handleSubmit = async () => {
  if (!canSubmit.value) return
  
  submitting.value = true
  statusMessage.value = 'UPLOADING_TO_WORLDLINE...'
  statusType.value = 'info'
  
  try {
    const data = {
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      tag: form.value.tag
    }
    if (form.value.cover.trim()) {
      data.cover = form.value.cover.trim()
    }
    
    const res = await createPost(data)
    if (res.code === 201 || res.code === 200) {
      statusMessage.value = 'LOG_RECORDED_SUCCESSFULLY. El Psy Kongroo.'
      statusType.value = 'success'
      setTimeout(() => {
        emit('created')
      }, 800)
    } else {
      statusMessage.value = res.message || 'SUBMISSION_FAILED'
      statusType.value = 'error'
    }
  } catch (e) {
    console.error('发布失败', e)
    statusMessage.value = 'CONNECTION_ERROR: ' + (e.message || 'UNKNOWN')
    statusType.value = 'error'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-post-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0d1117;
  color: #c9d1d9;
  font-family: 'JetBrains Mono', monospace;
  overflow-x: hidden;
}

/* Header */
.post-header {
  height: 60px;
  border-bottom: 1px solid #30363d;
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: #161b22;
  gap: 24px;
}

.back-btn {
  background: transparent;
  border: 1px solid #30363d;
  color: #8b949e;
  padding: 6px 12px;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: #58a6ff;
  color: #58a6ff;
}

.arrow {
  color: #58a6ff;
}

.header-info {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.header-tag {
  font-size: 12px;
  color: #7ee787;
  font-weight: bold;
}

.header-title {
  font-size: 16px;
  color: #c9d1d9;
  margin: 0;
  letter-spacing: 1px;
}

/* Form */
.post-form {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

.form-section {
  margin-bottom: 20px;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.prompt {
  color: #7ee787;
  font-size: 13px;
  font-weight: bold;
  min-width: 80px;
}

.terminal-input {
  flex: 1;
  background: #010409;
  border: 1px solid #30363d;
  color: #c9d1d9;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.terminal-input:focus {
  border-color: #58a6ff;
}

.terminal-input::placeholder {
  color: #484f58;
}

.char-count {
  text-align: right;
  font-size: 11px;
  color: #484f58;
  margin-top: 4px;
}

/* Tag Selector */
.tag-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-btn {
  background: transparent;
  border: 1px solid #30363d;
  color: #8b949e;
  padding: 6px 12px;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-btn:hover {
  border-color: #58a6ff;
  color: #58a6ff;
}

.tag-btn.active {
  background: #238636;
  border-color: #238636;
  color: #fff;
}

/* Upload Area */
.upload-area {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.file-input {
  display: none;
}

.upload-btn {
  background: #010409;
  border: 1px solid #30363d;
  color: #58a6ff;
  padding: 8px 16px;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn:hover:not(:disabled) {
  border-color: #58a6ff;
  background: rgba(88, 166, 255, 0.1);
}

.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-hint {
  color: #484f58;
  font-size: 11px;
}

/* Cover Preview */
.cover-preview {
  margin-top: 12px;
  margin-left: 92px;
  max-width: 300px;
  border: 1px solid #30363d;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.cover-preview img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.cover-preview .remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(248, 81, 73, 0.9);
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.cover-preview:hover .remove-btn {
  opacity: 1;
}

.error-text {
  display: block;
  padding: 20px;
  text-align: center;
  color: #f85149;
  font-size: 12px;
}

/* Content Section */
.content-section {
  flex: 1;
}

.content-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.hint {
  color: #484f58;
  font-size: 12px;
}

.terminal-textarea {
  width: 100%;
  box-sizing: border-box;
  background: #010409;
  border: 1px solid #30363d;
  color: #c9d1d9;
  padding: 14px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  outline: none;
  resize: vertical;
  min-height: 200px;
  transition: border-color 0.2s;
}

.terminal-textarea:focus {
  border-color: #58a6ff;
}

.terminal-textarea::placeholder {
  color: #484f58;
}

/* Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #30363d;
}

.action-btn {
  padding: 10px 20px;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.cancel {
  background: transparent;
  border: 1px solid #30363d;
  color: #8b949e;
}

.action-btn.cancel:hover {
  border-color: #f85149;
  color: #f85149;
}

.action-btn.submit {
  background: #238636;
  border: 1px solid #238636;
  color: #fff;
}

.action-btn.submit:hover:not(:disabled) {
  background: #2ea043;
}

.action-btn.submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-dots {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  50% { opacity: 0.5; }
}

/* Status Bar */
.status-bar {
  margin-top: 16px;
  padding: 12px 16px;
  font-size: 13px;
  border-left: 3px solid;
}

.status-bar.info {
  background: rgba(88, 166, 255, 0.1);
  border-color: #58a6ff;
  color: #58a6ff;
}

.status-bar.success {
  background: rgba(126, 231, 135, 0.1);
  border-color: #7ee787;
  color: #7ee787;
}

.status-bar.error {
  background: rgba(248, 81, 73, 0.1);
  border-color: #f85149;
  color: #f85149;
}
</style>
