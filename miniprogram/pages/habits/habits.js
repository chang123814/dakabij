const { request } = require('../../utils/request')
const { getOpenid } = require('../../utils/auth')

Page({

  data: {
    keyword: '',

    // 分类筛选（来自任务分类接口）
    categories: [],
    categoryNames: ['全部分类'],
    selectedCategoryIndex: 0,

    // 时间段筛选
    timeSlotOptions: [
      { value: '', label: '全部时段' },
      { value: 'morning', label: '上午' },
      { value: 'afternoon', label: '下午' },
      { value: 'evening', label: '晚上' }
    ],
    timeSlotLabels: ['全部时段', '上午', '下午', '晚上'],
    selectedTimeSlotIndex: 0,

    // 标签筛选（从标签表读取）
    availableTags: [],
    selectedTag: '',

    habits: [],
    loading: false
  },

  onLoad () {
    this.openid = getOpenid()
    if (!this.openid) {
      wx.showToast({ title: '登录中，请稍后重试', icon: 'none' })
      return
    }
    this.fetchTaskCategories()
    this.fetchAvailableTags()
    this.fetchHabits()
  },

  onShow () {
    // 返回本页时刷新一次，保证新建/编辑后的习惯能显示
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar && tabBar.setSelected) {
      tabBar.setSelected(0)
    }
    this.openid = getOpenid()
    if (this.openid) {
      this.fetchAvailableTags()
      this.fetchHabits()
    }
  },



  async fetchTaskCategories () {
    try {
      const res = await request({
        url: '/task-categories',
        method: 'GET',
        data: { openid: this.openid }
      })
      const list = res.data || []
      const names = ['全部分类', ...list.map(item => item.name)]
      this.setData({
        categories: list,
        categoryNames: names
      })
    } catch (e) {
      console.error('fetchTaskCategories error', e)
    }
  },

  async fetchAvailableTags () {
    try {
      const res = await request({
        url: '/tags',
        method: 'GET',
        data: {
          openid: this.openid,
          tag_type: 'task',
          status: 1
        }
      })
      this.setData({ availableTags: res.data || [] })
    } catch (e) {
      console.error('fetchAvailableTags error', e)
    }
  },

  async fetchHabits () {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const data = {
        openid: this.openid
      }

      // 分类筛选
      if (this.data.selectedCategoryIndex > 0) {
        const category = this.data.categories[this.data.selectedCategoryIndex - 1]
        if (category) {
          data.category_id = category.id
        }
      }

      // 时间段筛选
      const timeSlot = this.data.timeSlotOptions[this.data.selectedTimeSlotIndex]
      if (timeSlot && timeSlot.value) {
        data.time_slot = timeSlot.value
      }

      // 标签筛选
      if (this.data.selectedTag) {
        data.tags = this.data.selectedTag
      }

      // 关键词
      const keyword = this.data.keyword && this.data.keyword.trim()
      if (keyword) {
        data.keyword = keyword
      }

      const res = await request({
        url: '/habits',
        method: 'GET',
        data
      })

      const list = res.data || []
      const mapped = list.map(habit => {
        const target = habit.targetValue ?? habit.target_value ?? 0
        const actual = habit.actualValue ?? habit.actual_value ?? 0
        const achievementRate = target > 0 ? Math.round((actual / target) * 100) : 0
        const rawTags = habit.tags || ''
        return {
          ...habit,
          targetValue: target,
          actualValue: actual,
          achievementRate,
          timeSlotText: this.getTimeSlotText(habit.timeSlot || habit.time_slot),
          tags: rawTags ? rawTags.split(',') : []
        }
      })

      this.setData({ habits: mapped })
    } catch (e) {
      console.error('fetchHabits error', e)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
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

  handleSearchInput (e) {
    this.setData({ keyword: e.detail.value })
  },

  handleSearch () {
    this.fetchHabits()
  },

  handleCategoryChange (e) {
    this.setData({ selectedCategoryIndex: Number(e.detail.value) })
    this.fetchHabits()
  },

  handleTimeSlotChange (e) {
    this.setData({ selectedTimeSlotIndex: Number(e.detail.value) })
    this.fetchHabits()
  },

  handleTagFilter (e) {
    const value = e.currentTarget.dataset.value || ''
    const selectedTag = this.data.selectedTag === value ? '' : value
    this.setData({ selectedTag })
    this.fetchHabits()
  },

  handleHabitTap (e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/habit-detail/habit-detail?id=${id}`
    })
  },

  handleEditHabit (e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/habit-create/habit-create?id=${id}`
    })
  },

  handleDeleteHabit (e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '提示',
      content: '确认删除该习惯吗？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await request({
            url: `/habits/${id}`,
            method: 'DELETE',
            data: { openid: this.openid }
          })
          wx.showToast({ title: '删除成功', icon: 'success' })
          this.fetchHabits()
        } catch (err) {
          console.error('handleDeleteHabit error', err)
          wx.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    })
  },

  handleAddHabit () {
    wx.navigateTo({
      url: '/pages/habit-create/habit-create'
    })
  },

  handleManageTaskCategories () {
    wx.navigateTo({
      url: '/pages/task-categories/task-categories'
    })
  }
})
