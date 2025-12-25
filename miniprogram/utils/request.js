// utils/request.js - 封装微信小程序网络请求

const app = getApp();

/**
 * 封装wx.request
 * @param {string} url 请求地址
 * @param {object} data 请求数据
 * @param {string} method 请求方法
 * @param {boolean} needLogin 是否需要登录
 */
function request(url, data = {}, method = 'GET', needLogin = true) {
  return new Promise((resolve, reject) => {
    // 检查是否需要登录
    if (needLogin && !app.globalData.token) {
      // 跳转到登录页
      wx.navigateTo({
        url: '/pages/login/login'
      });
      reject('请先登录');
      return;
    }

    // 构建请求头
    const header = {
      'content-type': 'application/json'
    };

    // 添加token
    if (app.globalData.token) {
      header['Authorization'] = `Bearer ${app.globalData.token}`;
    }

    // 发起请求
    wx.request({
      url: `${app.globalData.baseUrl}${url}`,
      method: method,
      data: data,
      header: header,
      success: (res) => {
        // 处理响应
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data);
          } else if (res.data.code === 401) {
            // token过期，重新登录
            app.logout();
            wx.navigateTo({
              url: '/pages/login/login'
            });
            reject('登录已过期，请重新登录');
          } else {
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none',
              duration: 2000
            });
            reject(res.data.message || '请求失败');
          }
        } else {
          wx.showToast({
            title: '网络错误',
            icon: 'none',
            duration: 2000
          });
          reject('网络错误');
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络连接失败',
          icon: 'none',
          duration: 2000
        });
        reject(err);
      }
    });
  });
}

/**
 * GET请求
 */
function get(url, data = {}, needLogin = true) {
  return request(url, data, 'GET', needLogin);
}

/**
 * POST请求
 */
function post(url, data = {}, needLogin = true) {
  return request(url, data, 'POST', needLogin);
}

/**
 * PUT请求
 */
function put(url, data = {}, needLogin = true) {
  return request(url, data, 'PUT', needLogin);
}

/**
 * DELETE请求
 */
function del(url, data = {}, needLogin = true) {
  return request(url, data, 'DELETE', needLogin);
}

/**
 * 上传文件
 */
function uploadFile(url, filePath, formData = {}) {
  return new Promise((resolve, reject) => {
    const header = {};
    if (app.globalData.token) {
      header['Authorization'] = `Bearer ${app.globalData.token}`;
    }

    wx.uploadFile({
      url: `${app.globalData.baseUrl}${url}`,
      filePath: filePath,
      name: 'file',
      formData: formData,
      header: header,
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.code === 200) {
          resolve(data);
        } else {
          wx.showToast({
            title: data.message || '上传失败',
            icon: 'none'
          });
          reject(data.message || '上传失败');
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
  uploadFile
};
