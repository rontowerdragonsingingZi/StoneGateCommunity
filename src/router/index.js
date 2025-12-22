import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../layout/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('../views/HomeView.vue')
      },
      {
        path: 'community',
        name: 'Community',
        component: () => import('../views/CommunityView.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router