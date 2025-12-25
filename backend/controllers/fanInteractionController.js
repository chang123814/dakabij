const { query } = require('../config/database');

async function getUserIdByOpenid(openid) {
  const result = await query('SELECT id FROM users WHERE openid = ?', [openid]);
  return result.length > 0 ? result[0].id : null;
}

async function getFanInteractions(req, res, next) {
  try {
    const { openid, platform_name, interaction_type, status, page = 1, page_size = 20 } = req.query;
    
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
    
    let sql = 'SELECT fi.*, sp.platform_name FROM fan_interactions fi LEFT JOIN social_platforms sp ON fi.platform_id = sp.id WHERE fi.user_id = ?';
    const params = [userId];
    
    if (platform_name) {
      sql += ' AND sp.platform_name = ?';
      params.push(platform_name);
    }
    
    if (interaction_type) {
      sql += ' AND fi.interaction_type = ?';
      params.push(interaction_type);
    }
    
    if (status !== undefined) {
      sql += ' AND fi.status = ?';
      params.push(parseInt(status));
    }
    
    const countSql = sql.replace('SELECT fi.*, sp.platform_name', 'SELECT COUNT(*) as total');
    const countResult = await query(countSql, params);
    const total = countResult[0].total;
    
    const offset = (parseInt(page) - 1) * parseInt(page_size);
    sql += ' ORDER BY fi.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(page_size), offset);
    
    const interactions = await query(sql, params);
    
    res.json({
      status: 'success',
      data: interactions,
      pagination: {
        page: parseInt(page),
        page_size: parseInt(page_size),
        total: total,
        total_pages: Math.ceil(total / parseInt(page_size))
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getFanInteractionById(req, res, next) {
  try {
    const { id } = req.params;
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
    
    const result = await query('SELECT fi.*, sp.platform_name FROM fan_interactions fi LEFT JOIN social_platforms sp ON fi.platform_id = sp.id WHERE fi.id = ? AND fi.user_id = ?', [id, userId]);
    
    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '粉丝互动记录不存在'
      });
    }
    
    res.json({
      status: 'success',
      data: result[0]
    });
  } catch (error) {
    next(error);
  }
}

async function createFanInteraction(req, res, next) {
  try {
    const { openid, platform_id, interaction_type, fan_name, fan_id, content, images, reply, status } = req.body;
    
    if (!openid || !platform_id || !interaction_type || !content) {
      return res.status(400).json({
        status: 'error',
        message: '缺少必要参数'
      });
    }
    
    const userId = await getUserIdByOpenid(openid);
    
    if (!userId) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }
    
    const sql = `INSERT INTO fan_interactions 
      (user_id, platform_id, interaction_type, fan_name, fan_id, content, images, reply, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const result = await query(sql, [
      userId, platform_id, interaction_type, fan_name, fan_id, content, images, reply, status !== undefined ? status : 0
    ]);
    
    res.json({
      status: 'success',
      message: '粉丝互动记录创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

async function updateFanInteraction(req, res, next) {
  try {
    const { id } = req.params;
    const { openid, interaction_type, fan_name, fan_id, content, images, reply, status } = req.body;
    
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
    
    const existingInteraction = await query('SELECT * FROM fan_interactions WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (existingInteraction.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '粉丝互动记录不存在'
      });
    }
    
    const sql = `UPDATE fan_interactions SET 
      interaction_type = ?, 
      fan_name = ?, 
      fan_id = ?, 
      content = ?, 
      images = ?, 
      reply = ?, 
      status = ?,
      updated_at = NOW()
      WHERE id = ? AND user_id = ?`;
    
    await query(sql, [
      interaction_type || existingInteraction[0].interaction_type,
      fan_name !== undefined ? fan_name : existingInteraction[0].fan_name,
      fan_id !== undefined ? fan_id : existingInteraction[0].fan_id,
      content !== undefined ? content : existingInteraction[0].content,
      images !== undefined ? images : existingInteraction[0].images,
      reply !== undefined ? reply : existingInteraction[0].reply,
      status !== undefined ? status : existingInteraction[0].status,
      id, userId
    ]);
    
    res.json({
      status: 'success',
      message: '粉丝互动记录更新成功'
    });
  } catch (error) {
    next(error);
  }
}

async function deleteFanInteraction(req, res, next) {
  try {
    const { id } = req.params;
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
    
    const result = await query('DELETE FROM fan_interactions WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: '粉丝互动记录不存在'
      });
    }
    
    res.json({
      status: 'success',
      message: '粉丝互动记录删除成功'
    });
  } catch (error) {
    next(error);
  }
}

async function getInteractionStats(req, res, next) {
  try {
    const { openid, start_date, end_date } = req.query;
    
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
    
    let sql = 'SELECT interaction_type, COUNT(*) as count FROM fan_interactions WHERE user_id = ?';
    const params = [userId];
    
    if (start_date) {
      sql += ' AND created_at >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      sql += ' AND created_at <= ?';
      params.push(end_date);
    }
    
    sql += ' GROUP BY interaction_type';
    
    const stats = await query(sql, params);
    
    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getFanInteractions,
  getFanInteractionById,
  createFanInteraction,
  updateFanInteraction,
  deleteFanInteraction,
  getInteractionStats
};
