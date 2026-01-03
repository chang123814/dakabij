const { request } = require('../../utils/request')
const { getOpenid } = require('../../utils/auth')

Page({

  data: {
    loading: false,
    summary: null,
    typeDistribution: [],
    topTags: [],
    recentMaterials: []
  },

  onLoad () {
    this.openid = getOpenid()
    if (!this.openid) {
      wx.showToast({ title: '登录中，请稍后重试', icon: 'none' })
      return
    }
    this.fetchStatistics()
  },


  async fetchStatistics () {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const res = await request({
        url: '/statistics/materials',
        method: 'GET',
        data: {
          openid: this.openid
        }
      })
      const data = res.data || {}

      const rawTypes = data.type_distribution || []
      const maxCount = rawTypes.reduce((m, item) => (item.count > m ? item.count : m), 0) || 1
      const typeDistribution = rawTypes.map(item => ({
        ...item,
        label: this.mapMaterialTypeText(item.material_type),
        barPercent: Math.round((item.count / maxCount) * 100)
      }))

      this.setData({

        summary: {
          totalCount: data.total_count || 0,
          favoriteCount: data.favorite_count || 0,
          imageCount: data.image_count || 0
        },
        typeDistribution,
        topTags: data.top_tags || [],
        recentMaterials: data.recent_materials || []
      })
    } catch (e) {
      console.error('fetchStatistics error', e)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  mapMaterialTypeText (type) {
    switch (type) {
      case 'quote':
        return '金句'
      case 'keyword':
        return '关键词'
      case 'image':
        return '图片'
      case 'tip':
        return '技巧'
      case 'inspiration':
      default:
        return '灵感'
    }
  },

  handleTagTap (e) {
    const tag = e.currentTarget.dataset.tag
    if (!tag) return

    wx.navigateTo({
      url: `/pages/materials/materials?tag=${encodeURIComponent(tag)}`
    })
  },

  handleRecentMaterialTap (e) {
    const { id } = e.currentTarget.dataset
    if (!id) return
    wx.navigateTo({
      url: `/pages/material-detail/material-detail?id=${id}`
    })
  },

  onPullDownRefresh () {

    this.fetchStatistics().finally(() => {
      wx.stopPullDownRefresh()
    })
  }
})
