import { get, post, del } from './request'

/**
 * 获取通知列表
 * @param {Object} params - { type?, limit?, page? }
 */
export function getNotifications(params = {}) {
  const query = new URLSearchParams()
  if (params.type) query.append('type', params.type)
  if (params.limit) query.append('limit', params.limit)
  if (params.page) query.append('page', params.page)
  const queryString = query.toString()
  return get(`/notifications${queryString ? '?' + queryString : ''}`)
}

/**
 * 获取未读通知数量
 */
export function getUnreadCount() {
  return get('/notifications/unread-count')
}

/**
 * 标记指定通知为已读
 * @param {Array<number>} ids - 通知ID数组
 */
export function markAsRead(ids) {
  return post('/notifications/read', { ids })
}

/**
 * 标记所有通知为已读
 * @param {string} type - 可选，只标记某类型
 */
export function markAllAsRead(type = null) {
  return post('/notifications/read-all', type ? { type } : {})
}

/**
 * 删除通知
 * @param {number} id - 通知ID
 */
export function deleteNotification(id) {
  return del(`/notifications/${id}`)
}
