// 微信控制器
const axios = require('axios');
const { query } = require('../config/database');

// 微信登录
async function wechatLogin(req, res, next) {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        status: 'error',
        message: '缺少code参数'
      });
    }
    
    // 调用微信接口获取openid和session_key
    const appId = process.env.WECHAT_APP_ID;
    const appSecret = process.env.WECHAT_APP_SECRET;
    
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
    
    const response = await axios.get(url);
    const { openid, session_key, errcode, errmsg } = response.data;
    
    if (errcode) {
      return res.status(400).json({
        status: 'error',
        message: errmsg || '微信登录失败'
      });
    }
    
    // 查询用户是否存在
    const userSql = 'SELECT * FROM users WHERE openid = ?';
    const users = await query(userSql, [openid]);
    
    let userId;
    
    if (users.length === 0) {
      // 新用户，创建用户记录
      const insertSql = 'INSERT INTO users (openid, status) VALUES (?, 1)';
      const result = await query(insertSql, [openid]);
      userId = result.insertId;
    } else {
      userId = users[0].id;
    }
    
    res.json({
      status: 'success',
      message: '登录成功',
      data: {
        openid,
        user_id: userId,
        is_new_user: users.length === 0
      }
    });
  } catch (error) {
    console.error('微信登录错误:', error);
    next(error);
  }
}

// 获取微信access_token
async function getAccessToken(req, res, next) {
  try {
    const appId = process.env.WECHAT_APP_ID;
    const appSecret = process.env.WECHAT_APP_SECRET;
    
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
    
    const response = await axios.get(url);
    const { access_token, expires_in, errcode, errmsg } = response.data;
    
    if (errcode) {
      return res.status(400).json({
        status: 'error',
        message: errmsg || '获取access_token失败'
      });
    }
    
    res.json({
      status: 'success',
      data: {
        access_token,
        expires_in
      }
    });
  } catch (error) {
    console.error('获取access_token错误:', error);
    next(error);
  }
}

module.exports = {
  wechatLogin,
  getAccessToken
};
