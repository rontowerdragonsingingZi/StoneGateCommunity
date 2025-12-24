import { post, get } from './request'

/**
 * 上传图片到图床 (Cloudflare R2)
 * 路径由后端自动生成：users/{user_id}/{uuid}.{ext}
 * @param {File} file - 图片文件 (jpg/jpeg/png/gif/webp/avif, ≤50MB)
 * @returns {Promise<{code: number, message: string, data: {key: string, mime: string, size: number, url: string}}>}
 */
export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return post('/upload-image', formData)
}

/**
 * 获取当前用户的图片列表
 * @param {Object} params - 查询参数
 * @param {number} [params.per_page=50] - 每页数量
 * @param {number} [params.page=1] - 页码
 */
export function getImages({ per_page = 50, page = 1 } = {}) {
  const params = new URLSearchParams()
  params.append('per_page', per_page)
  params.append('page', page)
  return get(`/images?${params.toString()}`)
}
