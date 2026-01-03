Page({
  data: {},

  onLoad () {
    console.log('Statistics page ready')
  },

  onShow () {
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar && tabBar.setSelected) {
      tabBar.setSelected(2)
    }
  },


  handleNavigateAchievement () {
    wx.navigateTo({
      url: '/pages/achievement-rate/achievement-rate'
    })
  },

  handleNavigateEfficiency () {
    wx.navigateTo({
      url: '/pages/efficiency/efficiency'
    })
  },

  handleNavigateMaterialStatistics () {
    wx.navigateTo({
      url: '/pages/material-statistics/material-statistics'
    })
  },

  handleNavigateCompare () {
    wx.navigateTo({
      url: '/pages/compare/compare'
    })
  },

  handleNavigateTrend () {
    wx.navigateTo({
      url: '/pages/trend/trend'
    })
  }
})





