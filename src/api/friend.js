import { post, get, del } from './request'

/**
 * 获取好友列表
 */
export function getFriends() {
  return get('/friends')
}

/**
 * 发送好友请求
 * @param {number} friendId - 目标用户ID
 */
export function sendFriendRequest(friendId) {
  return post('/friends/request', { friend_id: friendId })
}

/**
 * 获取待处理的好友请求
 */
export function getFriendRequests() {
  return get('/friends/requests')
}

/**
 * 接受好友请求
 * @param {number} requestId - 请求ID
 */
export function acceptFriendRequest(requestId) {
  return post(`/friends/${requestId}/accept`)
}

/**
 * 拒绝好友请求
 * @param {number} requestId - 请求ID
 */
export function rejectFriendRequest(requestId) {
  return post(`/friends/${requestId}/reject`)
}

/**
 * 删除好友
 * @param {number} friendId - 好友ID
 */
export function deleteFriend(friendId) {
  return del(`/friends/${friendId}`)
}

/**
 * 搜索用户（用于添加好友）
 * @param {string} query - 搜索关键词
 */
export function searchUsers(query) {
  return get(`/users/search?q=${encodeURIComponent(query)}`)
}
