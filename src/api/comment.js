import { get, post, del } from './request'

/**
 * 获取帖子的评论列表
 * @param {number} postId - 帖子ID
 * @param {Object} params - 查询参数
 * @param {number} [params.limit] - 每页数量，默认20
 * @param {number} [params.page] - 页码，默认1
 */
export function getComments(postId, params = {}) {
  const query = new URLSearchParams(params).toString()
  return get(`/posts/${postId}/comments${query ? '?' + query : ''}`)
}

/**
 * 发表评论
 * @param {number} postId - 帖子ID
 * @param {Object} data - 评论数据
 * @param {string} data.content - 评论内容
 * @param {number} [data.parent_id] - 回复的评论ID
 */
export function createComment(postId, data) {
  return post(`/posts/${postId}/comments`, data)
}

/**
 * 删除评论
 * @param {number} postId - 帖子ID
 * @param {number} commentId - 评论ID
 */
export function deleteComment(postId, commentId) {
  return del(`/posts/${postId}/comments/${commentId}`)
}

/**
 * 评论点赞/取消点赞
 * @param {number} postId - 帖子ID
 * @param {number} commentId - 评论ID
 */
export function toggleCommentLike(postId, commentId) {
  return post(`/posts/${postId}/comments/${commentId}/like`)
}
