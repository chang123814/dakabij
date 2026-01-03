// 根据小程序环境自动切换 API 域名
// develop: 开发版（本地调试）
// trial:   体验版
// release: 正式版

const ENV_CONFIG = {
  // 开发阶段：为了方便真机调试，这里也直接指向线上后端
  // 如果以后需要本地联调，再把 develop 改回 http://localhost:3000/api 即可
  develop: 'https://api.qinghanju.cn/api',      // 开发版（含真机调试）：统一走线上服务器
  trial: 'https://api.qinghanju.cn/api',        // 体验版：腾讯云轻量服务器
  release: 'https://api.qinghanju.cn/api'       // 正式版：腾讯云轻量服务器
}



function getBaseUrl () {
  try {
    // 微信提供的环境信息：develop / trial / release
    const info = wx.getAccountInfoSync && wx.getAccountInfoSync()
    const env = info && info.miniProgram && info.miniProgram.envVersion
    if (env && ENV_CONFIG[env]) {
      return ENV_CONFIG[env]
    }
    // 找不到时默认用开发环境
    return ENV_CONFIG.develop
  } catch (e) {
    // 老版本基础库不支持 getAccountInfoSync 时兜底
    return ENV_CONFIG.develop
  }
}

const BASE_URL = getBaseUrl()

function request ({ url, method = 'GET', data = {}, header = {} }) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 后端统一返回 { status, data, message }，这里直接把 res.data 透出去
          resolve(res.data)
        } else {
          reject(res.data || { message: '请求失败', statusCode: res.statusCode })
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

module.exports = {
  request,
  BASE_URL
}
