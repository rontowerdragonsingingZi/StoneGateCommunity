import { post, get } from './request'

/**
 * 发送消息到指定频道
 * @param {string} channel - 频道名称
 * @param {string} content - 消息内容
 * @param {string} [type='text'] - 消息类型：text/image/system
 */
export function sendMessage(channel, content, type = 'text') {
  return post('/chat/send', { channel, content, type })
}

/**
 * 获取指定频道的历史消息
 * @param {Object} params - 查询参数
 * @param {string} params.channel - 频道名称
 * @param {number} [params.before_id] - 获取该 ID 之前的消息
 * @param {number} [params.limit=50] - 获取数量
 */
export function getChatHistory({ channel, before_id, limit = 50 } = {}) {
  if (!channel) {
    return Promise.reject(new Error('Channel is required'))
  }
  const params = new URLSearchParams()
  params.append('channel', channel)
  if (before_id) params.append('before_id', before_id)
  params.append('limit', limit)
  return get(`/chat/history?${params.toString()}`)
}
