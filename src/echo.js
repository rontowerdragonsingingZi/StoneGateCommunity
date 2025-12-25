import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

let echoInstance = null

/**
 * 获取 Token（直接从 localStorage 读取，避免循环依赖）
 */
function getTokenDirect() {
  return localStorage.getItem('token')
}

/**
 * 获取或创建 Echo 实例
 */
export function getEcho() {
  if (echoInstance) {
    return echoInstance
  }

  const token = getTokenDirect()

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: 'stonegate-key',
    wsHost: 'ws.mahoer.space',
    wsPort: 443,
    wssPort: 443,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: 'https://api.mahoer.space/api/broadcasting/auth',
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })

  return echoInstance
}

/**
 * 更新 Echo 认证 Token（登录后调用）
 */
export function updateEchoAuth() {
  if (echoInstance) {
    echoInstance.connector.options.auth.headers.Authorization = `Bearer ${getTokenDirect()}`
  }
}

/**
 * 断开 Echo 连接（登出时调用）
 */
export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect()
    echoInstance = null
  }
}

export default getEcho
