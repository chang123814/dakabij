Component({
  data: {
    selected: 0,
    list: [
      { pagePath: "/pages/habits/habits" },
      { pagePath: "/pages/materials/materials" },
      { pagePath: "/pages/statistics/statistics" },
      { pagePath: "/pages/profile/profile" }
    ]
  },

  methods: {
    onSwitchTab(e) {
      const index = e.currentTarget.dataset.index
      const pagePath = this.data.list[index].pagePath
      if (!pagePath) return
      wx.switchTab({ url: pagePath })
      this.setData({ selected: index })
    },

    setSelected(index) {
      this.setData({ selected: index })
    }
  }
})
