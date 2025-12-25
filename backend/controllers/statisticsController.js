const { query } = require('../config/database');

async function getUserIdByOpenid(openid) {
  const result = await query('SELECT id FROM users WHERE openid = ?', [openid]);
  return result.length > 0 ? result[0].id : null;
}

async function getTaskStatistics(req, res, next) {
  try {
    const { openid, start_date, end_date, category_id } = req.query;
    
    if (!openid) {
      return res.status(400).json({
        status: 'error',
        message: '缺少openid参数'
      });
    }
    
    const userId = await getUserIdByOpenid(openid);
    
    if (!userId) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }
    
    let sql = 'SELECT status, COUNT(*) as count FROM tasks WHERE user_id = ?';
    const params = [userId];
    
    if (start_date) {
      sql += ' AND created_at >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      sql += ' AND created_at <= ?';
      params.push(end_date);
    }
    
    if (category_id) {
      sql += ' AND category_id = ?';
      params.push(parseInt(category_id));
    }
    
    sql += ' GROUP BY status';
    
    const stats = await query(sql, params);
    
    const result = {
      total: 0,
      completed: 0,
      in_progress: 0,
      pending: 0,
      cancelled: 0
    };
    
    stats.forEach(stat => {
      result.total += stat.count;
      if (stat.status === 2) result.completed = stat.count;
      else if (stat.status === 1) result.in_progress = stat.count;
      else if (stat.status === 0) result.pending = stat.count;
      else if (stat.status === 3) result.cancelled = stat.count;
    });
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function getContentStatistics(req, res, next) {
  try {
    const { openid, start_date, end_date, platform_name } = req.query;
    
    if (!openid) {
      return res.status(400).json({
        status: 'error',
        message: '缺少openid参数'
      });
    }
    
    const userId = await getUserIdByOpenid(openid);
    
    if (!userId) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }
    
    let sql = `SELECT cp.status, COUNT(*) as count, 
      SUM(cp.views) as total_views, 
      SUM(cp.likes) as total_likes, 
      SUM(cp.comments) as total_comments, 
      SUM(cp.shares) as total_shares, 
      SUM(cp.favorites) as total_favorites
      FROM content_publishes cp 
      LEFT JOIN social_platforms sp ON cp.platform_id = sp.id 
      WHERE cp.user_id = ?`;
    const params = [userId];
    
    if (start_date) {
      sql += ' AND cp.created_at >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      sql += ' AND cp.created_at <= ?';
      params.push(end_date);
    }
    
    if (platform_name) {
      sql += ' AND sp.platform_name = ?';
      params.push(platform_name);
    }
    
    sql += ' GROUP BY cp.status';
    
    const stats = await query(sql, params);
    
    const result = {
      total: 0,
      published: 0,
      draft: 0,
      scheduled: 0,
      total_views: 0,
      total_likes: 0,
      total_comments: 0,
      total_shares: 0,
      total_favorites: 0
    };
    
    stats.forEach(stat => {
      result.total += stat.count;
      if (stat.status === 1) result.published = stat.count;
      else if (stat.status === 0) result.draft = stat.count;
      else if (stat.status === 2) result.scheduled = stat.count;
      
      result.total_views += stat.total_views || 0;
      result.total_likes += stat.total_likes || 0;
      result.total_comments += stat.total_comments || 0;
      result.total_shares += stat.total_shares || 0;
      result.total_favorites += stat.total_favorites || 0;
    });
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function getFanInteractionStatistics(req, res, next) {
  try {
    const { openid, start_date, end_date, platform_name } = req.query;
    
    if (!openid) {
      return res.status(400).json({
        status: 'error',
        message: '缺少openid参数'
      });
    }
    
    const userId = await getUserIdByOpenid(openid);
    
    if (!userId) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }
    
    let sql = `SELECT fi.interaction_type, COUNT(*) as count 
      FROM fan_interactions fi 
      LEFT JOIN social_platforms sp ON fi.platform_id = sp.id 
      WHERE fi.user_id = ?`;
    const params = [userId];
    
    if (start_date) {
      sql += ' AND fi.created_at >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      sql += ' AND fi.created_at <= ?';
      params.push(end_date);
    }
    
    if (platform_name) {
      sql += ' AND sp.platform_name = ?';
      params.push(platform_name);
    }
    
    sql += ' GROUP BY fi.interaction_type';
    
    const stats = await query(sql, params);
    
    const result = {
      total: 0,
      comment: 0,
      message: 0,
      mention: 0,
      like: 0
    };
    
    stats.forEach(stat => {
      result.total += stat.count;
      if (stat.interaction_type === 'comment') result.comment = stat.count;
      else if (stat.interaction_type === 'message') result.message = stat.count;
      else if (stat.interaction_type === 'mention') result.mention = stat.count;
      else if (stat.interaction_type === 'like') result.like = stat.count;
    });
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function getMonetizationStatistics(req, res, next) {
  try {
    const { openid, start_date, end_date, plan_type } = req.query;
    
    if (!openid) {
      return res.status(400).json({
        status: 'error',
        message: '缺少openid参数'
      });
    }
    
    const userId = await getUserIdByOpenid(openid);
    
    if (!userId) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }
    
    let sql = `SELECT mp.plan_type, 
      COUNT(*) as plan_count,
      SUM(mp.target_amount) as total_target,
      SUM(mp.current_amount) as total_current,
      (SELECT SUM(mr.amount) FROM monetization_records mr WHERE mr.user_id = ? AND mr.record_type = 'income'`;
    const params = [userId];
    
    if (start_date) {
      sql += ' AND mr.record_date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      sql += ' AND mr.record_date <= ?';
      params.push(end_date);
    }
    
    sql += `) as total_income,
      (SELECT SUM(mr.amount) FROM monetization_records mr WHERE mr.user_id = ? AND mr.record_type = 'expense'`;
    params.push(userId);
    
    if (start_date) {
      sql += ' AND mr.record_date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      sql += ' AND mr.record_date <= ?';
      params.push(end_date);
    }
    
    sql += `) as total_expense
      FROM monetization_plans mp WHERE mp.user_id = ?`;
    params.push(userId);
    
    if (plan_type) {
      sql += ' AND mp.plan_type = ?';
      params.push(plan_type);
    }
    
    sql += ' GROUP BY mp.plan_type';
    
    const stats = await query(sql, params);
    
    const result = {
      total_plans: 0,
      total_target: 0,
      total_current: 0,
      total_income: 0,
      total_expense: 0,
      by_type: {}
    };
    
    stats.forEach(stat => {
      result.total_plans += stat.plan_count;
      result.total_target += stat.total_target || 0;
      result.total_current += stat.total_current || 0;
      result.total_income += stat.total_income || 0;
      result.total_expense += stat.total_expense || 0;
      
      result.by_type[stat.plan_type] = {
        plan_count: stat.plan_count,
        total_target: stat.total_target || 0,
        total_current: stat.total_current || 0
      };
    });
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function getDashboardOverview(req, res, next) {
  try {
    const { openid } = req.query;
    
    if (!openid) {
      return res.status(400).json({
        status: 'error',
        message: '缺少openid参数'
      });
    }
    
    const userId = await getUserIdByOpenid(openid);
    
    if (!userId) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const [
      taskStats,
      contentStats,
      interactionStats,
      monetizationStats,
      materialCount,
      platformCount
    ] = await Promise.all([
      query('SELECT status, COUNT(*) as count FROM tasks WHERE user_id = ? AND created_at >= ? GROUP BY status', [userId, weekAgo]),
      query(`SELECT cp.status, COUNT(*) as count, 
        SUM(cp.views) as total_views, 
        SUM(cp.likes) as total_likes 
        FROM content_publishes cp 
        WHERE cp.user_id = ? AND cp.created_at >= ? 
        GROUP BY cp.status`, [userId, weekAgo]),
      query('SELECT COUNT(*) as count FROM fan_interactions WHERE user_id = ? AND created_at >= ?', [userId, weekAgo]),
      query(`SELECT 
        (SELECT SUM(amount) FROM monetization_records WHERE user_id = ? AND record_type = 'income' AND record_date >= ?) as income,
        (SELECT SUM(amount) FROM monetization_records WHERE user_id = ? AND record_type = 'expense' AND record_date >= ?) as expense`,
        [userId, weekAgo, userId, weekAgo]),
      query('SELECT COUNT(*) as count FROM materials WHERE user_id = ? AND status = 1', [userId]),
      query('SELECT COUNT(*) as count FROM social_platforms WHERE user_id = ? AND status = 1', [userId])
    ]);
    
    const taskResult = { total: 0, completed: 0, in_progress: 0 };
    taskStats.forEach(stat => {
      taskResult.total += stat.count;
      if (stat.status === 2) taskResult.completed = stat.count;
      else if (stat.status === 1) taskResult.in_progress = stat.count;
    });
    
    const contentResult = { total: 0, published: 0, total_views: 0, total_likes: 0 };
    contentStats.forEach(stat => {
      contentResult.total += stat.count;
      if (stat.status === 1) contentResult.published = stat.count;
      contentResult.total_views += stat.total_views || 0;
      contentResult.total_likes += stat.total_likes || 0;
    });
    
    const result = {
      tasks: taskResult,
      content: contentResult,
      interactions: {
        total: interactionStats[0]?.count || 0
      },
      monetization: {
        income: monetizationStats[0]?.income || 0,
        expense: monetizationStats[0]?.expense || 0,
        profit: (monetizationStats[0]?.income || 0) - (monetizationStats[0]?.expense || 0)
      },
      materials: {
        total: materialCount[0]?.count || 0
      },
      platforms: {
        total: platformCount[0]?.count || 0
      }
    };
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTaskStatistics,
  getContentStatistics,
  getFanInteractionStatistics,
  getMonetizationStatistics,
  getDashboardOverview
};
