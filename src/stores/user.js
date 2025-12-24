import { defineStore } from 'pinia'
import { ref } from 'vue'
import { setToken, removeToken } from '../api/request'

export const useUserStore = defineStore('user', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)

  /**
   * 登录成功后保存用户信息和token
   * @param {Object} userData - 用户信息
   * @param {string} [token] - JWT token
   */
  const login = (userData, token) => {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
    if (token) {
      setToken(token)
    }
  }

  /**
   * 退出登录，清除用户信息和token
   */
  const logout = () => {
    user.value = null
    localStorage.removeItem('user')
    removeToken()
  }

  return {
    user,
    login,
    logout
  }
})
