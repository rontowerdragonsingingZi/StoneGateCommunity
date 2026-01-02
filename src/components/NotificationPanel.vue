<template>
  <div class="notification-panel">
    <!-- 通知铃铛按钮 -->
    <a-popover 
      trigger="click" 
      position="br"
      :popup-visible="visible"
      @update:popup-visible="handleVisibleChange"
      :content-style="{ padding: 0, width: '380px', background: 'transparent', border: 'none', boxShadow: 'none' }"
      :arrow-style="{ display: 'none' }"
    >
      <div class="notification-trigger">
        <a-badge :count="unreadTotal" :max-count="99" :dot="false" :offset="[-2, 2]">
          <svg class="bell-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C10.9 2 10 2.9 10 4V4.29C7.12 5.14 5 7.82 5 11V17L3 19V20H21V19L19 17V11C19 7.82 16.88 5.14 14 4.29V4C14 2.9 13.1 2 12 2ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z" fill="currentColor"/>
          </svg>
        </a-badge>
      </div>
      
      <template #content>
        <div class="notification-popover">
          <!-- 标签页 -->
          <div class="tab-header">
            <div 
              v-for="tab in tabs" 
              :key="tab.key"
              class="tab-item"
              :class="{ active: activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              <span class="tab-name">{{ tab.name }}</span>
              <a-badge 
                v-if="getTabCount(tab.key) > 0" 
                :count="getTabCount(tab.key)" 
                :max-count="99"
                class="tab-badge"
              />
            </div>
          </div>
          
          <!-- 操作栏 -->
          <div class="action-bar">
            <span class="unread-hint" v-if="unreadTotal > 0">{{ unreadTotal }} 条未读</span>
            <span class="unread-hint" v-else>暂无未读</span>
            <a-button type="text" size="mini" @click="handleMarkAllRead" :disabled="unreadTotal === 0">
              全部已读
            </a-button>
          </div>
          
          <!-- 通知列表 -->
          <div class="notification-list" ref="listRef" @scroll="handleScroll">
            <div v-if="loading && notifications.length === 0" class="loading-state">
              <a-spin />
              <span>加载中...</span>
            </div>
            
            <div v-else-if="notifications.length === 0" class="empty-state">
              <div class="empty-terminal">
                <span class="terminal-line">> NO_DATA_FOUND</span>
                <span class="terminal-hint">_暂无新通知</span>
              </div>
            </div>
            
            <div 
              v-else
              v-for="item in notifications" 
              :key="item.id"
              class="notification-item"
              :class="{ unread: !item.read_at }"
              @click="handleItemClick(item)"
            >
              <!-- 发送者头像 -->
              <a-avatar :size="36" :image-url="item.sender?.avatar" class="sender-avatar">
                {{ item.sender?.name?.charAt(0).toUpperCase() || '?' }}
              </a-avatar>
              
              <!-- 通知内容 -->
              <div class="notification-content">
                <div class="notification-text">
                  <span class="sender-name">{{ item.sender?.name || '系统' }}</span>
                  <span class="action-text">{{ getActionText(item) }}</span>
                </div>
                <div class="notification-detail" v-if="getDetailText(item)">
                  {{ getDetailText(item) }}
                </div>
                <div class="notification-time">{{ formatTime(item.created_at) }}</div>
              </div>
              
              <!-- 未读指示器 -->
              <div v-if="!item.read_at" class="unread-dot"></div>
            </div>
            
            <!-- 加载更多 -->
            <div v-if="loading && notifications.length > 0" class="loading-more">
              <a-spin size="small" />
            </div>
            <div v-if="!hasMore && notifications.length > 0" class="no-more">
              没有更多了
            </div>
          </div>
        </div>
      </template>
    </a-popover>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../api/notification'

const router = useRouter()
const visible = ref(false)
const loading = ref(false)
const notifications = ref([])
const unreadCounts = ref({ total: 0, by_type: {} })
const activeTab = ref('all')
const currentPage = ref(1)
const hasMore = ref(true)
const listRef = ref(null)

const tabs = [
  { key: 'all', name: '全部' },
  { key: 'like', name: '赞' },
  { key: 'comment', name: '评论' },
  { key: 'message', name: '消息' },
  { key: 'friend', name: '好友' }
]

const unreadTotal = computed(() => unreadCounts.value.total || 0)

const getTabCount = (tabKey) => {
  if (tabKey === 'all') return unreadCounts.value.total || 0
  return unreadCounts.value.by_type?.[tabKey] || 0
}

// 监听标签变化
watch(activeTab, () => {
  notifications.value = []
  currentPage.value = 1
  hasMore.value = true
  loadNotifications()
})

// 监听弹窗显示
watch(visible, (val) => {
  if (val) {
    loadNotifications()
    loadUnreadCount()
  }
})

onMounted(() => {
  // 初始加载未读数量
  loadUnreadCount()
  // 定时轮询未读数（每30秒）
  setInterval(loadUnreadCount, 30000)
})

// 加载未读数量
async function loadUnreadCount() {
  try {
    const res = await getUnreadCount()
    if (res.code === 200) {
      unreadCounts.value = res.data
    }
  } catch (e) {
    console.error('Failed to load unread count:', e)
  }
}

// 加载通知列表
async function loadNotifications() {
  if (loading.value || !hasMore.value) return
  
  loading.value = true
  try {
    const typeMap = {
      all: null,
      like: 'post_like', // 后端会同时查询 post_like 和 comment_like
      comment: 'comment',
      message: 'private_message',
      friend: 'friend_request'
    }
    
    const params = {
      limit: 20,
      page: currentPage.value
    }
    
    // 如果是 like/comment tab，需要特殊处理（后端支持单类型筛选）
    if (activeTab.value !== 'all') {
      params.type = typeMap[activeTab.value]
    }
    
    const res = await getNotifications(params)
    if (res.code === 200) {
      if (currentPage.value === 1) {
        notifications.value = res.data.items
      } else {
        notifications.value.push(...res.data.items)
      }
      hasMore.value = currentPage.value < res.data.last_page
      currentPage.value++
    }
  } catch (e) {
    console.error('Failed to load notifications:', e)
  } finally {
    loading.value = false
  }
}

// 滚动加载更多
function handleScroll() {
  if (!listRef.value) return
  const { scrollTop, scrollHeight, clientHeight } = listRef.value
  if (scrollHeight - scrollTop - clientHeight < 50) {
    loadNotifications()
  }
}

// 处理弹窗显示变化
function handleVisibleChange(val) {
  visible.value = val
}

// 点击通知项
async function handleItemClick(item) {
  // 标记为已读
  if (!item.read_at) {
    await markAsRead([item.id])
    item.read_at = new Date().toISOString()
    loadUnreadCount()
  }
  
  // 根据类型跳转
  switch (item.type) {
    case 'post_like':
    case 'post_share':
      if (item.notifiable_id) {
        router.push(`/community/post/${item.notifiable_id}`)
      }
      break
    case 'comment':
    case 'comment_reply':
    case 'comment_like':
      if (item.data?.post_id) {
        router.push(`/community/post/${item.data.post_id}`)
      }
      break
    case 'private_message':
      // 跳转到私聊
      if (item.sender_id) {
        router.push(`/chat/private/${item.sender_id}`)
      }
      break
    case 'friend_request':
      // 跳转到好友请求页面或用户资料
      router.push('/friends')
      break
  }
  
  visible.value = false
}

// 全部标记已读
async function handleMarkAllRead() {
  try {
    const typeMap = {
      all: null,
      like: 'post_like',
      comment: 'comment',
      message: 'private_message',
      friend: 'friend_request'
    }
    await markAllAsRead(activeTab.value !== 'all' ? typeMap[activeTab.value] : null)
    
    // 更新本地状态
    notifications.value.forEach(n => {
      n.read_at = new Date().toISOString()
    })
    loadUnreadCount()
  } catch (e) {
    console.error('Failed to mark all as read:', e)
  }
}

// 获取动作文本
function getActionText(item) {
  switch (item.type) {
    case 'post_like': return '赞了你的帖子'
    case 'comment_like': return '赞了你的评论'
    case 'comment': return '评论了你的帖子'
    case 'comment_reply': return '回复了你的评论'
    case 'post_share': return '转发了你的帖子'
    case 'private_message': return '给你发了私信'
    case 'friend_request': return '请求添加你为好友'
    default: return '触发了一个通知'
  }
}

// 获取详情文本
function getDetailText(item) {
  if (item.data?.post_title) return item.data.post_title
  if (item.data?.comment_preview) return item.data.comment_preview
  if (item.data?.message_preview) return item.data.message_preview
  return null
}

// 格式化时间
function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
  
  return date.toLocaleDateString()
}
</script>

<style scoped>
.notification-trigger {
  cursor: pointer;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  border-radius: 4px;
}

.notification-trigger:hover {
  background: rgba(0, 170, 255, 0.1);
}

.bell-icon {
  width: 20px;
  height: 20px;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s;
}

.notification-trigger:hover .bell-icon {
  color: #00aaff;
}

/* 弹出面板 */
.notification-popover {
  background: rgba(13, 17, 23, 0.98);
  border: 1px solid rgba(0, 170, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 170, 255, 0.1);
}

/* 标签页头部 */
.tab-header {
  display: flex;
  border-bottom: 1px solid rgba(0, 170, 255, 0.2);
  background: rgba(0, 10, 20, 0.5);
}

.tab-item {
  flex: 1;
  padding: 12px 8px;
  text-align: center;
  cursor: pointer;
  color: rgba(150, 180, 200, 0.8);
  font-family: 'Share Tech Mono', monospace;
  font-size: 13px;
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.tab-item:hover {
  color: #00aaff;
  background: rgba(0, 170, 255, 0.05);
}

.tab-item.active {
  color: #00aaff;
  background: rgba(0, 170, 255, 0.1);
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #00aaff;
  box-shadow: 0 0 8px rgba(0, 170, 255, 0.8);
}

.tab-badge {
  transform: scale(0.8);
}

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(0, 170, 255, 0.1);
  background: rgba(0, 5, 15, 0.3);
}

.unread-hint {
  font-size: 12px;
  color: rgba(150, 180, 200, 0.7);
  font-family: 'Share Tech Mono', monospace;
}

.action-bar :deep(.arco-btn-text) {
  color: #00aaff !important;
  font-size: 12px;
}

.action-bar :deep(.arco-btn-text:hover) {
  background: rgba(0, 170, 255, 0.1) !important;
}

/* 通知列表 */
.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-list::-webkit-scrollbar {
  width: 6px;
}

.notification-list::-webkit-scrollbar-track {
  background: rgba(0, 10, 20, 0.3);
}

.notification-list::-webkit-scrollbar-thumb {
  background: rgba(0, 170, 255, 0.3);
  border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 170, 255, 0.5);
}

/* 加载状态 */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  color: rgba(150, 180, 200, 0.5);
  gap: 8px;
}

.empty-terminal {
  text-align: center;
  font-family: 'Share Tech Mono', monospace;
}

.terminal-line {
  display: block;
  color: rgba(0, 170, 255, 0.6);
  font-size: 14px;
  letter-spacing: 1px;
}

.terminal-hint {
  display: block;
  color: rgba(150, 180, 200, 0.4);
  font-size: 12px;
  margin-top: 8px;
}

/* 通知项 */
.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid rgba(0, 170, 255, 0.05);
  position: relative;
}

.notification-item:hover {
  background: rgba(0, 170, 255, 0.05);
}

.notification-item.unread {
  background: rgba(0, 170, 255, 0.02);
}

.sender-avatar {
  flex-shrink: 0;
  background: #0d1117;
  border: 1px solid rgba(0, 170, 255, 0.3);
  color: #00aaff;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-text {
  font-size: 13px;
  line-height: 1.5;
  color: rgba(200, 220, 240, 0.9);
}

.sender-name {
  font-weight: 500;
  color: #00aaff;
  margin-right: 4px;
}

.action-text {
  color: rgba(150, 180, 200, 0.8);
}

.notification-detail {
  font-size: 12px;
  color: rgba(150, 180, 200, 0.6);
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-time {
  font-size: 11px;
  color: rgba(150, 180, 200, 0.4);
  margin-top: 4px;
  font-family: 'Share Tech Mono', monospace;
}

/* 未读指示器 */
.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00aaff;
  box-shadow: 0 0 6px rgba(0, 170, 255, 0.8);
  flex-shrink: 0;
  margin-top: 6px;
}

/* 加载更多 / 没有更多 */
.loading-more, .no-more {
  text-align: center;
  padding: 12px;
  font-size: 12px;
  color: rgba(150, 180, 200, 0.4);
}
</style>
