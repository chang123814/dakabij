const { getOpenid } = require('../../utils/auth')

Page({

  data: {
    userInfo: null,
    hasUserInfo: false,
    openid: ''
  },

  onLoad () {
    console.log('Profile page bootstrapped')
    this.initUser()
  },

  onShow () {
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar && tabBar.setSelected) {
      tabBar.setSelected(3)
    }
    this.initUser()
  },


  initUser () {
    const app = getApp()
    const openid = getOpenid()

    let userInfo = null
    if (app && app.globalData && app.globalData.userInfo) {
      userInfo = app.globalData.userInfo
    } else {
      try {
        const stored = wx.getStorageSync('userInfo')
        if (stored) {
          userInfo = stored
          if (app && app.globalData) {
            app.globalData.userInfo = stored
          }
        }
      } catch (e) {
        console.warn('load userInfo storage error', e)
      }
    }

    this.setData({
      openid,
      userInfo,
      hasUserInfo: !!userInfo
    })
  },

  handleGetUserProfile () {
    wx.getUserProfile({
      desc: '用于展示个性化头像和昵称',
      success: (res) => {
        const userInfo = res.userInfo
        const app = getApp()
        if (app && app.globalData) {
          app.globalData.userInfo = userInfo
        }
        try {
          wx.setStorageSync('userInfo', userInfo)
        } catch (e) {
          console.warn('save userInfo storage error', e)
        }
        this.setData({
          userInfo,
          hasUserInfo: true
        })
      },
      fail: (err) => {
        console.error('getUserProfile fail', err)
        wx.showToast({ title: '未授权获取头像昵称', icon: 'none' })
      }
    })
  },

  handleRelogin () {
    const app = getApp()
    if (app && app.initLogin) {
      app.initLogin()
      setTimeout(() => {
        this.initUser()
      }, 600)
    } else {
      wx.showToast({ title: '暂无法重新登录', icon: 'none' })
    }
  },

  handleGoNotes () {
    wx.navigateTo({
      url: '/pages/notes/notes'
    })
  },

  handleGoMaterials () {
    wx.switchTab({
      url: '/pages/materials/materials'
    })
  },

  // 以下菜单项暂时作为占位，后续可接入真实功能
  handleShareApp () {
    wx.showShareMenu({ withShareTicket: true })
  },

  handleContactService () {
    wx.showToast({ title: '联系客服功能待接入', icon: 'none' })
  },

  handleFeedback () {
    wx.showToast({ title: '意见反馈功能待接入', icon: 'none' })
  },

  handleHistory () {
    wx.showToast({ title: '历史记录功能待接入', icon: 'none' })
  },

  handleOpenSettings () {
    wx.openSetting({})
  },

  handleVipUpgrade () {
    wx.showToast({ title: 'VIP 功能规划中', icon: 'none' })
  },

  handleFollow () {
    wx.showToast({ title: '请在公众号中搜索“习惯日记”关注', icon: 'none' })
  }


})

