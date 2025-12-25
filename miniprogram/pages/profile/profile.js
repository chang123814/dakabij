// pages/profile/profile.js
const app = getApp();
const request = require('../../utils/request');

Page({
  data: {
    userInfo: null,
    settings: {
      notification: true,
      reminder: true,
      darkMode: false
    }
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  // 加载用户信息
  loadUserInfo() {
    if (app.globalData.userInfo) {
      this.setData({ userInfo: app.globalData.userInfo });
    }
  },

  // 登录
  login() {
    app.login();
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout();
          this.setData({ userInfo: null });
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 切换通知设置
  toggleNotification() {
    const settings = this.data.settings;
    settings.notification = !settings.notification;
    this.setData({ settings });
    this.saveSettings();
  },

  // 切换提醒设置
  toggleReminder() {
    const settings = this.data.settings;
    settings.reminder = !settings.reminder;
    this.setData({ settings });
    this.saveSettings();
  },

  // 切换深色模式
  toggleDarkMode() {
    const settings = this.data.settings;
    settings.darkMode = !settings.darkMode;
    this.setData({ settings });
    this.saveSettings();
  },

  // 保存设置
  async saveSettings() {
    try {
      await request.put('/user/settings', this.data.settings);
      wx.showToast({
        title: '设置已保存',
        icon: 'success'
      });
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  },

  // 关于
  about() {
    wx.showModal({
      title: '关于习惯日记',
      content: '版本：1.0.0\n\n习惯日记是一款帮助您养成好习惯、记录生活的微信小程序。',
      showCancel: false
    });
  },

  // 联系客服
  contact() {
    wx.showModal({
      title: '联系客服',
      content: '邮箱：support@habitdiary.com',
      showCancel: false
    });
  }
});
