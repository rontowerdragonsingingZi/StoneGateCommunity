<template>
  <div class="community-container">
    <a-layout>
      <!-- 侧边栏：极简工具栏风格 -->
      <a-layout-sider 
        theme="dark" 
        breakpoint="lg" 
        :width="240"
        class="terminal-sider"
      >
        <div class="logo-area">
          <span class="logo-prefix">FG_LAB</span>
          <span class="logo-suffix">/COMMUNITY</span>
        </div>
        
        <div class="menu-label">/// 导航</div>
        <a-menu 
          :default-selected-keys="['1']" 
          class="terminal-menu"
          @menu-item-click="(key) => activeKey = key"
        >
          <a-menu-item key="1">
            <template #icon><icon-home /></template>
            [观测日志]
          </a-menu-item>
          <a-menu-item key="2">
            <template #icon><icon-code /></template>
            [未来道具]
          </a-menu-item>
          <a-menu-item key="3">
            <template #icon><icon-bulb /></template>
            [世界线数据]
          </a-menu-item>
          <a-menu-item key="4">
            <template #icon><icon-message /></template>
            [圆桌会议]
          </a-menu-item>
          <a-menu-item key="5">
            <template #icon><icon-image /></template>
            [图床服务]
          </a-menu-item>
          <a-menu-item key="6">
            <template #icon><icon-user-group /></template>
            [同行Labmem]
          </a-menu-item>
          <a-menu-item key="7">
            <template #icon><icon-folder /></template>
            [我的会议]
          </a-menu-item>
        </a-menu>

        <div class="user-panel">
          <div class="user-line">
            <span class="prompt">user@lab:~$</span>
            <span class="cursor">_</span>
          </div>
          <div class="user-info">
            <a-avatar :size="32" shape="square" class="pixel-avatar">
              <img src="https://source.unsplash.com/random/100x100/?face" alt="User" />
            </a-avatar>
            <div class="user-details">
              <div class="username">Phoenix Kyoma</div>
              <div class="status">Level 0: 操作员</div>
            </div>
          </div>
        </div>

        <!-- Live2D 容器 -->
        <div ref="live2dContainer" class="live2d-container"></div>
      </a-layout-sider>
      
      <a-layout class="main-layout">
        <!-- 顶部：路径导航 -->
        <a-layout-header class="terminal-header">
          <div class="breadcrumb">
            <span class="path">~/community/observation-alpha</span>
            <span class="branch">git:(<span class="branch-name">master</span>)</span>
          </div>
          <div class="header-actions">
             <div class="search-box">
               <span class="search-icon">></span>
               <input 
                 v-model="searchKeyword" 
                 type="text" 
                 placeholder="搜索标题/内容..." 
                 @keyup.enter="handleSearch"
               />
               <button v-if="searchKeyword" class="search-clear" @click="clearSearch">×</button>
             </div>
             <button class="action-btn new-post" @click="showCreatePost = true">
              <icon-plus /> 新建帖子
             </button>
          </div>
        </a-layout-header>

        <a-layout-content class="content-wrapper">
          <a-row :gutter="24">
            <a-col :span="17">
              
              <!-- 世界线数据 -->
              <WorldlineData v-if="activeKey === '3'" />

              <!-- 新建帖子 -->
              <CreatePost 
                v-else-if="showCreatePost && activeKey === '1'" 
                @back="showCreatePost = false" 
                @created="handlePostCreated" 
              />

              <!-- 帖子详情 -->
              <PostDetail 
                v-else-if="selectedPost && activeKey === '1'" 
                :post-id="selectedPost.id" 
                @back="handleBackToList" 
                @updated="loadPosts" 
              />

              <!-- 帖子列表：日志流风格 -->
              <CustomScrollbar v-else-if="activeKey !== '3' && activeKey !== '4' && activeKey !== '5' && activeKey !== '6' && activeKey !== '7'" class="log-feed">
                <div class="feed-header-bar">
                  <span>ID</span>
                  <span>主题</span>
                  <span>作者</span>
                  <span>时间</span>
                </div>
                
                <div v-if="loading" class="loading-hint">正在加载观测日志...</div>
                <div v-else-if="posts.length === 0" class="empty-hint">暂无观测日志</div>
                
                <div 
                  v-for="item in posts" 
                  :key="item.id" 
                  class="log-entry"
                  @click="handleOpenPost(item)"
                >
                  <div class="entry-meta-row">
                    <span class="entry-id">#{{ String(item.id).padStart(4, '0') }}</span>
                    <span class="entry-tag">[{{ item.tag }}]</span>
                    <span class="entry-author">@{{ item.user?.name || '未知' }}</span>
                    <span class="entry-time">{{ formatTime(item.created_at) }}</span>
                  </div>
                  
                  <div class="entry-main">
                    <h3 class="entry-title">{{ item.title }}</h3>
                    <p class="entry-desc">{{ truncateContent(item.content) }}</p>
                    <div class="entry-cover" v-if="item.cover">
                      <img :src="item.cover" :alt="item.title" />
                    </div>
                  </div>

                  <div class="entry-actions" @click.stop>
                    <button 
                      class="text-btn" 
                      :class="{ liked: item.is_liked }" 
                      @click="handleToggleLike(item)"
                    >
                      <icon-heart /> {{ item.like_count }} 赞同
                    </button>
                    <button class="text-btn"><icon-message /> {{ item.comment_count }} 回复</button>
                    <button class="text-btn"><icon-share-alt /> 转发</button>
                  </div>
                </div>
              </CustomScrollbar>

              <!-- 圆桌会议：频道列表 / 聊天室 -->
              <template v-else-if="activeKey === '4'">
                <ChannelList 
                  v-if="!selectedChannel" 
                  @enter-channel="handleEnterChannel" 
                />
                <ChatRoom 
                  v-else 
                  :channel="selectedChannel" 
                  @back="handleBackToChannels" 
                />
              </template>

              <!-- 图床服务 -->
              <ImageHosting v-else-if="activeKey === '5'" />

              <!-- 同行Labmem：好友列表 / 私聊 -->
              <template v-else-if="activeKey === '6'">
                <FriendList 
                  v-if="!selectedFriend" 
                  @enter-chat="handleEnterPrivateChat" 
                />
                <PrivateChatRoom 
                  v-else 
                  :friend="selectedFriend" 
                  @back="handleBackToFriends" 
                />
              </template>

              <!-- 我的会议：我创建的频道 -->
              <template v-else-if="activeKey === '7'">
                <MyChannels 
                  v-if="!selectedMyChannel" 
                  @enter-channel="handleEnterMyChannel" 
                />
                <ChatRoom 
                  v-else 
                  :channel="selectedMyChannel" 
                  @back="handleBackToMyChannels" 
                />
              </template>

            </a-col>
            
            <a-col :span="7">
              <!-- 右侧：系统监控风格 -->
              <div class="widget-panel">
                <div class="widget-header">
                  <span class="widget-title">热门变动</span>
                  <div class="widget-decor"></div>
                </div>
                <div class="trend-list">
                  <div v-for="(topic, idx) in trendingTopics" :key="idx" class="trend-row">
                    <span class="trend-rank">{{ idx + 1 }}</span>
                    <span class="trend-name">{{ topic.name }}</span>
                    <span class="trend-val">{{ topic.heat }}</span>
                  </div>
                </div>
              </div>
              
              <div class="widget-panel ad-panel">
                <div class="widget-header">
                  <span class="widget-title">招募中</span>
                </div>
                <div class="ad-content">
                  <p>>> 正在寻找 LABMEM 009</p>
                  <p class="blink">_</p>
                  <button class="apply-btn">立即申请()</button>
                </div>
              </div>
            </a-col>
          </a-row>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadOml2d } from 'oh-my-live2d'
import { getPosts, toggleLike, getPost } from '../api/post'

defineOptions({ name: 'CommunityView' })

const route = useRoute()
const router = useRouter()
import { 
  IconHome, IconCode, IconBulb, IconMessage, 
  IconPlus, IconHeart, IconShareAlt, IconImage, IconUserGroup, IconFolder
} from '@arco-design/web-vue/es/icon'
import ChatRoom from '../components/ChatRoom.vue'
import ChannelList from '../components/ChannelList.vue'
import ImageHosting from '../components/ImageHosting.vue'
import FriendList from '../components/FriendList.vue'
import PrivateChatRoom from '../components/PrivateChatRoom.vue'
import MyChannels from '../components/MyChannels.vue'
import WorldlineData from '../components/WorldlineData.vue'
import CustomScrollbar from '../components/CustomScrollbar.vue'
import CreatePost from '../components/CreatePost.vue'
import PostDetail from '../components/PostDetail.vue'

const live2dContainer = ref(null)
let oml2dInstance = null

const activeKey = ref('1')
const posts = ref([])
const loading = ref(false)
const showCreatePost = ref(false)
const selectedPost = ref(null)
const selectedChannel = ref(null)
const selectedFriend = ref(null)
const selectedMyChannel = ref(null)
const searchKeyword = ref('')
const isSearching = ref(false)

// 进入频道
const handleEnterChannel = (channel) => {
  selectedChannel.value = channel
}

// 返回频道列表
const handleBackToChannels = () => {
  selectedChannel.value = null
}

// 进入私聊
const handleEnterPrivateChat = (friend) => {
  selectedFriend.value = friend
}

// 返回好友列表
const handleBackToFriends = () => {
  selectedFriend.value = null
}

// 进入我的频道
const handleEnterMyChannel = (channel) => {
  selectedMyChannel.value = channel
}

// 返回我的频道列表
const handleBackToMyChannels = () => {
  selectedMyChannel.value = null
}

// 加载帖子
const loadPosts = async (search = '') => {
  loading.value = true
  try {
    const params = { limit: 20 }
    if (search) {
      params.search = search
    }
    const res = await getPosts(params)
    posts.value = res.data.items || []
    isSearching.value = !!search
  } catch (e) {
    console.error('加载帖子失败', e)
  } finally {
    loading.value = false
  }
}

// 搜索帖子
const handleSearch = () => {
  const keyword = searchKeyword.value.trim()
  loadPosts(keyword)
}

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = ''
  isSearching.value = false
  loadPosts()
}

// 点赞/取消点赞
const handleToggleLike = async (post) => {
  try {
    const res = await toggleLike(post.id)
    post.is_liked = res.data.is_liked
    post.like_count = res.data.like_count
  } catch (e) {
    console.error('点赞失败', e)
  }
}

// 格式化时间
const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

// 发布成功回调
const handlePostCreated = () => {
  showCreatePost.value = false
  loadPosts()
}

// 打开帖子详情
const handleOpenPost = (post) => {
  selectedPost.value = post
  // 更新 URL（不触发页面刷新）
  router.push({ name: 'PostDetail', params: { postId: post.id } })
}

// 返回列表
const handleBackToList = () => {
  selectedPost.value = null
  router.push({ name: 'Community' })
}

// 截断内容
const truncateContent = (content, maxLen = 150) => {
  if (!content) return ''
  const text = content.replace(/\n/g, ' ')
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
}

// 监听路由参数，支持直接访问帖子链接
watch(
  () => route.params.postId,
  async (postId) => {
    if (postId) {
      // 切换到观测日志页面
      activeKey.value = '1'
      // 清除其他选中状态
      selectedFriend.value = null
      selectedChannel.value = null
      selectedMyChannel.value = null
      showCreatePost.value = false
      // 加载帖子详情
      try {
        const res = await getPost(Number(postId))
        if (res.code === 200 && res.data) {
          selectedPost.value = res.data
        }
      } catch (e) {
        console.error('加载帖子失败', e)
      }
    }
  },
  { immediate: true }
)

onMounted(() => {
  loadPosts()
  
  // 初始化 Live2D
  nextTick(() => {
    if (live2dContainer.value) {
      oml2dInstance = loadOml2d({
        models: [
          {
            path: 'https://unpkg.com/live2d-widget-model-miku@1.0.5/assets/miku.model.json',
            scale: 0.3,
            position: [-30, 0],
            stageStyle: {
              width: 240,
              height: 450
            }
          }
        ],
        parentElement: live2dContainer.value,
        tips: {
          disable: true
        },
        statusBar: {
          disable: true
        },
        menus: {
          disable: true
        },
        dockedPosition: 'left',
        mobileDisplay: true
      })
    }
  })
})

onUnmounted(() => {
  // 清理 Live2D 实例
  if (oml2dInstance) {
    oml2dInstance = null
  }
})

const trendingTopics = ref([
  { name: '#WorldLine_Divergence', heat: '1.048596%' },
  { name: '#IBN_5100', heat: '999k' },
  { name: '#Jellyman_Report', heat: 'TOP_SECRET' },
  { name: '#Amadeus', heat: 'ACTIVE' },
  { name: '#CERN_Database', heat: 'HACKED' }
])
</script>

<style scoped>
/* 引入等宽字体 */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');

.community-container {
  height: 100%;
  flex: 1;
  background: #0d1117; /* GitHub Dark Dimmed 风格 */
  color: #c9d1d9;
  font-family: 'JetBrains Mono', 'Segoe UI', monospace;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.community-container :deep(.arco-layout) {
  height: 100%;
  flex: 1;
}

.community-container :deep(.arco-layout-sider) {
  overflow: hidden !important;
  flex-shrink: 0;
  height: auto !important;
  max-height: 100% !important;
}

/* 隐藏侧边栏内部滚动条 */
.community-container :deep(.arco-layout-sider-children) {
  overflow: hidden !important;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.community-container :deep(.arco-layout-content) {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 侧边栏 */
.terminal-sider {
  background: #010409 !important;
  border-right: 1px solid #30363d;
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
  overflow: hidden !important;
}

.logo-area {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #30363d;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.logo-prefix { color: #58a6ff; }
.logo-suffix { color: #8b949e; }

.menu-label {
  padding: 20px 20px 10px;
  font-size: 12px;
  color: #484f58;
  font-weight: bold;
}

.terminal-menu {
  background: transparent;
}

:deep(.arco-menu-item) {
  background: transparent;
  color: #8b949e;
  font-family: 'JetBrains Mono', monospace;
  height: 40px;
  line-height: 40px;
}

:deep(.arco-menu-item:hover),
:deep(.arco-menu-item.arco-menu-selected) {
  background: #161b22;
  color: #58a6ff;
}

.user-panel {
  padding: 20px;
  border-top: 1px solid #30363d;
  border-bottom: 1px solid #30363d;
}

.user-line {
  font-size: 12px;
  margin-bottom: 10px;
  opacity: 0.7;
}
.prompt { color: #7ee787; }
.cursor { animation: blink 1s infinite; }

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pixel-avatar {
  border: 1px solid #30363d;
}

.username {
  font-size: 13px;
  color: #c9d1d9;
  font-weight: 600;
}

.status {
  font-size: 11px;
  color: #8b949e;
}

/* Live2D 容器 */
.live2d-container {
  flex: 1;
  width: 240px;
  min-height: 300px;
  position: relative;
  overflow: visible;
}

.live2d-container :deep(#oml2d-stage) {
  position: absolute !important;
  left: 0 !important;
  top: 0 !important;
  bottom: auto !important;
  right: auto !important;
}

/* 强制隐藏对话框 */
.live2d-container :deep(#oml2d-tips) {
  display: none !important;
}

/* 主布局 */
.main-layout {
  background: #0d1117;
}

.terminal-header {
  height: 60px;
  background: #0d1117;
  border-bottom: 1px solid #30363d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.breadcrumb {
  font-size: 14px;
  color: #8b949e;
}
.branch {
  margin-left: 10px;
  color: #484f58;
}
.branch-name { color: #a5d6ff; }

.header-actions {
  display: flex;
  gap: 16px;
}

.search-box {
  background: #010409;
  border: 1px solid #30363d;
  border-radius: 4px;
  padding: 4px 12px;
  display: flex;
  align-items: center;
  width: 240px;
}

.search-icon { color: #58a6ff; margin-right: 8px; }
.search-box input {
  background: transparent;
  border: none;
  color: #c9d1d9;
  outline: none;
  flex: 1;
  font-family: inherit;
  font-size: 13px;
}
.search-clear {
  background: transparent;
  border: none;
  color: #8b949e;
  cursor: pointer;
  font-size: 16px;
  padding: 0 4px;
  line-height: 1;
}
.search-clear:hover {
  color: #f85149;
}

.action-btn {
  background: #238636; /* GitHub Green */
  border: 1px solid rgba(240, 246, 252, 0.1);
  color: #ffffff;
  padding: 4px 12px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}
.action-btn:hover { background: #2ea043; }

/* 内容区 */
.content-wrapper {
  padding: 24px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.content-wrapper :deep(.arco-row) {
  height: 100%;
  min-height: 0;
}

.content-wrapper :deep(.arco-col:first-child) {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.content-wrapper :deep(.arco-col:last-child) {
  height: 100%;
  overflow-y: auto;
}

/* 日志流 (Feed) */
.log-feed {
  height: 100%;
  min-height: 0;
}

.log-feed :deep(.scrollbar-content) {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding-right: 8px;
}

.feed-header-bar {
  display: grid;
  grid-template-columns: 80px 1fr 150px 180px;
  padding: 10px 16px;
  color: #484f58;
  font-size: 12px;
  font-weight: bold;
  border-bottom: 1px solid #30363d;
}

.log-entry {
  background: #161b22;
  border: 1px solid #30363d;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 6px;
  transition: all 0.2s;
  cursor: pointer;
}

.log-entry:hover {
  border-color: #58a6ff;
  background: #1c2128;
  transform: translateY(-1px);
}

.entry-meta-row {
  display: flex;
  font-size: 12px;
  color: #8b949e;
  margin-bottom: 8px;
  gap: 12px;
}

.entry-id { color: #79c0ff; }
.entry-tag { color: #d2a8ff; }
.entry-time { margin-left: auto; }

.entry-main {
  margin-bottom: 12px;
}

.entry-title {
  margin: 0 0 8px;
  font-size: 16px;
  color: #c9d1d9;
  font-weight: 600;
}

.entry-desc {
  margin: 0;
  font-size: 14px;
  color: #8b949e;
  line-height: 1.5;
}

.entry-cover {
  margin-top: 12px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #30363d;
  background: #010409;
}

.entry-cover img {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  display: block;
}

.entry-actions {
  display: flex;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #21262d;
}

.text-btn {
  background: transparent;
  border: none;
  color: #8b949e;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
}

.text-btn:hover { color: #58a6ff; }
.text-btn.liked { color: #f85149; }

.loading-hint,
.empty-hint {
  text-align: center;
  padding: 40px;
  color: #8b949e;
  font-size: 14px;
}

/* Widget */
.widget-panel {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 24px;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid #21262d;
  padding-bottom: 8px;
}

.widget-title {
  font-size: 12px;
  color: #8b949e;
  font-weight: bold;
}

.trend-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
  border-bottom: 1px solid #21262d;
}
.trend-row:last-child { border-bottom: none; }

.trend-rank { color: #58a6ff; width: 24px; }
.trend-name { flex: 1; color: #c9d1d9; }
.trend-val { color: #79c0ff; }

.ad-content {
  text-align: center;
  padding: 20px 0;
}

.apply-btn {
  background: transparent;
  border: 1px solid #58a6ff;
  color: #58a6ff;
  padding: 6px 16px;
  margin-top: 10px;
  cursor: pointer;
  font-family: inherit;
}
.apply-btn:hover {
  background: #58a6ff;
  color: #000;
}

@keyframes blink { 50% { opacity: 0; } }
</style>
