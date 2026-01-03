const { request } = require('../../utils/request')
const { getOpenid } = require('../../utils/auth')

Page({

  data: {
    noteId: null,
    note: null,
    loading: false
  },

  onLoad (options) {
    this.openid = getOpenid()
    if (!this.openid) {
      wx.showToast({ title: '登录中，请稍后重试', icon: 'none' })
      return
    }

    const { id } = options || {}
    if (id) {
      this.setData({ noteId: id })
      this.fetchDetail(id)
    }
  },

  async fetchDetail (id) {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const res = await request({
        url: `/notes/${id}`,
        method: 'GET',
        data: { openid: this.openid }
      })
      const note = res.data
      if (!note) return

      wx.setNavigationBarTitle({ title: note.title || '笔记详情' })

      this.setData({
        note: {
          ...note,
          createdAtText: note.createdAt ? note.createdAt.slice(0, 16).replace('T', ' ') : ''
        }
      })
    } catch (e) {
      console.error('fetchDetail error', e)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  handleEdit () {
    const { noteId } = this.data
    if (!noteId) return
    wx.navigateTo({
      url: `/pages/note-create/note-create?id=${noteId}`
    })
  },

  handleDelete () {
    const { noteId } = this.data
    if (!noteId) return
    wx.showModal({
      title: '提示',
      content: '确认删除该笔记吗？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await request({
            url: `/notes/${noteId}`,
            method: 'DELETE',
            data: { openid: this.openid }
          })
          wx.showToast({ title: '删除成功', icon: 'success' })
          setTimeout(() => {
            wx.navigateBack()
          }, 400)
        } catch (e) {
          console.error('handleDelete error', e)
          wx.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    })
  }

})
