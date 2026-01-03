const { request } = require('../../utils/request')
const { getOpenid } = require('../../utils/auth')

Page({

  data: {
    loading: false,
    summary: null,
    habits: []
  },

  onLoad () {
    this.openid = getOpenid()
    if (!this.openid) {
      wx.showToast({ title: '登录中，请稍后重试', icon: 'none' })
      return
    }
    this.fetchEfficiency()
  },

  async fetchEfficiency () {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const res = await request({
        url: '/statistics/efficiency',
        method: 'GET',
        data: {
          openid: this.openid
        }
      })
      const data = res.data || {}

      const habits = data.habits || []
      const maxCheckIns = habits.reduce((m, item) => (item.check_in_count > m ? item.check_in_count : m), 0) || 1
      const mappedHabits = habits.map(item => ({
        ...item,
        checkInBarPercent: Math.round((item.check_in_count / maxCheckIns) * 100)
      }))

      this.setData({
        summary: {
          averageTimeSpent: data.average_time_spent || 0,
          averageSatisfaction: data.average_satisfaction || 0,
          mostEfficientTimeSlotText: data.most_efficient_time_slot_text || '暂无数据',
          totalCheckIns: data.total_check_ins || 0
        },
        habits: mappedHabits
      })

    } catch (e) {
      console.error('fetchEfficiency error', e)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  onPullDownRefresh () {
    this.fetchEfficiency()
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  }

})
