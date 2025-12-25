// pages/notes/notes.js
const app = getApp();
const request = require('../../utils/request');
const util = require('../../utils/util');

Page({
  data: {
    notes: [],
    loading: false,
    keyword: ''
  },

  onLoad() {
    this.loadNotes();
  },

  onShow() {
    this.loadNotes();
  },

  // 加载笔记列表
  async loadNotes() {
    this.setData({ loading: true });
    
    try {
      const res = await request.get('/notes');
      if (res.code === 200) {
        this.setData({ notes: res.data.list || [] });
      }
    } catch (error) {
      console.error('加载笔记列表失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 搜索笔记
  onSearch(e) {
    const keyword = e.detail.value;
    this.setData({ keyword });
    
    if (keyword.trim()) {
      this.searchNotes(keyword);
    } else {
      this.loadNotes();
    }
  },

  // 搜索笔记
  async searchNotes(keyword) {
    try {
      const res = await request.get(`/notes/search?keyword=${encodeURIComponent(keyword)}`);
      if (res.code === 200) {
        this.setData({ notes: res.data.list || [] });
      }
    } catch (error) {
      console.error('搜索笔记失败:', error);
    }
  },

  // 创建笔记
  createNote() {
    wx.navigateTo({
      url: '/pages/note-create/note-create'
    });
  },

  // 查看笔记详情
  viewNote(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/note-detail/note-detail?id=${id}`
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadNotes().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});
