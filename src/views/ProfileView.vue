<template>
  <div class="terminal-container">
    <div class="crt-overlay"></div>
    <div class="scanline"></div>
    
    <div class="terminal-content">
      <!-- 顶部状态栏 -->
      <div class="system-header">
        <div class="header-left">
           <span class="sys-text">FUTURE GADGET LAB MEMBER SYSTEM</span>
           <span class="sys-version">v1.048596</span>
        </div>
        <div class="header-right">
           <span class="status-indicator">ONLINE</span>
        </div>
      </div>

      <div class="profile-interface" v-if="userStore.user">
        <!-- 左侧：头像与编号 -->
        <div class="profile-sidebar">
          <div class="avatar-frame" :class="{ editable: isEditing }" @click="handleAvatarClick">
            <div class="avatar-corner tl"></div>
            <div class="avatar-corner tr"></div>
            <div class="avatar-corner bl"></div>
            <div class="avatar-corner br"></div>
            <img :src="previewAvatar || userStore.user.avatar || '/default.png'" alt="Avatar" class="profile-avatar" />
            <div class="scan-effect"></div>
            <!-- 编辑模式下的覆盖层 -->
            <div v-if="isEditing" class="avatar-edit-overlay">
              <span class="edit-icon">▲ UPLOAD</span>
            </div>
          </div>
          <input 
            ref="fileInput" 
            type="file" 
            accept="image/*" 
            style="display: none" 
            @change="handleFileSelect" 
          />
          <div class="labmem-badge">
            <span class="label">LABMEM NO.</span>
            <span class="value">{{ formatLabmemId(userStore.user.id) }}</span>
          </div>
        </div>

        <!-- 头像预览弹窗 -->
        <div v-if="showAvatarPreview" class="avatar-preview-overlay" @click="showAvatarPreview = false">
          <div class="avatar-preview-container">
            <div class="preview-header">
              > IMAGE_VIEWER <span class="close-hint">[ CLICK TO CLOSE ]</span>
            </div>
            <div class="preview-frame">
              <img :src="userStore.user.avatar || '/default.png'" alt="Avatar Preview" />
            </div>
          </div>
        </div>

        <!-- 右侧：详细数据 -->
        <div class="profile-data">
          <!-- 查看模式 -->
          <template v-if="!isEditing">
            <div class="data-section">
              <div class="section-title">> SUBJECT_DATA</div>
              
              <div class="data-row">
                <span class="data-label">CODE NAME_</span>
                <span class="data-value highlight">{{ userStore.user.name }}</span>
              </div>
              
              <div class="data-row">
                <span class="data-label">D-MAIL ADDR_</span>
                <span class="data-value">{{ userStore.user.email || 'UNKNOWN' }}</span>
              </div>

              <div class="data-row">
                <span class="data-label">GENDER_</span>
                <span class="data-value">{{ formatGender(userStore.user.gender) }}</span>
              </div>

              <div class="data-row">
                <span class="data-label">CONTACT_</span>
                <span class="data-value">{{ userStore.user.contact || 'ENCRYPTED' }}</span>
              </div>
            </div>

            <div class="data-section">
              <div class="section-title">> TIMELINE_RECORD</div>
              <div class="data-row">
                <span class="data-label">FIRST OBSERVED_</span>
                <span class="data-value">{{ formatDate(userStore.user.created_at) }}</span>
              </div>
              <div class="data-row">
                <span class="data-label">LAST DIVERGENCE_</span>
                <span class="data-value">{{ formatDate(userStore.user.updated_at) }}</span>
              </div>
            </div>

            <div class="action-bar">
              <button class="term-btn back" @click="$router.push('/')">[ 返回观测 ]</button>
              <button class="term-btn" @click="startEdit">[ 修改数据 ]</button>
              <button class="term-btn danger" @click="showDeleteConfirm = true">[ 注销身份 ]</button>
            </div>
          </template>

          <!-- 编辑模式 -->
          <template v-else>
            <div class="data-section">
              <div class="section-title">> MODIFY_DATA <span class="blink">_</span></div>
              
              <div class="data-row edit-row">
                <span class="data-label">CODE NAME_</span>
                <input v-model="editForm.name" class="terminal-input" spellcheck="false" />
              </div>
              
              <div class="data-row edit-row">
                <span class="data-label">D-MAIL ADDR_</span>
                <input v-model="editForm.email" class="terminal-input" spellcheck="false" />
              </div>

              <div class="data-row edit-row">
                <span class="data-label">GENDER_</span>
                <select v-model="editForm.gender" class="terminal-select">
                  <option value="">UNDEFINED</option>
                  <option value="male">MALE (男)</option>
                  <option value="female">FEMALE (女)</option>
                  <option value="other">OTHER (其他)</option>
                </select>
              </div>

              <div class="data-row edit-row">
                <span class="data-label">CONTACT_</span>
                <input v-model="editForm.contact" class="terminal-input" spellcheck="false" />
              </div>

              <div class="data-row edit-row">
                <span class="data-label">NEW PASSWORD_</span>
                <input v-model="editForm.password" type="password" class="terminal-input" placeholder="留空则不修改" spellcheck="false" />
              </div>
            </div>

            <div v-if="message" class="system-message" :class="{ error: isError }">
              > {{ message }}<span class="blink">_</span>
            </div>

            <div class="action-bar">
              <button class="term-btn warning" @click="cancelEdit">[ 取消 ]</button>
              <button class="term-btn" @click="saveChanges" :disabled="isSaving">[ {{ isSaving ? '传输中...' : '确认修改' }} ]</button>
            </div>
          </template>

          <!-- 删除确认弹窗 -->
          <TerminalConfirm
            v-model:visible="showDeleteConfirm"
            type="danger"
            title="WARNING: CRITICAL OPERATION"
            :content="['此操作将从当前世界线永久删除您的 Labmem 身份。', '无法通过 D-Mail 撒回。是否确认？']"
            confirm-text="确认注销"
            loading-text="删除中..."
            :loading="isDeleting"
            @confirm="deleteAccount"
          />
        </div>
      </div>

      <div v-else class="loading-screen">
        <p>> 正在检索 Labmem 数据...</p>
        <p class="blink">_</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import { ref, reactive, onMounted } from 'vue'
import { updateUser, deleteUser } from '../api/user'
import TerminalConfirm from '../components/TerminalConfirm.vue'

const userStore = useUserStore()
const router = useRouter()

// 状态
const isEditing = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const showDeleteConfirm = ref(false)
const showAvatarPreview = ref(false)
const message = ref('')
const isError = ref(false)
const fileInput = ref(null)
const previewAvatar = ref(null)
const avatarFile = ref(null)

// 编辑表单
const editForm = reactive({
  name: '',
  email: '',
  gender: '',
  contact: '',
  password: ''
})

const formatLabmemId = (id) => {
  if (!id) return '000'
  return id.toString().padStart(3, '0')
}

const formatGender = (gender) => {
  const map = {
    'male': 'MALE (男)',
    'female': 'FEMALE (女)',
    'other': 'OTHER (其他)'
  }
  return map[gender] || 'UNDEFINED'
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'UNKNOWN'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
}

// 头像点击处理
const handleAvatarClick = () => {
  if (isEditing.value) {
    // 编辑模式：触发文件选择
    fileInput.value?.click()
  } else {
    // 查看模式：放大预览
    showAvatarPreview.value = true
  }
}

// 文件选择处理
const handleFileSelect = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    message.value = '错误: 请选择图片文件'
    isError.value = true
    return
  }
  
  // 验证文件大小 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    message.value = '错误: 图片大小不能超过5MB'
    isError.value = true
    return
  }
  
  avatarFile.value = file
  // 创建预览URL
  previewAvatar.value = URL.createObjectURL(file)
  message.value = '头像已选择，保存后生效'
  isError.value = false
}

const startEdit = () => {
  const user = userStore.user
  editForm.name = user.name || ''
  editForm.email = user.email || ''
  editForm.gender = user.gender || ''
  editForm.contact = user.contact || ''
  editForm.password = ''
  message.value = ''
  isError.value = false
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  message.value = ''
  // 清理头像预览
  if (previewAvatar.value) {
    URL.revokeObjectURL(previewAvatar.value)
    previewAvatar.value = null
  }
  avatarFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const saveChanges = async () => {
  isSaving.value = true
  message.value = '正在向世界线发送数据...'
  isError.value = false

  try {
    // 只发送有变化的字段
    const data = {}
    if (editForm.name && editForm.name !== userStore.user.name) data.name = editForm.name
    if (editForm.email !== (userStore.user.email || '')) data.email = editForm.email
    if (editForm.gender !== (userStore.user.gender || '')) data.gender = editForm.gender
    if (editForm.contact !== (userStore.user.contact || '')) data.contact = editForm.contact
    if (editForm.password) {
      if (editForm.password.length < 6) {
        message.value = '错误: D-Mail 密钥至少需要6位'
        isError.value = true
        isSaving.value = false
        return
      }
      data.password = editForm.password
    }

    // 检查是否有头像更新
    if (avatarFile.value) {
      // TODO: 如果后端支持文件上传，这里需要先上传图片获取URL
      // 目前假设后端接受 base64 或图片路径
      message.value = '头像上传功能待对接后端API'
      // data.avatar = uploadedUrl
    }

    if (Object.keys(data).length === 0 && !avatarFile.value) {
      message.value = '未检测到数据变动'
      isSaving.value = false
      return
    }

    const res = await updateUser(userStore.user.id, data)
    
    if (res.code === 200) {
      message.value = res.message || 'Labmem 信息已在世界线中更新'
      userStore.login(res.data) // 更新本地存储
      // 清理头像预览
      if (previewAvatar.value) {
        URL.revokeObjectURL(previewAvatar.value)
        previewAvatar.value = null
      }
      avatarFile.value = null
      setTimeout(() => {
        isEditing.value = false
        message.value = ''
      }, 1500)
    } else {
      message.value = res.message || '更新失败'
      isError.value = true
    }
  } catch (error) {
    message.value = '网络错误: 无法连接到服务器'
    isError.value = true
    console.error('Update error:', error)
  } finally {
    isSaving.value = false
  }
}

const deleteAccount = async () => {
  isDeleting.value = true

  try {
    const res = await deleteUser(userStore.user.id)
    
    if (res.code === 200) {
      userStore.logout()
      router.push('/login')
    } else {
      message.value = res.message || '注销失败'
      isError.value = true
      showDeleteConfirm.value = false
    }
  } catch (error) {
    message.value = '网络错误: 无法连接到服务器'
    isError.value = true
    showDeleteConfirm.value = false
    console.error('Delete error:', error)
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  if (!userStore.user) {
    router.push('/login')
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=VT323&display=swap');

.terminal-container {
  background-color: #000;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  font-family: 'Share Tech Mono', monospace;
  color: #33ff00;
  font-size: 1.2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 复用 CRT 效果 */
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
  width: 900px;
  max-width: 95%;
  z-index: 5;
  border: 1px solid #1a331a;
  background: rgba(0, 10, 0, 0.8);
  padding: 2rem;
  box-shadow: 0 0 20px rgba(51, 255, 0, 0.1);
  position: relative;
}

/* 顶部状态栏 */
.system-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 2px solid #33ff00;
  padding-bottom: 0.5rem;
  margin-bottom: 2rem;
  text-shadow: 0 0 5px #33ff00;
}

.sys-version {
  font-size: 0.8rem;
  margin-left: 1rem;
  opacity: 0.7;
}

.status-indicator {
  animation: blink 2s infinite;
}

/* 布局 */
.profile-interface {
  display: flex;
  gap: 3rem;
  flex-wrap: wrap;
}

.profile-sidebar {
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 头像框 */
.avatar-frame {
  width: 180px;
  height: 180px;
  position: relative;
  border: 1px solid rgba(51, 255, 0, 0.3);
  padding: 5px;
  margin-bottom: 1rem;
  cursor: pointer;
  overflow: hidden;
}

.avatar-frame.editable {
  border-color: #00ccff;
}

.avatar-frame.editable:hover {
  border-color: #00ccff;
  box-shadow: 0 0 15px rgba(0, 204, 255, 0.3);
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(80%) sepia(20%) hue-rotate(90deg) contrast(1.2);
  transition: all 0.5s;
}

.avatar-frame:hover .profile-avatar {
  filter: grayscale(50%) sepia(10%) hue-rotate(90deg) contrast(1.1);
}

.avatar-corner {
  position: absolute;
  width: 10px;
  height: 10px;
  border: 2px solid #33ff00;
  transition: all 0.3s;
  z-index: 2;
}

.avatar-frame.editable .avatar-corner {
  border-color: #00ccff;
}

.tl { top: -2px; left: -2px; border-right: none; border-bottom: none; }
.tr { top: -2px; right: -2px; border-left: none; border-bottom: none; }
.bl { bottom: -2px; left: -2px; border-right: none; border-top: none; }
.br { bottom: -2px; right: -2px; border-left: none; border-top: none; }

.avatar-frame:hover .avatar-corner {
  width: 100%;
  height: 100%;
  opacity: 0.5;
}

/* 编辑模式覆盖层 */
.avatar-edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-frame.editable:hover .avatar-edit-overlay {
  opacity: 1;
}

.edit-icon {
  color: #00ccff;
  font-size: 1rem;
  text-shadow: 0 0 10px rgba(0, 204, 255, 0.8);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* 头像预览弹窗 */
.avatar-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: pointer;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.avatar-preview-container {
  max-width: 90vw;
  max-height: 90vh;
}

.preview-header {
  color: #33ff00;
  margin-bottom: 1rem;
  font-size: 1rem;
  text-shadow: 0 0 5px #33ff00;
}

.close-hint {
  color: rgba(51, 255, 0, 0.5);
  font-size: 0.8rem;
  margin-left: 1rem;
}

.preview-frame {
  border: 2px solid #33ff00;
  padding: 10px;
  background: rgba(0, 10, 0, 0.8);
  box-shadow: 0 0 30px rgba(51, 255, 0, 0.2);
}

.preview-frame img {
  max-width: 70vw;
  max-height: 70vh;
  display: block;
}

.labmem-badge {
  background: #33ff00;
  color: #000;
  padding: 0.2rem 1rem;
  font-weight: bold;
  font-family: 'VT323', monospace;
  font-size: 1.5rem;
  text-align: center;
  width: 100%;
  clip-path: polygon(10% 0, 100% 0, 100% 100%, 0% 100%);
}

.labmem-badge .label {
  display: block;
  font-size: 0.8rem;
  line-height: 1;
}

/* 数据区域 */
.profile-data {
  flex: 1;
}

.section-title {
  color: #00ccff;
  border-bottom: 1px dashed #00ccff;
  margin-bottom: 1rem;
  padding-bottom: 0.2rem;
  text-shadow: 0 0 5px rgba(0, 204, 255, 0.5);
}

.data-row {
  display: flex;
  margin-bottom: 0.8rem;
  align-items: baseline;
}

.data-label {
  width: 150px;
  color: rgba(51, 255, 0, 0.7);
  font-size: 1rem;
}

.data-value {
  flex: 1;
  color: #fff;
  border-bottom: 1px solid rgba(51, 255, 0, 0.1);
  padding-bottom: 2px;
}

.data-value.highlight {
  color: #33ff00;
  font-size: 1.4rem;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(51, 255, 0, 0.5);
}

.action-bar {
  margin-top: 3rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.term-btn {
  background: transparent;
  border: 1px solid #33ff00;
  color: #33ff00;
  font-family: 'Share Tech Mono', monospace;
  font-size: 1rem;
  padding: 0.5rem 1.5rem;
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
  border-color: #ffaa00;
  color: #ffaa00;
  text-shadow: 0 0 5px #ffaa00;
}

.term-btn.warning:hover {
  background: #ffaa00;
  color: #000;
  box-shadow: 0 0 20px #ffaa00;
}

.term-btn.danger {
  border-color: #ff3300;
  color: #ff3300;
  text-shadow: 0 0 5px #ff3300;
}

.term-btn.danger:hover {
  background: #ff3300;
  color: #000;
  box-shadow: 0 0 20px #ff3300;
}

.term-btn.back {
  border-color: #00ccff;
  color: #00ccff;
  text-shadow: 0 0 5px #00ccff;
}

.term-btn.back:hover {
  background: #00ccff;
  color: #000;
  box-shadow: 0 0 20px #00ccff;
}

.term-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 编辑模式输入框 */
.edit-row {
  align-items: center;
}

.terminal-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(51, 255, 0, 0.3);
  color: #33ff00;
  font-family: 'Share Tech Mono', monospace;
  font-size: 1rem;
  padding: 0.4rem 0.6rem;
  outline: none;
  transition: all 0.2s;
}

.terminal-input:focus {
  border-color: #33ff00;
  box-shadow: 0 0 10px rgba(51, 255, 0, 0.3);
}

.terminal-input::placeholder {
  color: rgba(51, 255, 0, 0.4);
}

.terminal-select {
  flex: 1;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(51, 255, 0, 0.3);
  color: #33ff00;
  font-family: 'Share Tech Mono', monospace;
  font-size: 1rem;
  padding: 0.4rem 0.6rem;
  outline: none;
  cursor: pointer;
}

.terminal-select option {
  background: #000;
  color: #33ff00;
}

/* 系统消息 */
.system-message {
  margin-top: 1.5rem;
  color: #ffaa00;
  padding: 0.5rem;
  border-left: 2px solid #ffaa00;
}

.system-message.error {
  color: #ff3300;
  border-left-color: #ff3300;
}

.blink {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@media (max-width: 768px) {
  .profile-interface {
    flex-direction: column;
    align-items: center;
  }
  
  .profile-sidebar {
    width: 100%;
  }
}
</style>
