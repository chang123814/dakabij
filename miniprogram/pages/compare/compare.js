const { request } = require('../../utils/request')
const { getOpenid } = require('../../utils/auth')

Page({

  data: {
    loading: false,
    currentPeriod: null,
    previousPeriod: null,
    growth: null,

    // 日期选择器绑定值
    startDate: '',
    endDate: '',
    compareStartDate: '',
    compareEndDate: ''
  },

  onLoad () {
    this.openid = getOpenid()
    if (!this.openid) {
      wx.showToast({ title: '登录中，请稍后重试', icon: 'none' })
      return
    }
    this.fetchCompare()
  },


  buildQueryParams () {
    const params = { openid: this.openid }
    const { startDate, endDate, compareStartDate, compareEndDate } = this.data

    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate
    if (compareStartDate) params.compare_start_date = compareStartDate
    if (compareEndDate) params.compare_end_date = compareEndDate

    return params
  },

  async fetchCompare () {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const res = await request({
        url: '/statistics/compare',
        method: 'GET',
        data: this.buildQueryParams()
      })

      const data = res.data || {}
      const currentPeriod = data.current_period || null
      const previousPeriod = data.previous_period || null

      // 如果用户还没手动选过日期，用接口返回的区间初始化选择器
      const nextData = { currentPeriod, previousPeriod, growth: data.growth || null }
      if (currentPeriod && !this.data.startDate && !this.data.endDate) {
        nextData.startDate = currentPeriod.start_date
        nextData.endDate = currentPeriod.end_date
      }
      if (previousPeriod && !this.data.compareStartDate && !this.data.compareEndDate) {
        nextData.compareStartDate = previousPeriod.start_date
        nextData.compareEndDate = previousPeriod.end_date
      }

      this.setData(nextData)
    } catch (e) {
      console.error('fetchCompare error', e)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  onPullDownRefresh () {
    this.fetchCompare().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 当前周期日期选择
  handleStartDateChange (e) {
    this.setData({ startDate: e.detail.value })
  },

  handleEndDateChange (e) {
    this.setData({ endDate: e.detail.value })
  },

  // 对比周期日期选择
  handleCompareStartDateChange (e) {
    this.setData({ compareStartDate: e.detail.value })
  },

  handleCompareEndDateChange (e) {
    this.setData({ compareEndDate: e.detail.value })
  },

  handleApplyRange () {
    this.fetchCompare()
  }
})

