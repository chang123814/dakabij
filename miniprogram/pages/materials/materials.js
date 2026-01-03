const { request } = require('../../utils/request')
const { getOpenid } = require('../../utils/auth')

Page({

  data: {
    keyword: '',
    filterTypes: [
      { value: 'inspiration', label: '灵感' },
      { value: 'quote', label: '金句' },
      { value: 'keyword', label: '关键词' },
      { value: 'image', label: '图片' },
      { value: 'tip', label: '技巧' },
      { value: 'note', label: '笔记' }
    ],
    selectedType: '',

    availableTags: [],
    selectedTag: '',

    // 只看收藏
    onlyFavorite: false,
    // 只看模板（使用“模板”标签）
    onlyTemplate: false,

    leftColumnMaterials: [],

    rightColumnMaterials: [],

    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false
  },


  onLoad (options) {
    this.openid = getOpenid()
    if (!this.openid) {
      wx.showToast({ title: '登录中，请稍后重试', icon: 'none' })
      return
    }

    // 如果从统计页携带了 tag 过滤参数，优先应用
    const selectedTag = options && options.tag ? decodeURIComponent(options.tag) : ''
    if (selectedTag) {
      this.setData({ selectedTag })
    }

    this.fetchAvailableTags()
    this.fetchMaterials({ reset: true })
  },


  onShow () {
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar && tabBar.setSelected) {
      tabBar.setSelected(1)
    }
    this.openid = getOpenid()
    if (this.openid) {
      this.fetchAvailableTags()
      this.fetchMaterials({ reset: true })
    }
  },



  onPullDownRefresh () {
    this.fetchAvailableTags()
    this.fetchMaterials({ reset: true }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom () {
    if (!this.data.hasMore || this.data.loading) return
    this.fetchMaterials({ reset: false })
  },

  async fetchAvailableTags () {
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
    }
  },

  async fetchMaterials ({ reset }) {
    if (this.data.loading) return
    this.setData({ loading: true })

    const nextPage = reset ? 1 : this.data.page + 1

    try {
      const data = {
        openid: this.openid,
        page: nextPage,
        page_size: this.data.pageSize
      }

      if (this.data.selectedType) {
        data.material_type = this.data.selectedType
      }

      if (this.data.selectedTag) {
        data.tags = this.data.selectedTag
      }

      if (this.data.onlyTemplate) {
        data.tags = '模板'
      }

      if (this.data.onlyFavorite) {
        data.is_favorite = 1
      }


      const keyword = this.data.keyword && this.data.keyword.trim()

      if (keyword) {
        data.keyword = keyword
      }

      const res = await request({
        url: '/materials',
        method: 'GET',
        data
      })

      const list = res.data?.list || []
      const page = res.data?.page || nextPage
      const hasMore = list.length >= this.data.pageSize

      const mapped = list.map(item => ({
        ...item,
        materialTypeText: this.getMaterialTypeText(item.materialType),
        tags: item.tags ? item.tags.split(',') : []
      }))

      let left = reset ? [] : this.data.leftColumnMaterials.slice()
      let right = reset ? [] : this.data.rightColumnMaterials.slice()

      mapped.forEach((item, index) => {
        const totalIndex = (page - 1) * this.data.pageSize + index
        if (totalIndex % 2 === 0) {
          left.push(item)
        } else {
          right.push(item)
        }
      })

      this.setData({
        leftColumnMaterials: left,
        rightColumnMaterials: right,
        page,
        hasMore
      })
    } catch (e) {
      console.error('fetchMaterials error', e)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
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

  handleSearchInput (e) {
    this.setData({ keyword: e.detail.value })
  },

  handleSearch () {
    this.fetchMaterials({ reset: true })
  },

  handleTypeFilter (e) {
    const value = e.currentTarget.dataset.value
    this.setData({ selectedType: value })
    this.fetchMaterials({ reset: true })
  },

  handleTagFilter (e) {
    const value = e.currentTarget.dataset.value || ''
    const selectedTag = this.data.selectedTag === value ? '' : value
    this.setData({ selectedTag })
    this.fetchMaterials({ reset: true })
  },

  handleToggleOnlyFavorite () {
    const next = !this.data.onlyFavorite
    this.setData({ onlyFavorite: next })
    this.fetchMaterials({ reset: true })
  },

  handleToggleOnlyTemplate () {
    const next = !this.data.onlyTemplate
    this.setData({ onlyTemplate: next })
    this.fetchMaterials({ reset: true })
  },


  async handleFavorite (e) {

    const { id, favorite } = e.currentTarget.dataset
    try {
      await request({
        url: `/materials/${id}/favorite`,
        method: 'POST',
        data: {
          openid: this.openid,
          is_favorite: favorite ? 0 : 1
        }
      })
      wx.showToast({ title: favorite ? '已取消收藏' : '已收藏', icon: 'success' })
      this.fetchMaterials({ reset: true })
    } catch (err) {
      console.error('handleFavorite error', err)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  handleImageError (e) {
    const { column, index, url } = e.currentTarget.dataset || {}
    if (!url) return

    wx.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200) {
          const key = column === 'right' ? 'rightColumnMaterials' : 'leftColumnMaterials'
          const list = this.data[key].slice()
          if (list[index]) {
            list[index].imageLocalPath = res.tempFilePath
            this.setData({ [key]: list })
          }
        }
      },
      fail: (err) => {
        console.error('download material image fail', err)
      }
    })
  },

  handleMaterialDetail (e) {

    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/material-detail/material-detail?id=${id}`
    })
  },

  handleManageTags () {
    wx.navigateTo({
      url: '/pages/tags/tags'
    })
  },

  handleAddMaterial () {
    wx.navigateTo({
      url: '/pages/material-create/material-create'
    })
  }
})
