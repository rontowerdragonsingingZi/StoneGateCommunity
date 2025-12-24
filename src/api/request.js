const BASE_URL = 'https://api.mahoer.space/api'

/**
 * 获取存储的 JWT token
 */
export function getToken() {
  return localStorage.getItem('token')
}

/**
 * 设置 JWT token
 */
export function setToken(token) {
  localStorage.setItem('token', token)
}

/**
 * 清除 JWT token
 */
export function removeToken() {
  localStorage.removeItem('token')
}

/**
 * 统一请求方法（自动添加 JWT）
 * @param {string} url - 请求路径（不含 BASE_URL）
 * @param {Object} options - fetch 选项
 * @param {boolean} [withAuth=true] - 是否需要认证
 */
export async function request(url, options = {}, withAuth = true) {
  const headers = {
    ...options.headers
  }

  // 添加 JWT token
  if (withAuth) {
    const token = getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  // 如果不是 FormData，添加 Content-Type
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers
  })

  return response.json()
}

/**
 * GET 请求
 */
export function get(url, withAuth = true) {
  return request(url, { method: 'GET' }, withAuth)
}

/**
 * POST 请求
 */
export function post(url, data, withAuth = true) {
  const isFormData = data instanceof FormData
  return request(url, {
    method: 'POST',
    body: isFormData ? data : JSON.stringify(data)
  }, withAuth)
}

/**
 * PUT 请求
 */
export function put(url, data, withAuth = true) {
  return request(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  }, withAuth)
}

/**
 * DELETE 请求
 */
export function del(url, withAuth = true) {
  return request(url, { method: 'DELETE' }, withAuth)
}

export { BASE_URL }
