const { request } = require('../../utils/request')
const { getOpenid } = require('../../utils/auth')

Page({

  data: {
    habitId: null,
    habit: null,

    completed: true,
    satisfactionScore: 5,
    timeSpent: '',
    completionNotes: '',

    submitting: false
  },

  onLoad (options) {
    this.openid = getOpenid()
    const { id } = options || {}

    if (!id) {
      wx.showToast({ title: '缺少习惯ID', icon: 'none' })
      return
    }
    this.setData({ habitId: id })
    this.fetchHabitDetail(id)
  },

  async fetchHabitDetail (id) {
    try {
      const res = await request({
        url: `/habits/${id}`,
        method: 'GET',
        data: { openid: this.openid }
      })
      const raw = res.data
      if (!raw) return

      const target = raw.targetValue ?? raw.target_value ?? 0
      const actual = raw.actualValue ?? raw.actual_value ?? 0
      const achievementRate = target > 0 ? Math.round((actual / target) * 100) : 0

      const habit = {
        ...raw,
        targetValue: target,
        actualValue: actual,
        achievementRate,
        timeSlotText: this.getTimeSlotText(raw.timeSlot || raw.time_slot)
      }

      wx.setNavigationBarTitle({ title: habit.name || '习惯打卡' })

      this.setData({ habit })
    } catch (e) {
      console.error('fetchHabitDetail error', e)
    }
  },

  getTimeSlotText (value) {
    switch (value) {
      case 'morning':
        return '上午'
      case 'afternoon':
        return '下午'
      case 'evening':
        return '晚上'
      default:
        return '不限时段'
    }
  },


  handleStatusChange (e) {
    this.setData({ completed: e.detail.value })
  },

  handleRating (e) {
    const score = Number(e.currentTarget.dataset.score)
    this.setData({ satisfactionScore: score })
  },

  handleTimeSpentInput (e) {
    this.setData({ timeSpent: e.detail.value.replace(/[^0-9]/g, '') })
  },

  handleNotesInput (e) {
    this.setData({ completionNotes: e.detail.value })
  },

  async handleSubmit () {
    if (this.data.submitting) return

    const payload = {
      openid: this.openid,
      completed: this.data.completed ? 1 : 0,
      satisfaction_score: this.data.satisfactionScore,
      time_spent: this.data.timeSpent ? Number(this.data.timeSpent) : null,
      completion_notes: this.data.completionNotes
    }

    if (!payload.completed && !payload.completion_notes) {
      wx.showToast({ title: '可以简单写一下今天的情况哦~', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    try {
      await request({
        url: `/habits/${this.data.habitId}/check-in`,
        method: 'POST',
        data: payload
      })
      wx.showToast({ title: '打卡成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 500)
    } catch (e) {
      console.error('handleSubmit error', e)
      wx.showToast({ title: '提交失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }

})
