<template>
  <a-modal
    :visible="visible"
    title="转发给好友"
    :width="480"
    :footer="false"
    @cancel="handleClose"
    modal-class="share-post-modal"
  >
    <!-- 帖子卡片预览 -->
    <div class="post-preview" v-if="post">
      <div class="preview-cover" v-if="post.cover">
        <img :src="post.cover" :alt="post.title" />
      </div>
      <div class="preview-info">
        <div class="preview-title">{{ post.title }}</div>
        <div class="preview-meta">
          <span class="preview-author">@{{ post.user?.name || 'Unknown' }}</span>
          <span class="preview-tag">[{{ post.tag }}]</span>
        </div>
      </div>
    </div>

    <!-- 附言输入 -->
    <div class="message-input">
      <input
        v-model="message"
        type="text"
        placeholder="添加一条附言（可选）"
        maxlength="500"
      />
    </div>

    <!-- 好友列表 -->
    <div class="friends-section">
      <div class="section-title">选择好友</div>
      
      <div v-if="loading" class="loading-hint">
        加载中...
      </div>
      <div v-else-if="friends.length === 0" class="empty-hint">
        暂无好友，快去添加吧
      </div>
      <div v-else class="friends-list">
        <div
          v-for="item in friends"
          :key="item.friend.id"
          class="friend-item"
          :class="{ selected: selectedIds.includes(item.friend.id) }"
          @click="toggleSelect(item.friend.id)"
        >
          <a-avatar :size="36" :image-url="item.friend.avatar">
            {{ item.friend.name?.charAt(0).toUpperCase() }}
          </a-avatar>
          <div class="friend-info">
            <div class="friend-name">{{ item.friend.name }}</div>
            <div class="friend-hint" v-if="item.last_message">
              {{ formatLastMessage(item.last_message) }}
            </div>
          </div>
          <div class="check-icon" v-if="selectedIds.includes(item.friend.id)">
            ✓
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="panel-footer">
      <span class="selected-count">已选择 {{ selectedIds.length }} 人</span>
      <a-button
        type="primary"
        :disabled="selectedIds.length === 0 || sending"
        :loading="sending"
        @click="handleSend"
      >
        {{ sending ? '发送中...' : '发送' }}
      </a-button>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { get, post } from '../api/request'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  post: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'success'])

const friends = ref([])
const loading = ref(false)
const selectedIds = ref([])
const message = ref('')
const sending = ref(false)

// 获取好友/会话列表
const loadConversations = async () => {
  loading.value = true
  try {
    const res = await get('/private-chat/conversations')
    if (res.code === 200) {
      friends.value = res.data || []
    }
  } catch (e) {
    console.error('获取会话列表失败', e)
  } finally {
    loading.value = false
  }
}

// 监听弹窗打开
watch(() => props.visible, (val) => {
  if (val) {
    selectedIds.value = []
    message.value = ''
    loadConversations()
  }
})

// 切换选择
const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx > -1) {
    selectedIds.value.splice(idx, 1)
  } else {
    if (selectedIds.value.length >= 10) {
      Message.warning('最多选择10位好友')
      return
    }
    selectedIds.value.push(id)
  }
}

// 格式化最近消息
const formatLastMessage = (msg) => {
  if (!msg) return ''
  if (msg.type === 'post_share') return '[帖子分享]'
  if (msg.type === 'image') return '[图片]'
  if (msg.type === 'sticker') return '[表情]'
  const content = msg.content || ''
  return content.length > 20 ? content.slice(0, 20) + '...' : content
}

// 发送转发
const handleSend = async () => {
  if (selectedIds.value.length === 0 || !props.post?.id) return
  
  sending.value = true
  try {
    const res = await post('/private-chat/forward-post', {
      friend_ids: selectedIds.value,
      post_id: props.post.id,
      message: message.value.trim() || null
    })
    
    if (res.code === 200) {
      Message.success(res.message || '转发成功')
      emit('success', res.data)
      handleClose()
    } else {
      Message.error(res.message || '转发失败')
    }
  } catch (e) {
    console.error('转发失败', e)
    Message.error('转发失败，请重试')
  } finally {
    sending.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
.post-preview {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  margin-bottom: 16px;
}

.preview-cover {
  width: 80px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.preview-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
  color: #c9d1d9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-meta {
  font-size: 12px;
  color: #8b949e;
  margin-top: 4px;
}

.preview-author {
  color: #58a6ff;
  margin-right: 8px;
}

.preview-tag {
  color: #7ee787;
}

.message-input {
  margin-bottom: 16px;
}

.message-input input {
  width: 100%;
  padding: 10px 12px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #c9d1d9;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.message-input input:focus {
  border-color: #58a6ff;
}

.message-input input::placeholder {
  color: #484f58;
}

.friends-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 12px;
  color: #8b949e;
  margin-bottom: 8px;
  font-weight: 600;
}

.loading-hint,
.empty-hint {
  padding: 24px;
  text-align: center;
  color: #8b949e;
  font-size: 13px;
}

.friends-list {
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid #30363d;
  border-radius: 6px;
}

.friend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #21262d;
}

.friend-item:last-child {
  border-bottom: none;
}

.friend-item:hover {
  background: rgba(88, 166, 255, 0.1);
}

.friend-item.selected {
  background: rgba(35, 134, 54, 0.2);
}

.friend-info {
  flex: 1;
  min-width: 0;
}

.friend-name {
  font-size: 14px;
  color: #c9d1d9;
  font-weight: 500;
}

.friend-hint {
  font-size: 12px;
  color: #8b949e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.check-icon {
  width: 20px;
  height: 20px;
  background: #238636;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: bold;
}

.panel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #30363d;
}

.selected-count {
  font-size: 13px;
  color: #8b949e;
}
</style>

<style>
/* 全局样式覆盖弹窗 */
.share-post-modal .arco-modal-header {
  background: #161b22;
  border-bottom: 1px solid #30363d;
}

.share-post-modal .arco-modal-title {
  color: #c9d1d9;
}

.share-post-modal .arco-modal-body {
  background: #0d1117;
}

.share-post-modal .arco-modal-close-btn {
  color: #8b949e;
}

.share-post-modal .arco-modal-close-btn:hover {
  color: #c9d1d9;
}
</style>
