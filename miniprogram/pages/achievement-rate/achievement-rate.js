const { request } = require('../../utils/request')
const { getOpenid } = require('../../utils/auth')

Page({

  data: {
    overallRate: 0,
    completedCount: 0,
    totalCount: 0,
    habits: [],
    loading: false
  },

  onLoad () {
    this.openid = getOpenid()
    if (!this.openid) {
      wx.showToast({ title: '登录中，请稍后重试', icon: 'none' })
      return
    }
    this.fetchAchievementRate()
  },


  async fetchAchievementRate () {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const res = await request({
        url: '/statistics/achievement-rate',
        method: 'GET',
        data: { openid: this.openid }
      })

      const data = res.data || {}
      const habits = (data.habits || []).map(item => {
        const rate = item.achievement_rate || 0
        let color = '#FF9800'
        if (rate >= 80) {
          color = '#4CAF50'
        } else if (rate <= 40) {
          color = '#F44336'
        }
        return {
          ...item,
          achievementRate: rate,
          progressColor: color,
          targetValue: item.target_value || 0,
          actualValue: item.actual_value || 0
        }
      })

      this.setData({
        overallRate: data.achievement_rate || 0,
        completedCount: data.completed_habits || 0,
        totalCount: data.total_habits || 0,
        habits
      })

    } catch (e) {
      console.error('fetchAchievementRate error', e)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  }
})
