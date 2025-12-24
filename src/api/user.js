import { post, put, del } from './request'

/**
 * 用户注册（不需要JWT）
 * @param {Object} data - 注册信息
 * @param {string} data.name - Labmem代号 (必填)
 * @param {string} data.password - D-Mail密钥，最少6位 (必填)
 * @param {string} [data.email] - 联络邮箱
 * @param {string} [data.gender] - 性别: male / female / other
 * @param {string} [data.avatar] - 头像路径
 * @param {string} [data.contact] - 联系方式
 */
export function register(data) {
  return post('/users', data, false)
}

/**
 * 用户登录（不需要JWT）
 * @param {Object} data - 登录信息
 * @param {string} data.name - Labmem代号 (必填)
 * @param {string} data.password - D-Mail密钥 (必填)
 */
export function login(data) {
  return post('/users/login', data, false)
}

/**
 * 更新用户信息（需要JWT）
 * @param {number} id - 用户ID
 * @param {Object} data - 更新信息（所有字段可选）
 */
export function updateUser(id, data) {
  return put(`/users/${id}`, data)
}

/**
 * 删除用户（注销，需要JWT）
 * @param {number} id - 用户ID
 */
export function deleteUser(id) {
  return del(`/users/${id}`)
}
