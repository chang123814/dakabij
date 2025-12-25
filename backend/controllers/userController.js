// 用户控制器
const { query } = require('../config/database');

// 获取用户信息
async function getUserInfo(req, res, next) {
  try {
    const { openid } = req.query;
    
    if (!openid) {
      return res.status(400).json({
        status: 'error',
        message: '缺少openid参数'
      });
    }
    
    const sql = 'SELECT id, openid, nickname, avatar_url, phone, email, status, created_at FROM users WHERE openid = ? AND status = 1';
    const users = await query(sql, [openid]);
    
    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }
    
    res.json({
      status: 'success',
      data: users[0]
    });
  } catch (error) {
    next(error);
  }
}

// 更新用户信息
async function updateUserInfo(req, res, next) {
  try {
    const { openid, nickname, avatar_url, phone, email } = req.body;
    
    if (!openid) {
      return res.status(400).json({
        status: 'error',
        message: '缺少openid参数'
      });
    }
    
    const sql = `UPDATE users SET 
      nickname = COALESCE(?, nickname),
      avatar_url = COALESCE(?, avatar_url),
      phone = COALESCE(?, phone),
      email = COALESCE(?, email),
      updated_at = CURRENT_TIMESTAMP
      WHERE openid = ?`;
    
    await query(sql, [nickname, avatar_url, phone, email, openid]);
    
    res.json({
      status: 'success',
      message: '用户信息更新成功'
    });
  } catch (error) {
    next(error);
  }
}

// 获取用户统计概览
async function getUserOverview(req, res, next) {
  try {
    const { openid } = req.query;
    
    if (!openid) {
      return res.status(400).json({
        status: 'error',
        message: '缺少openid参数'
      });
    }
    
    // 获取用户ID
    const userSql = 'SELECT id FROM users WHERE openid = ?';
    const users = await query(userSql, [openid]);
    
    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }
    
    const userId = users[0].id;
    
    // 获取习惯统计
    const habitSql = `
      SELECT 
        COUNT(*) as total_habits,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active_habits
      FROM habits WHERE user_id = ?
    `;
    const habitStats = await query(habitSql, [userId]);
    
    // 获取今日打卡数
    const todaySql = `
      SELECT COUNT(*) as today_checkins
      FROM check_in_records
      WHERE user_id = ? AND check_in_date = CURDATE()
    `;
    const todayStats = await query(todaySql, [userId]);
    
    // 获取笔记总数
    const noteSql = 'SELECT COUNT(*) as total_notes FROM notes WHERE user_id = ?';
    const noteStats = await query(noteSql, [userId]);
    
    res.json({
      status: 'success',
      data: {
        total_habits: habitStats[0].total_habits || 0,
        active_habits: habitStats[0].active_habits || 0,
        today_checkins: todayStats[0].today_checkins || 0,
        total_notes: noteStats[0].total_notes || 0
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserInfo,
  updateUserInfo,
  getUserOverview
};
