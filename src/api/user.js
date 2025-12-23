const BASE_URL = 'https://api.mahoer.space/api'

/**
 * 用户注册
 * @param {Object} data - 注册信息
 * @param {string} data.name - Labmem代号 (必填)
 * @param {string} data.password - D-Mail密钥，最少6位 (必填)
 * @param {string} [data.email] - 联络邮箱
 * @param {string} [data.gender] - 性别: male / female / other
 * @param {string} [data.avatar] - 头像路径
 * @param {string} [data.contact] - 联系方式
 */
export async function register(data) {
  const response = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  return response.json()
}

/**
 * 用户登录
 * @param {Object} data - 登录信息
 * @param {string} data.name - Labmem代号 (必填)
 * @param {string} data.password - D-Mail密钥 (必填)
 */
export async function login(data) {
  const response = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  return response.json()
}
