// pages/statistics/statistics.js
const app = getApp();
const request = require('../../utils/request');
const util = require('../../utils/util');

Page({
  data: {
    stats: {
      totalHabits: 0,
      activeHabits: 0,
      totalCheckIns: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalNotes: 0
    },
    weeklyData: [],
    loading: false
  },

  onLoad() {
    this.loadStats();
  },

  onShow() {
    this.loadStats();
  },

  // 加载统计数据
  async loadStats() {
    this.setData({ loading: true });
    
    try {
      // 获取总览统计
      const overviewRes = await request.get('/statistics/overview');
      if (overviewRes.code === 200) {
        this.setData({ stats: overviewRes.data });
      }

      // 获取周数据
      const weeklyRes = await request.get('/statistics/weekly');
      if (weeklyRes.code === 200) {
        this.setData({ weeklyData: weeklyRes.data });
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadStats().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});
