const https = require('https')
const querystring = require('querystring')
const asyncHandler = require('../utils/asyncHandler')

// 调用微信 jscode2session 获取 openid
function requestWeChatSession ({ appId, appSecret, jsCode }) {
  const params = querystring.stringify({
    appid: appId,
    secret: appSecret,
    js_code: jsCode,
    grant_type: 'authorization_code'
  })

  const urlPath = `/sns/jscode2session?${params}`

  return new Promise((resolve, reject) => {
    const req = https.request({
      host: 'api.weixin.qq.com',
      path: urlPath,
      method: 'GET'
    }, (res) => {
      let raw = ''
      res.on('data', (chunk) => { raw += chunk })
      res.on('end', () => {
        try {
          const data = JSON.parse(raw)
          resolve(data)
        } catch (err) {
          reject(err)
        }
      })
    })

    req.on('error', reject)
    req.end()
  })
}

// POST /api/auth/login
// body: { code }
const login = asyncHandler(async (req, res) => {
  const code = (req.body.code || '').trim()
  if (!code) {
    const error = new Error('code is required')
    error.status = 400
    throw error
  }

  const appId = process.env.APP_ID
  const appSecret = process.env.APP_SECRET

  if (!appId || !appSecret) {
    console.warn('[auth] APP_ID or APP_SECRET not configured')
    const error = new Error('server auth config missing')
    error.status = 500
    throw error
  }

  const data = await requestWeChatSession({ appId, appSecret, jsCode: code })

  if (!data || data.errcode) {
    console.error('[auth] jscode2session error', data)
    const error = new Error(data?.errmsg || 'wechat auth failed')
    error.status = 502
    throw error
  }

  const { openid, session_key: sessionKey } = data

  if (!openid) {
    const error = new Error('openid not found in wechat response')
    error.status = 502
    throw error
  }

  res.json({
    status: 'success',
    data: {
      openid,
      session_key: sessionKey
    }
  })
})

module.exports = {
  login
}
