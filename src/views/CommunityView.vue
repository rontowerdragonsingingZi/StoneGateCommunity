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
        
        <div class="menu-label">/// NAVIGATION</div>
        <a-menu 
          :default-selected-keys="['1']" 
          class="terminal-menu"
          @menu-item-click="(key) => activeKey = key"
        >
          <a-menu-item key="1">
            <template #icon><icon-home /></template>
            [OBSERVATION_LOG]
          </a-menu-item>
          <a-menu-item key="2">
            <template #icon><icon-code /></template>
            [FUTURE_GADGETS]
          </a-menu-item>
          <a-menu-item key="3">
            <template #icon><icon-bulb /></template>
            [WORLD_LINE_DATA]
          </a-menu-item>
          <a-menu-item key="4">
            <template #icon><icon-message /></template>
            [ROUND_TABLE]
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
              <div class="status">Level 0: Operator</div>
            </div>
          </div>
        </div>
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
               <input type="text" placeholder="grep 'keyword'..." />
             </div>
             <button class="action-btn new-post">
              <icon-plus /> NEW_ENTRY
             </button>
          </div>
        </a-layout-header>

        <a-layout-content class="content-wrapper">
          <a-row :gutter="24">
            <a-col :span="17">
              
              <!-- 帖子列表：日志流风格 -->
              <div v-if="activeKey !== '4'" class="log-feed">
                <div class="feed-header-bar">
                  <span>ID</span>
                  <span>SUBJECT</span>
                  <span>AUTHOR</span>
                  <span>TIMESTAMP</span>
                </div>
                
                <div v-for="item in mockData" :key="item.id" class="log-entry">
                  <div class="entry-meta-row">
                    <span class="entry-id">#{{ String(item.id).padStart(4, '0') }}</span>
                    <span class="entry-tag">[{{ item.tag }}]</span>
                    <span class="entry-author">@{{ item.author }}</span>
                    <span class="entry-time">{{ item.time }}</span>
                  </div>
                  
                  <div class="entry-main">
                    <h3 class="entry-title">{{ item.title }}</h3>
                    <p class="entry-desc">{{ item.description }}</p>
                    <div class="entry-cover" v-if="item.cover">
                      <img :src="item.cover" />
                    </div>
                  </div>

                  <div class="entry-actions">
                    <button class="text-btn"><icon-heart /> {{ item.likes }} ACKs</button>
                    <button class="text-btn"><icon-message /> {{ item.comments }} REPLIES</button>
                    <button class="text-btn"><icon-share-alt /> FORWARD</button>
                  </div>
                </div>
              </div>

              <!-- 聊天室组件 -->
              <ChatRoom v-else />

            </a-col>
            
            <a-col :span="7">
              <!-- 右侧：系统监控风格 -->
              <div class="widget-panel">
                <div class="widget-header">
                  <span class="widget-title">TOP_DIVERGENCE</span>
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
                  <span class="widget-title">RECRUITMENT</span>
                </div>
                <div class="ad-content">
                  <p>>> SEARCHING FOR LABMEM 009</p>
                  <p class="blink">_</p>
                  <button class="apply-btn">APPLY_NOW()</button>
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
import { ref, computed } from 'vue'
import { 
  IconHome, IconCode, IconBulb, IconMessage, 
  IconPlus, IconHeart, IconShareAlt
} from '@arco-design/web-vue/es/icon'
import ChatRoom from '../components/ChatRoom.vue'

const activeKey = ref('1')

const mockData = ref([
// ... (保留原有 mockData 不变)
  {
    id: 1024,
    title: '关于时间机器的理论探讨与微波炉的偶然性',
    description: '我们在实验中发现，当微波炉与连接到CRT电视的手机同时运作时，香蕉会发生凝胶化现象。这是否意味着我们触碰到了克尔黑洞的边缘？我们需要更多的实验数据来验证这个猜想。',
    author: 'Okabe_Rintaro',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
    time: '2025-07-28 12:00:00',
    tag: 'THEORY',
    likes: 2048,
    comments: 156,
    cover: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 1023,
    title: 'Vue 3 + Three.js 粒子系统性能优化实践',
    description: '在使用 Three.js 渲染数万个粒子模拟世界线变动时，帧率一度下降到 30fps。通过使用 BufferGeometry 和自定义 Shader，成功优化到了稳定 60fps。',
    author: 'Super_Hacker',
    userAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80',
    time: '2025-07-28 09:30:00',
    tag: 'TECH',
    likes: 892,
    comments: 42
  },
  {
    id: 1022,
    title: '寻找 IBM 5100：它不仅是一台电脑',
    description: '有人在秋叶原见过这台古董机吗？这关系到世界的命运。如果有线索，请务必联系我！El Psy Kongroo.',
    author: 'John_Titor',
    userAvatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=100&q=80',
    time: '2025-07-27 23:15:00',
    tag: 'MISSION',
    likes: 5671,
    comments: 999,
    cover: 'https://images.unsplash.com/photo-1588872657578-1a416555f303?auto=format&fit=crop&w=800&q=80'
  }
])

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
  min-height: 100vh;
  background: #0d1117; /* GitHub Dark Dimmed 风格 */
  color: #c9d1d9;
  font-family: 'JetBrains Mono', 'Segoe UI', monospace;
}

/* 侧边栏 */
.terminal-sider {
  background: #010409 !important;
  border-right: 1px solid #30363d;
  display: flex;
  flex-direction: column;
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
  margin-top: auto;
  padding: 20px;
  border-top: 1px solid #30363d;
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
  width: 100%;
  font-family: inherit;
  font-size: 13px;
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
}

/* 日志流 (Feed) */
.log-feed {
  display: flex;
  flex-direction: column;
  gap: 1px; /* 紧凑间距 */
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
  margin-bottom: 16px; /* 卡片之间分开一点，更清晰 */
  border-radius: 6px;
  transition: border-color 0.2s;
}

.log-entry:hover {
  border-color: #58a6ff;
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
  height: 200px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #30363d;
}

.entry-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
