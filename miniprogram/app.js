const { request, BASE_URL } = require('./utils/request')

App({
  globalData: {
    // 与 utils/request.js 保持一致，避免接口和上传地址不一致
    apiBaseUrl: BASE_URL,
    userInfo: null,
    openid: null
  },


  onLaunch () {
    console.log('Habit Diary mini-program launched')
    this.initLogin()
  },

  initLogin () {
    const storedOpenid = wx.getStorageSync('openid')
    if (storedOpenid) {
      this.globalData.openid = storedOpenid
      return
    }

    wx.login({
      success: async (res) => {
        if (!res.code) {
          console.warn('wx.login no code', res)
          wx.showToast({ title: '登录失败，请重试', icon: 'none' })
          return
        }

        try {
          const resp = await request({
            url: '/auth/login',
            method: 'POST',
            data: { code: res.code }
          })
          const openid = resp?.data?.openid
          if (!openid) {
            wx.showToast({ title: '登录异常', icon: 'none' })
            return
          }
          this.globalData.openid = openid
          wx.setStorageSync('openid', openid)
        } catch (e) {
          console.error('login error', e)
          wx.showToast({ title: '登录失败', icon: 'none' })
        }
      },
      fail: (err) => {
        console.error('wx.login failed', err)
        wx.showToast({ title: '登录失败', icon: 'none' })
      }
    })
  }
})

