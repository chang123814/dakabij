const { request } = require('../../utils/request')
const { getOpenid } = require('../../utils/auth')

Page({

  data: {
    loading: false,
    summary: null,
    trend: []
  },

  onLoad () {
    this.openid = getOpenid()
    if (!this.openid) {
      wx.showToast({ title: '登录中，请稍后重试', icon: 'none' })
      return
    }
    this.fetchTrend()
  },


  async fetchTrend () {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const res = await request({
        url: '/statistics/trend',
        method: 'GET',
        data: {
          openid: this.openid
        }
      })
      const data = res.data || {}
      const trend = data.trend || []
      const max = trend.reduce((m, item) => (item.value > m ? item.value : m), 0)
      const mapped = trend.map(item => ({
        ...item,
        barPercent: max ? Math.round((item.value / max) * 100) : 0
      }))
      this.setData({
        summary: {
          average: data.average || 0,
          max: data.max || 0,
          min: data.min || 0,
          growthRate: data.growth_rate || 0
        },
        trend: mapped
      })
    } catch (e) {
      console.error('fetchTrend error', e)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  onPullDownRefresh () {
    this.fetchTrend().finally(() => {
      wx.stopPullDownRefresh()
    })
  }
})
