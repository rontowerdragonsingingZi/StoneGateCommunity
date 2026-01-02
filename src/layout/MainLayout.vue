<template>
  <a-layout class="layout">
    <a-layout-header class="nav-header" :class="{ 'transparent': isHome }">
      <div class="header-content">
        <div class="logo" @click="$router.push('/')">
           <img src="/StoneGateCommunityLogo.png" alt="Logo" class="logo-img" />
           <span class="logo-text">STONE GATE</span>
        </div>
        <a-menu mode="horizontal" :selected-keys="selectedKeys" @menu-item-click="handleMenuClick" class="custom-menu">
          <a-menu-item key="Home">首页</a-menu-item>
          <a-menu-item key="Community">社区</a-menu-item>
          <a-menu-item key="About">关于</a-menu-item>
        </a-menu>
        <div class="actions">
           <!-- 通知铃铛 -->
           <NotificationPanel v-if="userStore.user" />
           
           <div v-if="userStore.user" class="user-profile">
             <a-dropdown trigger="hover">
               <div class="user-info">
                 <a-avatar :size="32" :image-url="userStore.user.avatar" class="user-avatar">
                   {{ userStore.user.name ? userStore.user.name.charAt(0).toUpperCase() : 'U' }}
                 </a-avatar>
                 <span class="user-name">{{ userStore.user.name }}</span>
               </div>
               <template #content>
                 <a-doption class="sg-doption" @click="$router.push('/profile')">
                   <template #icon><icon-user /></template>
                   Labmem 档案
                 </a-doption>
                 <a-doption class="sg-doption" @click="handleLogout">
                   <template #icon><icon-poweroff /></template>
                   解除连接
                   <span class="sub-text">El Psy Kongroo</span>
                 </a-doption>
               </template>
             </a-dropdown>
           </div>
           <a-button v-else class="login-btn" type="text" @click="$router.push('/login')">登录 / 注册</a-button>
        </div>
      </div>
    </a-layout-header>
    <a-layout-content class="main-content">
      <router-view v-slot="{ Component }">
        <keep-alive include="HomeView,CommunityView">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </a-layout-content>
    <a-layout-footer class="footer" v-if="!isHome">
      石头门社区 &copy; 2025 由未来道具研究所创建
    </a-layout-footer>
  </a-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { IconPoweroff, IconUser } from '@arco-design/web-vue/es/icon'
import NotificationPanel from '../components/NotificationPanel.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const selectedKeys = computed(() => [route.name])
const isHome = computed(() => route.name === 'Home')

const handleMenuClick = (key) => {
  if (key === 'About') {
    // TODO
    return
  }
  router.push({ name: key })
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-header.transparent {
  background: transparent;
  border-bottom: none;
  backdrop-filter: none;
}

/* 滚动时如果需要变色，可以添加 JS 监听滚动事件 toggle class，暂时先保持透明或纯黑 */

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  height: 64px;
}

.logo {
  cursor: pointer;
  margin-right: 40px;
}

.logo-img {
  height: 40px;
  width: auto;
  margin-right: 10px;
  vertical-align: middle;
}

.logo-text {
  font-family: 'Share Tech Mono', monospace;
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(0, 170, 255, 0.5);
  vertical-align: middle;
}

/* 自定义菜单样式以适配暗色背景 */
.custom-menu {
  background: transparent !important;
  flex: 1;
}

:deep(.arco-menu-horizontal .arco-menu-inner) {
  padding: 0;
  overflow: visible;
}

:deep(.arco-menu-item) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 1rem;
  font-family: 'Cinzel', serif;
}

:deep(.arco-menu-item:hover),
:deep(.arco-menu-selected) {
  color: #00aaff !important;
  background: transparent !important;
}

:deep(.arco-menu-selected-label) {
  bottom: -18px;
  background-color: #00aaff !important;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.login-btn {
  color: #fff !important;
  font-family: 'Share Tech Mono', monospace;
}

.login-btn:hover {
  color: #00aaff !important;
  background: rgba(0, 170, 255, 0.1) !important;
}

.user-profile {
  cursor: pointer;
  color: #fff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: rgba(51, 255, 0, 0.05);
  box-shadow: 0 0 15px rgba(51, 255, 0, 0.1);
  border: 1px solid rgba(51, 255, 0, 0.2);
}

.user-name {
  font-family: 'Share Tech Mono', monospace;
  font-size: 1rem;
  color: #aaddaa;
  text-shadow: 0 0 2px rgba(51, 255, 0, 0.3);
  transition: color 0.3s ease;
}

.user-info:hover .user-name {
  color: #33ff00;
  text-shadow: 0 0 8px rgba(51, 255, 0, 0.8);
}

.user-avatar {
  background-color: #000;
  border: 1px solid #004400;
  color: #008800;
  box-shadow: 0 0 5px rgba(0, 50, 0, 0.5);
  transition: all 0.3s ease;
}

.user-info:hover .user-avatar {
  border-color: #33ff00;
  color: #33ff00;
  box-shadow: 0 0 10px rgba(51, 255, 0, 0.5);
}

/* 覆盖 Arco Dropdown 样式以符合主题 */
:deep(.arco-dropdown) {
  background-color: rgba(10, 15, 10, 0.95) !important;
  border: 1px solid #1a331a;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8), 0 0 10px rgba(51, 255, 0, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 0;
}

:deep(.arco-dropdown-list) {
  padding: 0;
}

:deep(.arco-dropdown-option) {
  color: #88aa88 !important;
  font-family: 'Share Tech Mono', monospace;
  transition: all 0.2s;
  border-left: 2px solid transparent;
  padding: 10px 16px;
}

:deep(.arco-dropdown-option:hover) {
  background: linear-gradient(90deg, rgba(51, 255, 0, 0.1) 0%, rgba(0,0,0,0) 100%) !important;
  color: #33ff00 !important;
  text-shadow: 0 0 8px rgba(51, 255, 0, 0.6);
  border-left: 2px solid #33ff00;
}

:deep(.arco-icon) {
  color: inherit;
  margin-right: 8px;
}

.sub-text {
  font-size: 0.7em;
  margin-left: 8px;
  opacity: 0.7;
  font-style: italic;
  font-family: 'Cinzel', serif;
}

.main-content {
  flex: 1;
  background: #0d1117;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.layout:not(:has(.nav-header.transparent)) .main-content {
  padding-top: 64px;
}

.footer {
  text-align: center;
  padding: 20px;
  background: #000;
  color: #666;
  border-top: 1px solid #222;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style>
/* 全局样式 - Dropdown 弹出层挂载到 body，需要全局样式覆盖 */
.arco-dropdown {
  background-color: rgba(10, 15, 10, 0.95) !important;
  border: 1px solid #1a331a !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8), 0 0 10px rgba(51, 255, 0, 0.1) !important;
  backdrop-filter: blur(10px);
  border-radius: 0 !important;
}

.arco-dropdown-list-wrapper {
  padding: 0 !important;
}

.arco-dropdown-option {
  color: #88aa88 !important;
  font-family: 'Share Tech Mono', monospace !important;
  transition: all 0.2s !important;
  border-left: 2px solid transparent !important;
  padding: 10px 16px !important;
  background: transparent !important;
}

.arco-dropdown-option:hover {
  background: linear-gradient(90deg, rgba(51, 255, 0, 0.15) 0%, rgba(0,0,0,0) 100%) !important;
  color: #33ff00 !important;
  text-shadow: 0 0 8px rgba(51, 255, 0, 0.6);
  border-left: 2px solid #33ff00 !important;
}

.arco-dropdown-option .arco-icon {
  color: inherit !important;
  margin-right: 8px;
}

/* 菜单溢出弹出层样式 - 响应式折叠菜单 */
.arco-trigger-popup .arco-menu,
.arco-trigger-popup .arco-menu-pop,
.arco-menu-pop,
.arco-trigger-popup .arco-menu-vertical {
  background-color: rgba(10, 15, 10, 0.95) !important;
  border: 1px solid rgba(0, 170, 255, 0.3) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 170, 255, 0.15) !important;
  backdrop-filter: blur(10px);
  border-radius: 4px !important;
}

.arco-trigger-popup .arco-menu .arco-menu-inner,
.arco-menu-pop .arco-menu-inner {
  background: transparent !important;
  padding: 4px 0 !important;
}

.arco-trigger-popup .arco-menu .arco-menu-item,
.arco-menu-pop .arco-menu-item {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.7) !important;
  font-family: 'Share Tech Mono', monospace !important;
  margin: 0 !important;
  padding: 10px 20px !important;
  border-left: 2px solid transparent;
  transition: all 0.2s ease !important;
}

.arco-trigger-popup .arco-menu .arco-menu-item:hover,
.arco-menu-pop .arco-menu-item:hover {
  background: linear-gradient(90deg, rgba(0, 170, 255, 0.15) 0%, rgba(0,0,0,0) 100%) !important;
  color: #00aaff !important;
  text-shadow: 0 0 8px rgba(0, 170, 255, 0.6);
  border-left: 2px solid #00aaff;
}

.arco-trigger-popup .arco-menu .arco-menu-item.arco-menu-selected,
.arco-menu-pop .arco-menu-item.arco-menu-selected {
  background: transparent !important;
  color: #00aaff !important;
}

/* 溢出触发按钮样式 */
.arco-menu-overflow-wrap .arco-menu-overflow-sub-menu-trigger {
  color: rgba(255, 255, 255, 0.7) !important;
}

.arco-menu-overflow-wrap .arco-menu-overflow-sub-menu-trigger:hover {
  color: #00aaff !important;
}

/* Trigger popup 容器本身 */
.arco-trigger-popup {
  --color-bg-popup: rgba(10, 15, 10, 0.95);
}
</style>
