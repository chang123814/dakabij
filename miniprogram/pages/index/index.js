// pages/index/index.js
const app = getApp();
const request = require('../../utils/request');
const util = require('../../utils/util');

Page({
  data: {
    userInfo: null,
    todayCheckInCount: 0,
    totalHabits: 0,
    activeHabits: 0,
    recentNotes: [],
    loading: false
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadData();
  },

  // 加载数据
  async loadData() {
    this.setData({ loading: true });
    
    try {
      // 获取用户信息
      if (app.globalData.userInfo) {
        this.setData({ userInfo: app.globalData.userInfo });
      }

      // 获取今日打卡统计
      const today = util.formatDate(new Date());
      const checkInRes = await request.get(`/check-ins?date=${today}`);
      if (checkInRes.code === 200) {
        this.setData({ todayCheckInCount: checkInRes.data.count || 0 });
      }

      // 获取习惯统计
      const habitsRes = await request.get('/habits');
      if (habitsRes.code === 200) {
        const habits = habitsRes.data.list || [];
        this.setData({
          totalHabits: habits.length,
          activeHabits: habits.filter(h => h.status === 1).length
        });
      }

      // 获取最近笔记
      const notesRes = await request.get('/notes?limit=5');
      if (notesRes.code === 200) {
        this.setData({ recentNotes: notesRes.data.list || [] });
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  // 跳转到习惯列表
  goToHabits() {
    wx.switchTab({
      url: '/pages/habits/habits'
    });
  },

  // 跳转到笔记列表
  goToNotes() {
    wx.switchTab({
      url: '/pages/notes/notes'
    });
  },

  // 跳转到统计页面
  goToStatistics() {
    wx.switchTab({
      url: '/pages/statistics/statistics'
    });
  },

  // 查看笔记详情
  viewNote(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/note-detail/note-detail?id=${id}`
    });
  },

  // 快速打卡
  quickCheckIn(e) {
    const habitId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/habit-detail/habit-detail?id=${habitId}`
    });
  }
});
