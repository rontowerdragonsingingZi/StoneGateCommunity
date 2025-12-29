import { get, post, del } from './request'

/**
 * 获取表情列表（系统+自己的+收藏的）
 */
export function getStickers(category = null) {
  const query = category ? `?category=${encodeURIComponent(category)}` : ''
  return get(`/stickers${query}`)
}

/**
 * 获取系统表情
 */
export function getSystemStickers(category = null) {
  const query = category ? `?category=${encodeURIComponent(category)}` : ''
  return get(`/stickers/system${query}`)
}

/**
 * 获取公开表情（其他用户上传的）
 */
export function getPublicStickers(page = 1, perPage = 50) {
  return get(`/stickers/public?page=${page}&per_page=${perPage}`)
}

/**
 * 上传新表情（普通用户）
 */
export function uploadSticker(file, options = {}) {
  const formData = new FormData()
  formData.append('file', file)
  if (options.name) formData.append('name', options.name)
  if (options.category) formData.append('category', options.category)
  if (options.is_public !== undefined) formData.append('is_public', options.is_public ? '1' : '0')
  
  return post('/stickers', formData)
}

/**
 * 管理员上传默认表情
 */
export function uploadDefaultSticker(file, options = {}) {
  const formData = new FormData()
  formData.append('file', file)
  if (options.name) formData.append('name', options.name)
  if (options.category) formData.append('category', options.category)
  
  return post('/stickers/default', formData)
}

/**
 * 收藏表情
 */
export function collectSticker(id) {
  return post(`/stickers/${id}/collect`, {})
}

/**
 * 取消收藏
 */
export function uncollectSticker(id) {
  return del(`/stickers/${id}/collect`)
}

/**
 * 删除自己的表情
 */
export function deleteSticker(id) {
  return del(`/stickers/${id}`)
}
