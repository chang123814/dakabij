// 习惯控制器
const { query } = require('../config/database');

// 获取习惯列表
async function getHabits(req, res, next) {
  try {
    const { openid, status } = req.query;
    
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
    
    let sql = 'SELECT * FROM habits WHERE user_id = ?';
    const params = [userId];
    
    if (status !== undefined) {
      sql += ' AND status = ?';
      params.push(parseInt(status));
    }
    
    sql += ' ORDER BY sort_order ASC, created_at DESC';
    
    const habits = await query(sql, params);
    
    res.json({
      status: 'success',
      data: habits
    });
  } catch (error) {
    next(error);
  }
}

// 创建习惯
async function createHabit(req, res, next) {
  try {
    const { openid, name, description, icon, color, frequency_type, target_count, reminder_time, reminder_enabled, start_date } = req.body;
    
    if (!openid || !name) {
      return res.status(400).json({
        status: 'error',
        message: '缺少必要参数'
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
    
    const sql = `INSERT INTO habits 
      (user_id, name, description, icon, color, frequency_type, target_count, reminder_time, reminder_enabled, start_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const result = await query(sql, [
      userId, name, description, icon, color, frequency_type || 'daily', 
      target_count || 1, reminder_time, reminder_enabled || 0, start_date
    ]);
    
    res.json({
      status: 'success',
      message: '习惯创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

// 获取习惯详情
async function getHabitDetail(req, res, next) {
  try {
    const { id } = req.params;
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
    
    const sql = 'SELECT * FROM habits WHERE id = ? AND user_id = ?';
    const habits = await query(sql, [id, userId]);
    
    if (habits.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '习惯不存在'
      });
    }
    
    res.json({
      status: 'success',
      data: habits[0]
    });
  } catch (error) {
    next(error);
  }
}

// 更新习惯
async function updateHabit(req, res, next) {
  try {
    const { id } = req.params;
    const { openid, name, description, icon, color, frequency_type, target_count, reminder_time, reminder_enabled, start_date, end_date, status, sort_order } = req.body;
    
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
    
    const sql = `UPDATE habits SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      icon = COALESCE(?, icon),
      color = COALESCE(?, color),
      frequency_type = COALESCE(?, frequency_type),
      target_count = COALESCE(?, target_count),
      reminder_time = COALESCE(?, reminder_time),
      reminder_enabled = COALESCE(?, reminder_enabled),
      start_date = COALESCE(?, start_date),
      end_date = COALESCE(?, end_date),
      status = COALESCE(?, status),
      sort_order = COALESCE(?, sort_order),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?`;
    
    await query(sql, [
      name, description, icon, color, frequency_type, target_count,
      reminder_time, reminder_enabled, start_date, end_date, status, sort_order,
      id, userId
    ]);
    
    res.json({
      status: 'success',
      message: '习惯更新成功'
    });
  } catch (error) {
    next(error);
  }
}

// 删除习惯
async function deleteHabit(req, res, next) {
  try {
    const { id } = req.params;
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
    
    const sql = 'DELETE FROM habits WHERE id = ? AND user_id = ?';
    await query(sql, [id, userId]);
    
    res.json({
      status: 'success',
      message: '习惯删除成功'
    });
  } catch (error) {
    next(error);
  }
}

// 获取习惯打卡记录
async function getHabitCheckIns(req, res, next) {
  try {
    const { id } = req.params;
    const { openid, start_date, end_date } = req.query;
    
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
    
    let sql = 'SELECT * FROM check_in_records WHERE habit_id = ? AND user_id = ?';
    const params = [id, userId];
    
    if (start_date) {
      sql += ' AND check_in_date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      sql += ' AND check_in_date <= ?';
      params.push(end_date);
    }
    
    sql += ' ORDER BY check_in_date DESC';
    
    const checkIns = await query(sql, params);
    
    res.json({
      status: 'success',
      data: checkIns
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHabits,
  createHabit,
  getHabitDetail,
  updateHabit,
  deleteHabit,
  getHabitCheckIns
};
