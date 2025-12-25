// 打卡控制器
const { query } = require('../config/database');

// 创建打卡记录
async function createCheckIn(req, res, next) {
  try {
    const { openid, habit_id, check_in_date, note, mood } = req.body;
    
    if (!openid || !habit_id || !check_in_date) {
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
    
    // 检查习惯是否存在
    const habitSql = 'SELECT id FROM habits WHERE id = ? AND user_id = ?';
    const habits = await query(habitSql, [habit_id, userId]);
    
    if (habits.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '习惯不存在'
      });
    }
    
    // 检查是否已经打卡
    const checkSql = 'SELECT id FROM check_in_records WHERE habit_id = ? AND check_in_date = ?';
    const existing = await query(checkSql, [habit_id, check_in_date]);
    
    if (existing.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: '该日期已打卡'
      });
    }
    
    const sql = `INSERT INTO check_in_records 
      (habit_id, user_id, check_in_date, note, mood)
      VALUES (?, ?, ?, ?, ?)`;
    
    const result = await query(sql, [habit_id, userId, check_in_date, note, mood]);
    
    res.json({
      status: 'success',
      message: '打卡成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

// 获取打卡记录列表
async function getCheckIns(req, res, next) {
  try {
    const { openid, habit_id, start_date, end_date, limit = 50 } = req.query;
    
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
    
    let sql = 'SELECT * FROM check_in_records WHERE user_id = ?';
    const params = [userId];
    
    if (habit_id) {
      sql += ' AND habit_id = ?';
      params.push(habit_id);
    }
    
    if (start_date) {
      sql += ' AND check_in_date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      sql += ' AND check_in_date <= ?';
      params.push(end_date);
    }
    
    sql += ' ORDER BY check_in_date DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const checkIns = await query(sql, params);
    
    res.json({
      status: 'success',
      data: checkIns
    });
  } catch (error) {
    next(error);
  }
}

// 获取今日打卡状态
async function getTodayCheckIns(req, res, next) {
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
    
    const sql = `
      SELECT 
        h.id as habit_id,
        h.name as habit_name,
        h.icon,
        h.color,
        c.id as check_in_id,
        c.check_in_time,
        c.note,
        c.mood
      FROM habits h
      LEFT JOIN check_in_records c ON h.id = c.habit_id AND c.check_in_date = CURDATE()
      WHERE h.user_id = ? AND h.status = 1
      ORDER BY h.sort_order ASC
    `;
    
    const result = await query(sql, [userId]);
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

// 删除打卡记录
async function deleteCheckIn(req, res, next) {
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
    
    const sql = 'DELETE FROM check_in_records WHERE id = ? AND user_id = ?';
    await query(sql, [id, userId]);
    
    res.json({
      status: 'success',
      message: '打卡记录删除成功'
    });
  } catch (error) {
    next(error);
  }
}

// 获取打卡统计
async function getCheckInStatistics(req, res, next) {
  try {
    const { habitId } = req.params;
    const { openid, days = 30 } = req.query;
    
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
    
    // 获取总打卡次数
    const totalSql = 'SELECT COUNT(*) as total FROM check_in_records WHERE habit_id = ? AND user_id = ?';
    const totalResult = await query(totalSql, [habitId, userId]);
    
    // 获取最近N天的打卡记录
    const recentSql = `
      SELECT 
        DATE(check_in_date) as date,
        COUNT(*) as count
      FROM check_in_records
      WHERE habit_id = ? AND user_id = ? 
        AND check_in_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(check_in_date)
      ORDER BY date DESC
    `;
    const recentResult = await query(recentSql, [habitId, userId, parseInt(days)]);
    
    // 计算连续打卡天数
    const streakSql = `
      SELECT 
        COUNT(*) as streak
      FROM (
        SELECT 
          check_in_date,
          @rownum := @rownum + 1 as rownum,
          DATEDIFF(check_in_date, @prev_date) as diff,
          @prev_date := check_in_date
        FROM check_in_records, (SELECT @rownum := 0, @prev_date := NULL) r
        WHERE habit_id = ? AND user_id = ?
        ORDER BY check_in_date DESC
      ) t
      WHERE diff = 1 OR rownum = 1
    `;
    const streakResult = await query(streakSql, [habitId, userId]);
    
    res.json({
      status: 'success',
      data: {
        total_checkins: totalResult[0].total || 0,
        current_streak: streakResult[0].streak || 0,
        recent_checkins: recentResult
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCheckIn,
  getCheckIns,
  getTodayCheckIns,
  deleteCheckIn,
  getCheckInStatistics
};
