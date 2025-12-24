const BASE_URL = 'https://api.mahoer.space/api'

/**
 * 上传图片到图床 (Cloudflare R2)
 * @param {File} file - 图片文件 (jpg/jpeg/png/gif/webp/avif, ≤10MB)
 * @param {string} [folder] - 目标目录，默认 uploads/images
 * @returns {Promise<{code: number, message: string, data: {key: string, mime: string, size: number, url: string}}>}
 */
export async function uploadImage(file, folder = 'uploads/images') {
  const formData = new FormData()
  formData.append('file', file)
  if (folder) {
    formData.append('folder', folder)
  }

  const response = await fetch(`${BASE_URL}/upload-image`, {
    method: 'POST',
    body: formData
  })
  return response.json()
}

/**
 * 获取图片列表
 * @param {Object} params - 查询参数
 * @param {string} [params.folder] - 目录
 * @param {number} [params.per_page=50] - 每页数量
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.deep=1] - 是否递归查询子目录
 */
export async function getImages({ folder = '', per_page = 50, page = 1, deep = 1 } = {}) {
  const params = new URLSearchParams()
  if (folder) params.append('folder', folder)
  params.append('per_page', per_page)
  params.append('page', page)
  params.append('deep', deep)

  const response = await fetch(`${BASE_URL}/images?${params.toString()}`)
  return response.json()
}
