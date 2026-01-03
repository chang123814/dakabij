const { request } = require('../../utils/request')
const { getOpenid } = require('../../utils/auth')

Page({

  data: {
    noteId: null,
    title: '',
    content: '',
    submitting: false,
    templates: [] // 笔记模板列表
  },


  onLoad (options) {
    this.openid = getOpenid()
    if (!this.openid) {
      wx.showToast({ title: '登录中，请稍后重试', icon: 'none' })
      return
    }

    if (options && options.id) {
      this.setData({ noteId: options.id })
      this.fetchDetail(options.id)
      wx.setNavigationBarTitle({ title: '编辑笔记' })
    } else {
      wx.setNavigationBarTitle({ title: '新建笔记' })

      // 如果是从素材详情跳转过来的，预填标题和内容
      const eventChannel = this.getOpenerEventChannel && this.getOpenerEventChannel()
      if (eventChannel && eventChannel.on) {
        eventChannel.on('fromMaterial', (data) => {
          const title = data && data.title ? data.title : this.data.title
          const content = data && data.content ? data.content : this.data.content
          this.setData({ title, content })
        })
      }
    }
  },


  async fetchDetail (id) {
    try {
      const res = await request({
        url: `/notes/${id}`,
        method: 'GET',
        data: { openid: this.openid }
      })
      const note = res.data
      if (!note) return
      this.setData({
        title: note.title || '',
        content: note.content || ''
      })
    } catch (e) {
      console.error('fetchDetail error', e)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  handleTitleInput (e) {
    this.setData({ title: e.detail.value })
  },

  handleContentInput (e) {
    this.setData({ content: e.detail.value })
  },

  async handleSubmit () {
    if (this.data.submitting) return

    const title = (this.data.title || '').trim()
    if (!title) {
      wx.showToast({ title: '请填写标题', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    try {
      const payload = {
        openid: this.openid,
        title,
        content: this.data.content
      }

      if (this.data.noteId) {
        await request({
          url: `/notes/${this.data.noteId}`,
          method: 'PUT',
          data: payload
        })
        wx.showToast({ title: '已保存', icon: 'success' })
      } else {
        await request({
          url: '/notes',
          method: 'POST',
          data: payload
        })
        wx.showToast({ title: '创建成功', icon: 'success' })
      }

      setTimeout(() => {
        wx.navigateBack()
      }, 400)
    } catch (e) {
      console.error('handleSubmit error', e)
      wx.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }

})
