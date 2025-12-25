<template>
  <div class="friend-list-container">
    <!-- 头部 -->
    <div class="friend-header">
      <div class="header-info">
        <span class="header-tag">[LABMEM]</span>
        <h2 class="header-title">FELLOW_TRAVELERS</h2>
        <span class="friend-count">TOTAL: {{ friends.length }}</span>
      </div>
      <div class="header-actions">
        <button 
          class="request-btn" 
          :class="{ 'has-requests': pendingRequests.length > 0 }"
          @click="showRequestsModal = true"
        >
          <span class="btn-icon">◆</span> 
          REQUESTS{{ pendingRequests.length > 0 ? ` (${pendingRequests.length})` : '' }}
        </button>
      </div>
    </div>

    <!-- 搜索添加区域 -->
    <div class="search-section">
      <div class="search-box">
        <span class="search-icon">>></span>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="SEARCH_LABMEM_BY_NAME..."
          @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch" :disabled="isSearching">
          {{ isSearching ? 'SCANNING...' : 'SCAN' }}
        </button>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="searchResults.length > 0" class="search-results">
      <div class="results-header">
        <span>>> SCAN_RESULTS ({{ searchResults.length }})</span>
        <button class="close-results" @click="searchResults = []">×</button>
      </div>
      <div 
        v-for="user in searchResults" 
        :key="user.id" 
        class="result-row"
      >
        <div class="user-info">
          <span class="user-avatar">{{ getAvatarChar(user.name) }}</span>
          <span class="user-name">{{ user.name }}</span>
        </div>
        <div class="user-actions">
          <span v-if="user.friendship_status === 'accepted'" class="status-tag accepted">
            [FRIEND]
          </span>
          <span v-else-if="user.friendship_status === 'pending'" class="status-tag pending">
            [PENDING]
          </span>
          <span v-else-if="user.friendship_status === 'incoming'" class="status-tag incoming">
            [INCOMING]
          </span>
          <button 
            v-else 
            class="add-btn"
            @click="handleAddFriend(user)"
            :disabled="addingUserId === user.id"
          >
            {{ addingUserId === user.id ? 'SENDING...' : '+ ADD' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 好友列表 -->
    <div class="friend-grid">
      <div class="grid-header">
        <span class="col-avatar">AVATAR</span>
        <span class="col-name">NAME</span>
        <span class="col-status">STATUS</span>
        <span class="col-action">ACTION</span>
      </div>

      <div v-if="isLoading" class="loading-row">
        <span class="loading-text">>> LOADING LABMEM...</span>
        <span class="cursor blink">_</span>
      </div>

      <div
        v-else
        v-for="friend in friends"
        :key="friend.id"
        class="friend-row"
        @click="enterChat(friend)"
      >
        <span class="col-avatar">
          <span class="avatar-box">{{ getAvatarChar(friend.name) }}</span>
        </span>
        <span class="col-name">{{ friend.name }}</span>
        <span class="col-status">
          <span class="status-indicator online">●</span> ONLINE
        </span>
        <span class="col-action">
          <button class="chat-btn" @click.stop="enterChat(friend)">
            CHAT >>
          </button>
        </span>
      </div>

      <div v-if="!isLoading && friends.length === 0" class="empty-row">
        <span>>> NO LABMEM FOUND</span>
        <p class="empty-hint">使用上方搜索框寻找同行者</p>
      </div>
    </div>

    <!-- 好友请求弹窗 -->
    <div v-if="showRequestsModal" class="modal-overlay" @click.self="showRequestsModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">[FRIEND_REQUESTS]</span>
          <button class="close-btn" @click="showRequestsModal = false">×</button>
        </div>
        <div class="modal-body">
          <div v-if="pendingRequests.length === 0" class="no-requests">
            >> 暂无待处理的好友请求
          </div>
          <div 
            v-for="req in pendingRequests" 
            :key="req.id" 
            class="request-row"
          >
            <div class="request-user">
              <span class="req-avatar">{{ getAvatarChar(req.user.name) }}</span>
              <div class="req-info">
                <span class="req-name">{{ req.user.name }}</span>
                <span class="req-time">{{ formatTime(req.created_at) }}</span>
              </div>
            </div>
            <div class="request-actions">
              <button 
                class="accept-btn" 
                @click="handleAccept(req)"
                :disabled="processingId === req.id"
              >
                ACCEPT
              </button>
              <button 
                class="reject-btn" 
                @click="handleReject(req)"
                :disabled="processingId === req.id"
              >
                REJECT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { 
  getFriends, 
  getFriendRequests, 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest,
  searchUsers 
} from '../api/friend'
import { getToken } from '../api/request'

const emit = defineEmits(['enter-chat'])

const friends = ref([])
const pendingRequests = ref([])
const searchResults = ref([])
const searchQuery = ref('')
const isLoading = ref(false)
const isSearching = ref(false)
const showRequestsModal = ref(false)
const addingUserId = ref(null)
const processingId = ref(null)

// 获取头像字符
const getAvatarChar = (name) => {
  if (!name) return '??'
  return name.substring(0, 2).toUpperCase()
}

// 格式化时间
const formatTime = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleDateString('zh-CN')
}

// 加载好友列表
const loadFriends = async () => {
  if (!getToken()) return
  isLoading.value = true
  try {
    const res = await getFriends()
    if (res.code === 0 && res.data) {
      friends.value = res.data
    }
  } catch (err) {
    console.error('Failed to load friends:', err)
  } finally {
    isLoading.value = false
  }
}

// 加载好友请求
const loadRequests = async () => {
  if (!getToken()) return
  try {
    const res = await getFriendRequests()
    if (res.code === 0 && res.data) {
      pendingRequests.value = res.data
    }
  } catch (err) {
    console.error('Failed to load friend requests:', err)
  }
}

// 搜索用户
const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  if (!getToken()) {
    Message.warning('请先登录')
    return
  }
  
  isSearching.value = true
  try {
    const res = await searchUsers(searchQuery.value.trim())
    if (res.code === 0 && res.data) {
      searchResults.value = res.data
    }
  } catch (err) {
    console.error('Search failed:', err)
    Message.error('搜索失败')
  } finally {
    isSearching.value = false
  }
}

// 添加好友
const handleAddFriend = async (user) => {
  addingUserId.value = user.id
  try {
    const res = await sendFriendRequest(user.id)
    if (res.code === 0) {
      Message.success(res.message || '好友请求已发送')
      // 更新搜索结果中的状态
      const idx = searchResults.value.findIndex(u => u.id === user.id)
      if (idx !== -1) {
        searchResults.value[idx].friendship_status = 'pending'
      }
      // 如果自动成为好友，刷新列表
      if (res.message?.includes('已自动成为好友')) {
        loadFriends()
      }
    } else {
      Message.error(res.message || '发送失败')
    }
  } catch (err) {
    Message.error('网络错误')
  } finally {
    addingUserId.value = null
  }
}

// 接受好友请求
const handleAccept = async (req) => {
  processingId.value = req.id
  try {
    const res = await acceptFriendRequest(req.id)
    if (res.code === 0) {
      Message.success('已接受好友请求')
      pendingRequests.value = pendingRequests.value.filter(r => r.id !== req.id)
      loadFriends()
    } else {
      Message.error(res.message || '操作失败')
    }
  } catch (err) {
    Message.error('网络错误')
  } finally {
    processingId.value = null
  }
}

// 拒绝好友请求
const handleReject = async (req) => {
  processingId.value = req.id
  try {
    const res = await rejectFriendRequest(req.id)
    if (res.code === 0) {
      Message.success('已拒绝好友请求')
      pendingRequests.value = pendingRequests.value.filter(r => r.id !== req.id)
    } else {
      Message.error(res.message || '操作失败')
    }
  } catch (err) {
    Message.error('网络错误')
  } finally {
    processingId.value = null
  }
}

// 进入私聊
const enterChat = (friend) => {
  emit('enter-chat', friend)
}

onMounted(() => {
  loadFriends()
  loadRequests()
})
</script>

<style scoped>
.friend-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0d1117;
  color: #c9d1d9;
  font-family: 'JetBrains Mono', monospace;
}

/* Header */
.friend-header {
  height: 60px;
  border-bottom: 1px solid #30363d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #161b22;
}

.header-info {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.header-tag {
  font-size: 12px;
  color: #d2a8ff;
  font-weight: bold;
}

.header-title {
  font-size: 16px;
  color: #c9d1d9;
  margin: 0;
  letter-spacing: 1px;
}

.friend-count {
  font-size: 12px;
  color: #8b949e;
}

.request-btn {
  background: transparent;
  border: 1px solid #30363d;
  color: #8b949e;
  font-family: inherit;
  font-size: 12px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.request-btn:hover {
  border-color: #d2a8ff;
  color: #d2a8ff;
}

.request-btn.has-requests {
  border-color: #f0883e;
  color: #f0883e;
}

/* Search Section */
.search-section {
  padding: 16px 24px;
  border-bottom: 1px solid #30363d;
}

.search-box {
  display: flex;
  align-items: center;
  background: #010409;
  border: 1px solid #30363d;
  padding: 8px 16px;
  gap: 12px;
}

.search-icon {
  color: #d2a8ff;
  font-weight: bold;
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  color: #c9d1d9;
  font-family: inherit;
  font-size: 13px;
  outline: none;
}

.search-btn {
  background: transparent;
  border: 1px solid #30363d;
  color: #58a6ff;
  font-family: inherit;
  font-size: 11px;
  padding: 4px 12px;
  cursor: pointer;
}

.search-btn:hover:not(:disabled) {
  background: #58a6ff;
  color: #0d1117;
}

.search-btn:disabled {
  opacity: 0.6;
}

/* Search Results */
.search-results {
  padding: 16px 24px;
  border-bottom: 1px solid #30363d;
  background: rgba(210, 168, 255, 0.05);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: #d2a8ff;
  font-size: 12px;
}

.close-results {
  background: transparent;
  border: none;
  color: #8b949e;
  font-size: 18px;
  cursor: pointer;
}

.result-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #161b22;
  border: 1px solid #30363d;
  margin-bottom: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #010409;
  border: 1px solid #d2a8ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.user-name {
  color: #c9d1d9;
}

.status-tag {
  font-size: 11px;
  padding: 2px 8px;
}

.status-tag.accepted { color: #238636; }
.status-tag.pending { color: #f0883e; }
.status-tag.incoming { color: #58a6ff; }

.add-btn {
  background: transparent;
  border: 1px solid #238636;
  color: #238636;
  font-family: inherit;
  font-size: 11px;
  padding: 4px 10px;
  cursor: pointer;
}

.add-btn:hover:not(:disabled) {
  background: #238636;
  color: #fff;
}

/* Friend Grid */
.friend-grid {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.grid-header {
  display: grid;
  grid-template-columns: 60px 1fr 120px 100px;
  padding: 10px 16px;
  color: #484f58;
  font-size: 11px;
  font-weight: bold;
  border-bottom: 1px solid #30363d;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.friend-row {
  display: grid;
  grid-template-columns: 60px 1fr 120px 100px;
  padding: 16px;
  background: #161b22;
  border: 1px solid #30363d;
  margin-top: 8px;
  cursor: pointer;
  transition: all 0.2s;
  align-items: center;
}

.friend-row:hover {
  border-color: #d2a8ff;
  background: #1c2128;
}

.avatar-box {
  width: 36px;
  height: 36px;
  background: #010409;
  border: 2px solid #d2a8ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.col-name {
  color: #c9d1d9;
  font-weight: 600;
}

.col-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8b949e;
}

.status-indicator.online {
  color: #238636;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.chat-btn {
  background: transparent;
  border: 1px solid #30363d;
  color: #58a6ff;
  font-family: inherit;
  font-size: 11px;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.chat-btn:hover {
  background: #58a6ff;
  color: #0d1117;
}

.loading-row,
.empty-row {
  padding: 40px;
  text-align: center;
  color: #8b949e;
  font-size: 14px;
}

.empty-hint {
  font-size: 12px;
  margin-top: 8px;
  color: #484f58;
}

.cursor {
  color: #58a6ff;
}

.blink {
  animation: blink 1s infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #161b22;
  border: 1px solid #30363d;
  width: 480px;
  max-width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #30363d;
}

.modal-title {
  color: #d2a8ff;
  font-size: 14px;
  font-weight: bold;
}

.close-btn {
  background: transparent;
  border: none;
  color: #8b949e;
  font-size: 20px;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.no-requests {
  text-align: center;
  color: #8b949e;
  padding: 20px;
}

.request-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #0d1117;
  border: 1px solid #30363d;
  margin-bottom: 8px;
}

.request-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.req-avatar {
  width: 36px;
  height: 36px;
  background: #010409;
  border: 2px solid #f0883e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.req-info {
  display: flex;
  flex-direction: column;
}

.req-name {
  color: #c9d1d9;
  font-weight: 600;
}

.req-time {
  font-size: 11px;
  color: #8b949e;
}

.request-actions {
  display: flex;
  gap: 8px;
}

.accept-btn {
  background: transparent;
  border: 1px solid #238636;
  color: #238636;
  font-family: inherit;
  font-size: 11px;
  padding: 4px 10px;
  cursor: pointer;
}

.accept-btn:hover:not(:disabled) {
  background: #238636;
  color: #fff;
}

.reject-btn {
  background: transparent;
  border: 1px solid #da3633;
  color: #da3633;
  font-family: inherit;
  font-size: 11px;
  padding: 4px 10px;
  cursor: pointer;
}

.reject-btn:hover:not(:disabled) {
  background: #da3633;
  color: #fff;
}
</style>
