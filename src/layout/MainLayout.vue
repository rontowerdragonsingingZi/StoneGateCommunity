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
           <a-button class="login-btn" type="text" @click="$router.push('/login')">登录 / 注册</a-button>
        </div>
      </div>
    </a-layout-header>
    <a-layout-content class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </a-layout-content>
    <a-layout-footer class="footer" v-if="!isHome">
      Stone Gate Community &copy; 2025 Created by Future Gadget Lab
    </a-layout-footer>
  </a-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

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
  max-width: 1400px;
  margin: 0 auto;
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

.login-btn {
  color: #fff !important;
  font-family: 'Share Tech Mono', monospace;
}

.login-btn:hover {
  color: #00aaff !important;
  background: rgba(0, 170, 255, 0.1) !important;
}

.main-content {
  flex: 1;
  /* 如果 Header 是 fixed，需要 padding-top 避免内容被遮挡，
     但对于 Home 页（透明 Header），不需要 padding */
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
