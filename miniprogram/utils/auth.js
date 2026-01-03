function getOpenid () {
  const app = getApp()
  if (app && app.globalData && app.globalData.openid) {
    return app.globalData.openid
  }
  try {
    const stored = wx.getStorageSync('openid')
    if (stored) {
      if (app && app.globalData) {
        app.globalData.openid = stored
      }
      return stored
    }
  } catch (e) {
    console.warn('getOpenid storage error', e)
  }
  return ''
}

module.exports = {
  getOpenid
}
