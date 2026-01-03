const { request } = require('../../utils/request')
const { getOpenid } = require('../../utils/auth')

Page({

  data: {
    categories: [],
    loading: false
  },

  onLoad () {
    this.openid = getOpenid()
    if (!this.openid) {
      wx.showToast({ title: '登录中，请稍后重试', icon: 'none' })
      return
    }
    this.fetchCategories()
  },


  onPullDownRefresh () {
    this.fetchCategories().finally(() => wx.stopPullDownRefresh())
  },

  async fetchCategories () {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const res = await request({
        url: '/task-categories',
        method: 'GET',
        data: { openid: this.openid }
      })
      this.setData({ categories: res.data || [] })
    } catch (e) {
      console.error('fetchCategories error', e)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  handleAddCategory () {
    wx.showModal({
      title: '添加分类',
      editable: true,
      placeholderText: '请输入分类名称',
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            await request({
              url: '/task-categories',
              method: 'POST',
              data: {
                openid: this.openid,
                name: res.content
              }
            })
            wx.showToast({ title: '添加成功', icon: 'success' })
            this.fetchCategories()
          } catch (e) {
            console.error('handleAddCategory error', e)
            wx.showToast({ title: '添加失败', icon: 'none' })
          }
        }
      }
    })
  },

  handleEditCategory (e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.categories.find(c => c.id === id)
    if (!item) return

    wx.showModal({
      title: '编辑分类',
      editable: true,
      placeholderText: '请输入分类名称',
      content: item.name,
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            await request({
              url: `/task-categories/${id}`,
              method: 'PUT',
              data: {
                openid: this.openid,
                name: res.content
              }
            })
            wx.showToast({ title: '更新成功', icon: 'success' })
            this.fetchCategories()
          } catch (e) {
            console.error('handleEditCategory error', e)
            wx.showToast({ title: '更新失败', icon: 'none' })
          }
        }
      }
    })
  },

  handleDeleteCategory (e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确认删除该分类吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await request({
              url: `/task-categories/${id}`,
              method: 'DELETE',
              data: { openid: this.openid }
            })
            wx.showToast({ title: '删除成功', icon: 'success' })
            this.fetchCategories()
          } catch (e) {
            console.error('handleDeleteCategory error', e)
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }
})
