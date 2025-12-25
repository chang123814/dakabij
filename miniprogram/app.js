// app.js
App({
  globalData: {
    userInfo: null,
    token: null,
    openid: null,
    baseUrl: 'http://129.211.62.76:3001/api'
  },

  onLaunch() {
    // 检查登录状态
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    const openid = wx.getStorageSync('openid');
    
    if (token && openid) {
      this.globalData.token = token;
      this.globalData.openid = openid;
      this.getUserInfo();
    }
  },

  // 获取用户信息
  getUserInfo() {
    wx.request({
      url: `${this.globalData.baseUrl}/users/info`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${this.globalData.token}`
      },
      success: (res) => {
        if (res.data.code === 200) {
          this.globalData.userInfo = res.data.data;
        }
      }
    });
  },

  // 微信登录
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            wx.request({
              url: `${this.globalData.baseUrl}/wechat/login`,
              method: 'POST',
              data: {
                code: res.code
              },
              success: (loginRes) => {
                if (loginRes.data.code === 200) {
                  const { token, openid } = loginRes.data.data;
                  this.globalData.token = token;
                  this.globalData.openid = openid;
                  
                  // 保存到本地存储
                  wx.setStorageSync('token', token);
                  wx.setStorageSync('openid', openid);
                  
                  // 获取用户信息
                  this.getUserInfo();
                  
                  resolve(loginRes.data.data);
                } else {
                  reject(loginRes.data.message);
                }
              },
              fail: (err) => {
                reject(err);
              }
            });
          } else {
            reject('获取微信登录凭证失败');
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  // 退出登录
  logout() {
    this.globalData.userInfo = null;
    this.globalData.token = null;
    this.globalData.openid = null;
    wx.removeStorageSync('token');
    wx.removeStorageSync('openid');
  }
});
