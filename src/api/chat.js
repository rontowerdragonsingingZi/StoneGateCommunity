import { post, get } from './request'

/**
 * 发送消息到大厅
 * @param {string} content - 消息内容
 * @param {string} [type='text'] - 消息类型：text/image/system
 */
export function sendMessage(content, type = 'text') {
  return post('/chat/send', { content, type })
}

/**
 * 获取历史消息
 * @param {Object} params - 查询参数
 * @param {number} [params.before_id] - 获取该 ID 之前的消息
 * @param {number} [params.limit=50] - 获取数量
 */
export function getChatHistory({ before_id, limit = 50 } = {}) {
  const params = new URLSearchParams()
  if (before_id) params.append('before_id', before_id)
  params.append('limit', limit)
  return get(`/chat/history?${params.toString()}`)
}
