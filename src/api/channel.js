import { post, get } from './request'

/**
 * 获取频道列表
 */
export function getChannels() {
  return get('/channels')
}

/**
 * 获取单个频道详情
 * @param {string} name - 频道名称
 */
export function getChannel(name) {
  return get(`/channels/${name}`)
}

/**
 * 创建新频道
 * @param {Object} data - 频道数据
 * @param {string} data.name - 频道名称（小写字母、数字、下划线、短横线）
 * @param {string} data.display_name - 显示名称
 * @param {string} [data.description] - 频道描述
 * @param {boolean} [data.is_private=false] - 是否私有
 */
export function createChannel(data) {
  return post('/channels', data)
}
