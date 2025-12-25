import { post, get } from './request'

/**
 * 发送私聊消息
 * @param {number} friendId - 好友ID
 * @param {string} content - 消息内容
 * @param {string} [type='text'] - 消息类型：text/image/system
 */
export function sendPrivateMessage(friendId, content, type = 'text') {
  return post('/private-chat/send', { friend_id: friendId, content, type })
}

/**
 * 获取私聊历史消息
 * @param {Object} params - 查询参数
 * @param {number} params.friendId - 好友ID
 * @param {number} [params.before_id] - 获取该 ID 之前的消息
 * @param {number} [params.limit=50] - 获取数量
 */
export function getPrivateChatHistory({ friendId, before_id, limit = 50 } = {}) {
  if (!friendId) {
    return Promise.reject(new Error('friendId is required'))
  }
  const params = new URLSearchParams()
  params.append('friend_id', friendId)
  if (before_id) params.append('before_id', before_id)
  params.append('limit', limit)
  return get(`/private-chat/history?${params.toString()}`)
}

/**
 * 生成会话ID（与后端保持一致）
 */
export function makeConversationId(userId1, userId2) {
  const ids = [userId1, userId2].sort((a, b) => a - b)
  return ids.join('_')
}
