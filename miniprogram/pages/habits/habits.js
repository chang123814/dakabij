// pages/habits/habits.js
const app = getApp();
const request = require('../../utils/request');
const util = require('../../utils/util');

Page({
  data: {
    habits: [],
    loading: false,
    currentDate: util.formatDate(new Date())
  },

  onLoad() {
    this.loadHabits();
  },

  onShow() {
    this.loadHabits();
  },

  // 加载习惯列表
  async loadHabits() {
    this.setData({ loading: true });
    
    try {
      const res = await request.get('/habits');
      if (res.code === 200) {
        this.setData({ habits: res.data.list || [] });
      }
    } catch (error) {
      console.error('加载习惯列表失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 创建习惯
  createHabit() {
    wx.navigateTo({
      url: '/pages/habit-create/habit-create'
    });
  },

  // 查看习惯详情
  viewHabit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/habit-detail/habit-detail?id=${id}`
    });
  },

  // 打卡
  async checkIn(e) {
    const habitId = e.currentTarget.dataset.id;
    
    try {
      const res = await request.post(`/habits/${habitId}/check-in`, {
        date: this.data.currentDate
      });
      
      if (res.code === 200) {
        wx.showToast({
          title: '打卡成功！',
          icon: 'success'
        });
        this.loadHabits();
      }
    } catch (error) {
      console.error('打卡失败:', error);
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadHabits().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});
