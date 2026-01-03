const { request } = require('../../utils/request')
const { getOpenid } = require('../../utils/auth')

Page({

  data: {
    materialTypes: [
      { value: 'inspiration', label: '灵感' },
      { value: 'quote', label: '金句' },
      { value: 'keyword', label: '关键词' },
      { value: 'image', label: '图片' },
      { value: 'tip', label: '技巧' },
      { value: 'note', label: '笔记' }
    ],
    selectedTypeIndex: 0,

    materialId: null,
    isEdit: false,

    title: '',
    content: '',
    imageUrl: '', // 服务器上的图片地址
    previewImageUrl: '', // 本地预览用的路径

    tagsInput: '',
    tags: [],
    source: '',

    availableTags: [],
    loadingTags: false,

    submitting: false
  },

  onLoad (options) {
    this.openid = getOpenid()
    const id = options?.id

    if (id) {
      const materialId = Number(id) || id
      this.setData({ materialId, isEdit: true })
      this.fetchMaterialDetail(materialId)
    }
    this.fetchAvailableTags()
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
          tag_type: 'material',
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

  async fetchMaterialDetail (id) {
    try {
      const res = await request({
        url: `/materials/${id}`,
        method: 'GET',
        data: { openid: this.openid }
      })
      const m = res.data || {}
      const tags = m.tags ? m.tags.split(',') : []
      const typeIndex = this.data.materialTypes.findIndex(t => t.value === m.materialType)
      this.setData({
        title: m.title || '',
        content: m.content || '',
        imageUrl: m.imageUrl || '',
        previewImageUrl: m.imageUrl || '',
        source: m.source || '',
        tags,
        selectedTypeIndex: typeIndex >= 0 ? typeIndex : 0
      })
      // 如果是 HTTP 图片，预览时改用本地临时文件
      this.preparePreviewImage(m.imageUrl)
    } catch (e) {
      console.error('fetchMaterialDetail error', e)
      wx.showToast({ title: '加载素材失败', icon: 'none' })
    }
  },

  preparePreviewImage (url) {
    if (!url || /^wxfile:/.test(url)) return
    wx.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({ previewImageUrl: res.tempFilePath })
        }
      },
      fail: (err) => {
        console.error('download preview image fail', err)
      }
    })
  },


  handleTypeChange (e) {
    this.setData({ selectedTypeIndex: Number(e.detail.value) })
  },

  handleTitleInput (e) {
    this.setData({ title: e.detail.value })
  },

  handleContentInput (e) {
    this.setData({ content: e.detail.value })
  },

  handleChooseImage () {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const filePath = res.tempFilePaths && res.tempFilePaths[0]
        console.log('chooseImage filePath ===>', filePath, res)
        if (filePath) {
          // 先用本地路径做预览，再上传到服务器
          this.setData({ previewImageUrl: filePath })
          this.uploadImage(filePath)
        }
      }

    })
  },

  handlePreviewError (e) {
    console.error('preview image error ===>', e.detail, this.data.previewImageUrl)
    // 如果当前还是 HTTP 链接，尝试走 downloadFile
    this.preparePreviewImage(this.data.previewImageUrl)
  },


  uploadImage (filePath) {

    const app = getApp()
    const baseUrl = app && app.globalData && app.globalData.apiBaseUrl
    if (!baseUrl) {
      wx.showToast({ title: '服务器地址未配置', icon: 'none' })
      return
    }

    const uploadUrl = `${baseUrl}/upload/image`

    wx.showLoading({ title: '上传中...', mask: true })
    wx.uploadFile({
      url: uploadUrl,
      filePath,
      name: 'file',
      formData: {
        openid: this.openid || ''
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data || '{}')
          const url = data && data.data && data.data.url
          if (!url) {
            throw new Error('no url in response')
          }
          // imageUrl 用于保存到服务器，previewImageUrl 保持为本地或网络地址
          this.setData({ imageUrl: url })

          wx.showToast({ title: '上传成功', icon: 'success' })
        } catch (e) {
          console.error('uploadImage parse error', e)
          wx.showToast({ title: '上传失败', icon: 'none' })
        }
      },
      fail: (err) => {
        console.error('uploadImage fail', err)
        wx.showToast({ title: '上传失败', icon: 'none' })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  handleTagsInput (e) {

    this.setData({ tagsInput: e.detail.value })
  },

  handleSourceInput (e) {
    this.setData({ source: e.detail.value })
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

  async handleSubmit () {
    if (this.data.submitting) return

    const { title } = this.data
    if (!title.trim()) {
      wx.showToast({ title: '请输入标题', icon: 'none' })
      return
    }

    const selectedType = this.data.materialTypes[this.data.selectedTypeIndex]

    // 图片类素材必须上传图片
    if (selectedType?.value === 'image' && !this.data.imageUrl) {
      wx.showToast({ title: '请先上传图片', icon: 'none' })
      return
    }

    const payload = {
      openid: this.openid,
      title: title.trim(),
      content: this.data.content,
      material_type: selectedType?.value || 'inspiration',
      source: this.data.source,
      image_url: this.data.imageUrl,
      tags: this.data.tags.join(',')
    }


    const isEdit = this.data.isEdit
    const url = isEdit ? `/materials/${this.data.materialId}` : '/materials'
    const method = isEdit ? 'PUT' : 'POST'

    this.setData({ submitting: true })

    try {
      await request({
        url,
        method,
        data: payload
      })
      wx.showToast({ title: isEdit ? '更新成功' : '保存成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 500)
    } catch (e) {
      console.error('handleSubmit error', e)
      wx.showToast({ title: isEdit ? '更新失败' : '保存失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
