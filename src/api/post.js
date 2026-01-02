import { get, post, put, del } from './request'

/**
 * 获取帖子列表
 * @param {Object} params - 查询参数
 * @param {string} [params.search] - 搜索关键词（标题和内容）
 * @param {string} [params.tag] - 标签筛选：THEORY/TECH/MISSION/GENERAL
 * @param {number} [params.user_id] - 按作者筛选
 * @param {number} [params.limit] - 每页数量，默认20
 * @param {number} [params.page] - 页码，默认1
 */
export function getPosts(params = {}) {
  const query = new URLSearchParams(params).toString()
  return get(`/posts${query ? '?' + query : ''}`)
}

/**
 * 获取帖子详情
 * @param {number} id - 帖子ID
 */
export function getPost(id) {
  return get(`/posts/${id}`)
}

/**
 * 创建帖子
 * @param {Object} data - 帖子数据
 * @param {string} data.title - 标题
 * @param {string} data.content - 内容
 * @param {string} [data.cover] - 封面图片URL
 * @param {string} [data.tag] - 标签，默认GENERAL
 */
export function createPost(data) {
  return post('/posts', data)
}

/**
 * 更新帖子
 * @param {number} id - 帖子ID
 * @param {Object} data - 更新数据
 */
export function updatePost(id, data) {
  return put(`/posts/${id}`, data)
}

/**
 * 删除帖子
 * @param {number} id - 帖子ID
 */
export function deletePost(id) {
  return del(`/posts/${id}`)
}

/**
 * 点赞/取消点赞
 * @param {number} id - 帖子ID
 */
export function toggleLike(id) {
  return post(`/posts/${id}/like`)
}
