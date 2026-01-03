const { request } = require('../../utils/request')
const { getOpenid } = require('../../utils/auth')

Page({

  data: {
    keyword: '',
    notes: [],
    loading: false
  },

  onLoad () {
    this.openid = getOpenid()
    if (!this.openid) {
      wx.showToast({ title: '登录中，请稍后重试', icon: 'none' })
      return
    }
    this.fetchNotes()
  },

  onShow () {
    this.openid = getOpenid()
    if (this.openid) {
      this.fetchNotes()
    }
  },

  async fetchNotes () {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const data = {
        openid: this.openid
      }
      const keyword = this.data.keyword && this.data.keyword.trim()
      if (keyword) {
        data.keyword = keyword
      }

      const res = await request({
        url: '/notes',
        method: 'GET',
        data
      })

      const list = res.data || []
      const mapped = list.map(item => ({
        ...item,
        shortContent: item.content ? item.content.slice(0, 60) : '',
        createdAtText: item.createdAt ? item.createdAt.slice(0, 16).replace('T', ' ') : ''
      }))

      this.setData({ notes: mapped })
    } catch (e) {
      console.error('fetchNotes error', e)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  handleSearchInput (e) {
    this.setData({ keyword: e.detail.value })
  },

  handleSearch () {
    this.fetchNotes()
  },

  handleAddNote () {
    wx.navigateTo({
      url: '/pages/note-create/note-create'
    })
  },

  handleNoteTap (e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/note-detail/note-detail?id=${id}`
    })
  }

})
