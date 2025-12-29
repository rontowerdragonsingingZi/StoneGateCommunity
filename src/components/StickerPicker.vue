<template>
  <div class="sticker-picker" v-if="visible" @click.stop>
    <!-- 标签页 -->
    <div class="sticker-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
      <button class="tab-btn upload-btn" @click="triggerUpload(false)">
        + 上传
      </button>
      <button v-if="isAdmin" class="tab-btn admin-upload-btn" @click="triggerUpload(true)">
        + 默认
      </button>
    </div>

    <!-- 表情网格 -->
    <div class="sticker-grid" @scroll="handleScroll">
      <template v-if="loading">
        <div class="loading-text">加载中...</div>
      </template>
      <template v-else-if="currentStickers.length === 0">
        <div class="empty-text">
          {{ activeTab === 'public' ? '暂无公开表情' : '暂无表情' }}
        </div>
      </template>
      <template v-else>
        <div 
          v-for="sticker in currentStickers" 
          :key="sticker.id"
          class="sticker-item"
          @click="selectSticker(sticker)"
          @contextmenu.prevent="showContextMenu($event, sticker)"
        >
          <img :src="sticker.url" :alt="sticker.name" :title="sticker.name" />
          <!-- 收藏标记 -->
          <span v-if="isCollected(sticker.id)" class="collected-mark">★</span>
        </div>
      </template>
    </div>

    <!-- 右键菜单 -->
    <div 
      v-if="contextMenu.visible" 
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    >
      <template v-if="contextMenu.sticker">
        <!-- 系统表情或他人公开表情可收藏 -->
        <button 
          v-if="canCollect(contextMenu.sticker)"
          @click="handleCollect(contextMenu.sticker)"
        >
          {{ isCollected(contextMenu.sticker.id) ? '取消收藏' : '收藏表情' }}
        </button>
        <!-- 自己的表情可删除 -->
        <button 
          v-if="contextMenu.sticker.user_id === currentUserId"
          @click="handleDelete(contextMenu.sticker)"
          class="delete-btn"
        >
          删除表情
        </button>
      </template>
    </div>

    <!-- 隐藏的文件输入 -->
    <input 
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileSelect"
    />
    <input 
      ref="adminFileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleAdminFileSelect"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { getStickers, uploadSticker, uploadDefaultSticker, collectSticker, uncollectSticker, deleteSticker } from '../api/sticker'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'close'])

const tabs = [
  { key: 'default', label: '默认' },
  { key: 'mine', label: '我的' },
]

const activeTab = ref('default')
const loading = ref(false)
const stickers = ref({
  default: [],
  mine: []
})
const collectedIds = ref(new Set())
const currentUserId = ref(null)
const currentUserName = ref(null)
const fileInput = ref(null)
const adminFileInput = ref(null)

// 是否为管理员
const isAdmin = computed(() => currentUserName.value === 'admin')

// 右键菜单
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  sticker: null
})

// 当前显示的表情
const currentStickers = computed(() => {
  return stickers.value[activeTab.value] || []
})

// 加载表情
const loadStickers = async () => {
  loading.value = true
  try {
    const res = await getStickers()
    if (res.code === 200) {
      stickers.value.default = res.data.default || []
      stickers.value.mine = res.data.mine || []
      // 更新收藏ID集合（mine中包含收藏的表情）
      collectedIds.value = new Set(
        stickers.value.mine
          .filter(s => s.is_collected)
          .map(s => s.id)
      )
    }
  } catch (err) {
    console.error('Failed to load stickers:', err)
  } finally {
    loading.value = false
  }
}

// 选择表情
const selectSticker = (sticker) => {
  emit('select', sticker)
  emit('close')
}

// 是否可以收藏
const canCollect = (sticker) => {
  return sticker.user_id !== currentUserId.value
}

// 是否已收藏
const isCollected = (id) => {
  return collectedIds.value.has(id)
}

// 显示右键菜单
const showContextMenu = (e, sticker) => {
  contextMenu.value = {
    visible: true,
    x: e.clientX,
    y: e.clientY,
    sticker
  }
}

// 隐藏右键菜单
const hideContextMenu = () => {
  contextMenu.value.visible = false
  contextMenu.value.sticker = null
}

// 收藏/取消收藏
const handleCollect = async (sticker) => {
  try {
    if (isCollected(sticker.id)) {
      await uncollectSticker(sticker.id)
      collectedIds.value.delete(sticker.id)
      stickers.value.collected = stickers.value.collected.filter(s => s.id !== sticker.id)
    } else {
      await collectSticker(sticker.id)
      collectedIds.value.add(sticker.id)
      stickers.value.collected.push(sticker)
    }
  } catch (err) {
    console.error('Collect error:', err)
    alert(err.response?.data?.message || '操作失败')
  }
  hideContextMenu()
}

// 删除表情
const handleDelete = async (sticker) => {
  if (!confirm('确定删除这个表情吗？')) return
  
  try {
    await deleteSticker(sticker.id)
    stickers.value.mine = stickers.value.mine.filter(s => s.id !== sticker.id)
  } catch (err) {
    console.error('Delete error:', err)
    alert(err.response?.data?.message || '删除失败')
  }
  hideContextMenu()
}

// 触发上传
const triggerUpload = (isAdminUpload = false) => {
  if (isAdminUpload) {
    adminFileInput.value?.click()
  } else {
    fileInput.value?.click()
  }
}

// 普通用户文件选择处理
const handleFileSelect = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    alert('表情图片不能超过 2MB')
    e.target.value = ''
    return
  }

  loading.value = true
  try {
    const res = await uploadSticker(file)
    if (res.code === 201) {
      stickers.value.mine.unshift(res.data)
      activeTab.value = 'mine'
    }
  } catch (err) {
    console.error('Upload error:', err)
    alert(err.response?.data?.message || '上传失败')
  } finally {
    loading.value = false
    e.target.value = ''
  }
}

// 管理员上传默认表情处理
const handleAdminFileSelect = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    alert('表情图片不能超过 2MB')
    e.target.value = ''
    return
  }

  loading.value = true
  try {
    const res = await uploadDefaultSticker(file)
    if (res.code === 201) {
      stickers.value.default.unshift(res.data)
      activeTab.value = 'default'
      alert('默认表情上传成功')
    }
  } catch (err) {
    console.error('Admin upload error:', err)
    alert(err.response?.data?.message || '上传失败')
  } finally {
    loading.value = false
    e.target.value = ''
  }
}

// 监听显示状态
watch(() => props.visible, (visible) => {
  if (visible) {
    loadStickers()
    // 获取当前用户信息
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    currentUserId.value = user.id
    currentUserName.value = user.name
  }
})

// 点击外部关闭菜单
const handleClickOutside = () => {
  hideContextMenu()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.sticker-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 320px;
  height: 280px;
  background: #161b22;
  border: 1px solid #30363d;
  display: flex;
  flex-direction: column;
  z-index: 100;
  margin-bottom: 8px;
}

.sticker-tabs {
  display: flex;
  border-bottom: 1px solid #30363d;
  padding: 4px;
  gap: 4px;
  flex-shrink: 0;
}

.tab-btn {
  flex: 1;
  padding: 6px 8px;
  background: transparent;
  border: 1px solid transparent;
  color: #8b949e;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #c9d1d9;
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  color: #58a6ff;
  border-color: #30363d;
  background: rgba(88, 166, 255, 0.1);
}

.upload-btn {
  flex: none;
  color: #238636;
  border-color: #238636;
}

.upload-btn:hover {
  background: rgba(35, 134, 54, 0.2);
}

.admin-upload-btn {
  flex: none;
  color: #f0883e;
  border-color: #f0883e;
}

.admin-upload-btn:hover {
  background: rgba(240, 136, 62, 0.2);
}

.sticker-grid {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  align-content: start;
}

.sticker-item {
  position: relative;
  aspect-ratio: 1;
  background: #0d1117;
  border: 1px solid #30363d;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.sticker-item:hover {
  border-color: #58a6ff;
  transform: scale(1.05);
}

.sticker-item img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.collected-mark {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 10px;
  color: #f0883e;
}

.loading-text,
.empty-text {
  grid-column: 1 / -1;
  text-align: center;
  color: #8b949e;
  padding: 40px 0;
  font-size: 13px;
}

.context-menu {
  position: fixed;
  background: #21262d;
  border: 1px solid #30363d;
  z-index: 1000;
  min-width: 100px;
}

.context-menu button {
  display: block;
  width: 100%;
  padding: 8px 16px;
  background: transparent;
  border: none;
  color: #c9d1d9;
  font-family: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}

.context-menu button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.context-menu .delete-btn {
  color: #f85149;
}

.context-menu .delete-btn:hover {
  background: rgba(248, 81, 73, 0.2);
}
</style>
