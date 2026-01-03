const { request } = require('../../utils/request')
const { getOpenid } = require('../../utils/auth')

Page({

  data: {
    materialId: null,
    material: null,
    loading: false,
    imageLocalPath: '' // 本地下载后的图片路径
  },


  onLoad (options) {
    const id = options.id
    this.openid = getOpenid()

    if (id) {
      this.setData({ materialId: id })
      this.fetchDetail(id)
    }
  },

  onShow () {
    // 从编辑页返回时，重新拉取最新的素材信息和图片
    if (this.data.materialId) {
      this.setData({ imageLocalPath: '' })
      this.fetchDetail(this.data.materialId)
    }
  },

  async fetchDetail (id) {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const res = await request({
        url: `/materials/${id}`,
        method: 'GET',
        data: { openid: this.openid }
      })
      const m = res.data
      const tags = m.tags ? m.tags.split(',') : []
      const isTemplate = tags.includes('模板')
      const material = {
        ...m,
        materialTypeText: this.getMaterialTypeText(m.materialType),
        tags,
        isTemplate
      }
      this.setData({ material })
      this.prepareImage(material.imageUrl)

    } catch (e) {
      console.error('fetchDetail error', e)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  prepareImage (url) {
    if (!url) return
    wx.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({ imageLocalPath: res.tempFilePath })
        }
      },
      fail: (err) => {
        console.error('download image fail', err)
      }
    })
  },

  getMaterialTypeText (type) {

    switch (type) {
      case 'quote':
        return '金句'
      case 'keyword':
        return '关键词'
      case 'image':
        return '图片'
      case 'tip':
        return '技巧'
      case 'note':
        return '笔记'
      case 'inspiration':
      default:
        return '灵感'
    }
  },

  async handleFavoriteToggle () {
    const material = this.data.material
    if (!material) return
    try {
      const isFavorite = material.isFavorite ? 0 : 1
      await request({
        url: `/materials/${material.id}/favorite`,
        method: 'POST',
        data: {
          openid: this.openid,
          is_favorite: isFavorite
        }
      })
      wx.showToast({ title: isFavorite ? '已收藏' : '已取消收藏', icon: 'success' })
      this.fetchDetail(material.id)
    } catch (e) {
      console.error('handleFavoriteToggle error', e)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  handleCopyContent () {
    const material = this.data.material
    if (!material) return

    const parts = []
    if (material.title) parts.push(material.title)
    if (material.content) parts.push(material.content)
    if (material.tags && material.tags.length) {
      parts.push('#' + material.tags.join(' #'))
    }
    const text = parts.join('\n\n')

    if (!text) {
      wx.showToast({ title: '没有可复制的内容', icon: 'none' })
      return
    }

    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({ title: '内容已复制', icon: 'success' })
      },
      fail: (err) => {
        console.error('setClipboardData fail', err)
        wx.showToast({ title: '复制失败', icon: 'none' })
      }
    })
  },

  handleCreateNoteFromMaterial () {
    const material = this.data.material
    if (!material) return

    wx.navigateTo({
      url: '/pages/note-create/note-create',
      success: (res) => {
        if (res.eventChannel && res.eventChannel.emit) {
          res.eventChannel.emit('fromMaterial', {
            title: material.title,
            content: material.content
          })
        }
      }
    })
  },

  async handleToggleTemplate () {
    const material = this.data.material
    if (!material) return

    const tags = material.tags || []
    const hasTemplate = tags.includes('模板')
    const nextTags = hasTemplate ? tags.filter(t => t !== '模板') : [...tags, '模板']

    try {
      await request({
        url: `/materials/${material.id}`,
        method: 'PUT',
        data: {
          openid: this.openid,
          title: material.title,
          content: material.content,
          material_type: material.materialType || material.material_type,
          source: material.source,
          image_url: material.imageUrl,
          tags: nextTags.join(',')
        }
      })
      wx.showToast({ title: hasTemplate ? '已取消模板' : '已设为模板', icon: 'success' })
      this.fetchDetail(material.id)
    } catch (e) {
      console.error('handleToggleTemplate error', e)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  handleEdit () {


    const material = this.data.material
    if (!material) return
    wx.navigateTo({
      url: `/pages/material-create/material-create?id=${material.id}`
    })
  },

  handleDelete () {
    const material = this.data.material
    if (!material) return
    wx.showModal({
      title: '提示',
      content: '确认删除该素材吗？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await request({
            url: `/materials/${material.id}`,
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

