const { request } = require('../../utils/request')
const { getOpenid } = require('../../utils/auth')

Page({

  data: {
    tags: [],
    loading: false
  },

  onLoad () {
    this.openid = getOpenid()
    if (!this.openid) {
      wx.showToast({ title: '登录中，请稍后重试', icon: 'none' })
      return
    }
    this.fetchTags()
  },


  onPullDownRefresh () {
    this.fetchTags().finally(() => wx.stopPullDownRefresh())
  },

  async fetchTags () {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const res = await request({
        url: '/tags',
        method: 'GET',
        data: {
          openid: this.openid,
          tag_type: 'material',
          status: 1
        }
      })
      this.setData({ tags: res.data || [] })
    } catch (e) {
      console.error('fetchTags error', e)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  handleAddTag () {
    wx.showModal({
      title: '添加标签',
      editable: true,
      placeholderText: '请输入标签名称',
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            await request({
              url: '/tags',
              method: 'POST',
              data: {
                openid: this.openid,
                name: res.content,
                tag_type: 'material'
              }
            })
            wx.showToast({ title: '添加成功', icon: 'success' })
            this.fetchTags()
          } catch (e) {
            console.error('handleAddTag error', e)
            wx.showToast({ title: '添加失败', icon: 'none' })
          }
        }
      }
    })
  },

  handleEditTag (e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.tags.find(t => t.id === id)
    if (!item) return

    wx.showModal({
      title: '编辑标签',
      editable: true,
      placeholderText: '请输入标签名称',
      content: item.name,
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            await request({
              url: `/tags/${id}`,
              method: 'PUT',
              data: {
                openid: this.openid,
                name: res.content
              }
            })
            wx.showToast({ title: '更新成功', icon: 'success' })
            this.fetchTags()
          } catch (e) {
            console.error('handleEditTag error', e)
            wx.showToast({ title: '更新失败', icon: 'none' })
          }
        }
      }
    })
  },

  handleDeleteTag (e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确认删除该标签吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await request({
              url: `/tags/${id}`,
              method: 'DELETE',
              data: { openid: this.openid }
            })
            wx.showToast({ title: '删除成功', icon: 'success' })
            this.fetchTags()
          } catch (e) {
            console.error('handleDeleteTag error', e)
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }
})
