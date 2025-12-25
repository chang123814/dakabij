// 统计控制器
const { query } = require('../config/database');

// 获取用户统计数据
async function getUserStatistics(req, res, next) {
  try {
    const { userId } = req.params;
    
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
    
    // 获取总打卡数
    const totalCheckInSql = `
      SELECT COUNT(*) as total_checkins
      FROM check_in_records
      WHERE user_id = ?
    `;
    const totalCheckInStats = await query(totalCheckInSql, [userId]);
    
    // 获取笔记总数
    const noteSql = 'SELECT COUNT(*) as total_notes FROM notes WHERE user_id = ?';
    const noteStats = await query(noteSql, [userId]);
    
    res.json({
      status: 'success',
      data: {
        total_habits: habitStats[0].total_habits || 0,
        active_habits: habitStats[0].active_habits || 0,
        today_checkins: todayStats[0].today_checkins || 0,
        total_checkins: totalCheckInStats[0].total_checkins || 0,
        total_notes: noteStats[0].total_notes || 0
      }
    });
  } catch (error) {
    next(error);
  }
}

// 获取日期范围统计数据
async function getRangeStatistics(req, res, next) {
  try {
    const { openid, start_date, end_date } = req.query;
    
    if (!openid || !start_date || !end_date) {
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
    
    // 获取日期范围内的打卡统计
    const sql = `
      SELECT 
        stat_date,
        total_habits,
        active_habits,
        checked_in_count,
        total_notes
      FROM statistics
      WHERE user_id = ? AND stat_date BETWEEN ? AND ?
      ORDER BY stat_date ASC
    `;
    
    const stats = await query(sql, [userId, start_date, end_date]);
    
    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    next(error);
  }
}

// 获取习惯统计数据
async function getHabitStatistics(req, res, next) {
  try {
    const { habitId } = req.params;
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
    
    // 获取总打卡次数
    const totalSql = 'SELECT COUNT(*) as total FROM check_in_records WHERE habit_id = ? AND user_id = ?';
    const totalResult = await query(totalSql, [habitId, userId]);
    
    // 获取本月打卡次数
    const monthSql = `
      SELECT COUNT(*) as month_count
      FROM check_in_records
      WHERE habit_id = ? AND user_id = ? 
        AND YEAR(check_in_date) = YEAR(CURDATE())
        AND MONTH(check_in_date) = MONTH(CURDATE())
    `;
    const monthResult = await query(monthSql, [habitId, userId]);
    
    // 获取连续打卡天数
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
    
    // 获取最近7天打卡情况
    const recentSql = `
      SELECT 
        DATE(check_in_date) as date,
        COUNT(*) as count
      FROM check_in_records
      WHERE habit_id = ? AND user_id = ? 
        AND check_in_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(check_in_date)
      ORDER BY date DESC
    `;
    const recentResult = await query(recentSql, [habitId, userId]);
    
    res.json({
      status: 'success',
      data: {
        total_checkins: totalResult[0].total || 0,
        month_checkins: monthResult[0].month_count || 0,
        current_streak: streakResult[0].streak || 0,
        recent_checkins: recentResult
      }
    });
  } catch (error) {
    next(error);
  }
}

// 获取月度统计
async function getMonthlyStatistics(req, res, next) {
  try {
    const { userId } = req.params;
    const { year, month } = req.query;
    
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth() + 1;
    
    // 获取该月每天的打卡统计
    const sql = `
      SELECT 
        DAY(check_in_date) as day,
        COUNT(*) as checkin_count
      FROM check_in_records
      WHERE user_id = ? 
        AND YEAR(check_in_date) = ?
        AND MONTH(check_in_date) = ?
      GROUP BY DAY(check_in_date)
      ORDER BY day ASC
    `;
    
    const stats = await query(sql, [userId, targetYear, targetMonth]);
    
    // 获取该月总打卡数
    const totalSql = `
      SELECT COUNT(*) as total
      FROM check_in_records
      WHERE user_id = ? 
        AND YEAR(check_in_date) = ?
        AND MONTH(check_in_date) = ?
    `;
    const totalResult = await query(totalSql, [userId, targetYear, targetMonth]);
    
    res.json({
      status: 'success',
      data: {
        year: targetYear,
        month: targetMonth,
        total_checkins: totalResult[0].total || 0,
        daily_stats: stats
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserStatistics,
  getRangeStatistics,
  getHabitStatistics,
  getMonthlyStatistics
};
