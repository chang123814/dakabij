const { request } = require('../../utils/request')
const { getOpenid } = require('../../utils/auth')

Page({

  data: {
    // 是否编辑模式（有 id 表示编辑）
    isEdit: false,
    habitId: null,

    name: '',
    description: '',

    categories: [],
    categoryNames: ['请选择分类（可选）'],
    selectedCategoryIndex: 0,

    timeSlotOptions: [
      { value: 'morning', label: '上午' },
      { value: 'afternoon', label: '下午' },
      { value: 'evening', label: '晚上' }
    ],
    timeSlotLabels: ['上午', '下午', '晚上'],
    selectedTimeSlotIndex: 0,

    targetValue: '',

    tagsInput: '',
    tags: [],

    availableTags: [],
    loadingTags: false,

    priorityOptions: [
      { value: 1, label: '高' },
      { value: 2, label: '中' },
      { value: 3, label: '低' }
    ],
    selectedPriority: 2,

    submitting: false
  },

  onLoad (options) {
    this.openid = getOpenid()
    const { id } = options || {}

    if (id) {
      this.setData({ isEdit: true, habitId: id })
      wx.setNavigationBarTitle({ title: '编辑习惯' })
    } else {
      wx.setNavigationBarTitle({ title: '新建习惯' })
    }

    this.fetchTaskCategories().then(() => {
      if (id) {
        this.fetchHabitDetail(id)
      }
    })
    this.fetchAvailableTags()
  },

  async fetchTaskCategories () {
    try {
      const res = await request({
        url: '/task-categories',
        method: 'GET',
        data: { openid: this.openid }
      })
      const list = res.data || []
      const names = ['请选择分类（可选）', ...list.map(item => item.name)]
      this.setData({
        categories: list,
        categoryNames: names
      })
    } catch (e) {
      console.error('fetchTaskCategories error', e)
    }
  },

  async fetchAvailableTags () {
    if (this.data.loadingTags) return
    this.setData({ loadingTags: true })
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
    } finally {
      this.setData({ loadingTags: false })
    }
  },

  async fetchHabitDetail (id) {
    try {
      const res = await request({
        url: `/habits/${id}`,
        method: 'GET',
        data: { openid: this.openid }
      })
      const habit = res.data
      if (!habit) return

      const categoryId = habit.categoryId ?? habit.category_id
      let selectedCategoryIndex = 0
      if (categoryId && this.data.categories.length) {
        const idx = this.data.categories.findIndex(c => c.id === categoryId)
        if (idx !== -1) selectedCategoryIndex = idx + 1
      }

      const timeSlot = habit.timeSlot || habit.time_slot || 'morning'
      const timeSlotIndex = this.data.timeSlotOptions.findIndex(i => i.value === timeSlot)

      const priority = habit.priority ?? 2
      const tags = habit.tags ? habit.tags.split(',') : []

      this.setData({
        name: habit.name || '',
        description: habit.description || '',
        selectedCategoryIndex,
        selectedTimeSlotIndex: timeSlotIndex >= 0 ? timeSlotIndex : 0,
        targetValue: String(habit.targetValue ?? habit.target_value ?? ''),
        tags,
        selectedPriority: priority
      })
    } catch (e) {
      console.error('fetchHabitDetail error', e)
    }
  },

  handleNameInput (e) {
    this.setData({ name: e.detail.value })
  },

  handleDescriptionInput (e) {
    this.setData({ description: e.detail.value })
  },

  handleCategoryChange (e) {
    this.setData({ selectedCategoryIndex: Number(e.detail.value) })
  },

  handleTimeSlotChange (e) {
    this.setData({ selectedTimeSlotIndex: Number(e.detail.value) })
  },

  handleTargetValueInput (e) {
    this.setData({ targetValue: e.detail.value.replace(/[^0-9]/g, '') })
  },

  handleTagsInput (e) {
    this.setData({ tagsInput: e.detail.value })
  },

  handleAddTag () {
    const raw = this.data.tagsInput.trim()
    if (!raw) return
    const exist = this.data.tags
    const pieces = raw.split(',').map(t => t.trim()).filter(Boolean)
    const merged = Array.from(new Set([...exist, ...pieces]))
    this.setData({ tags: merged, tagsInput: '' })
  },

  handleRemoveTag (e) {
    const value = e.currentTarget.dataset.value
    this.setData({ tags: this.data.tags.filter(t => t !== value) })
  },

  handleToggleSuggestedTag (e) {
    const value = e.currentTarget.dataset.value
    if (!value) return
    const current = this.data.tags.slice()
    const index = current.indexOf(value)
    if (index >= 0) {
      current.splice(index, 1)
    } else {
      current.push(value)
    }
    this.setData({ tags: current })
  },

  handlePriorityChange (e) {
    this.setData({ selectedPriority: Number(e.detail.value) })
  },

  async handleSubmit () {
    if (this.data.submitting) return

    const name = this.data.name.trim()
    if (!name) {
      wx.showToast({ title: '请输入习惯名称', icon: 'none' })
      return
    }

    const payload = {
      openid: this.openid,
      name,
      description: this.data.description,
      target_value: this.data.targetValue ? Number(this.data.targetValue) : null,
      time_slot: this.data.timeSlotOptions[this.data.selectedTimeSlotIndex].value,
      tags: this.data.tags.join(','),
      priority: this.data.selectedPriority
    }

    if (this.data.selectedCategoryIndex > 0) {
      const category = this.data.categories[this.data.selectedCategoryIndex - 1]
      if (category) payload.category_id = category.id
    }

    const isEdit = this.data.isEdit
    const url = isEdit ? `/habits/${this.data.habitId}` : '/habits'
    const method = isEdit ? 'PUT' : 'POST'

    this.setData({ submitting: true })
    try {
      await request({ url, method, data: payload })
      wx.showToast({ title: isEdit ? '保存成功' : '创建成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 500)
    } catch (e) {
      console.error('handleSubmit error', e)
      wx.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
