const { query } = require('../config/database');

async function getUserIdByOpenid(openid) {
  const result = await query('SELECT id FROM users WHERE openid = ?', [openid]);
  return result.length > 0 ? result[0].id : null;
}

async function getThemePlans(req, res, next) {
  try {
    const { openid, status, page = 1, page_size = 20 } = req.query;
    
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
    
    let sql = 'SELECT * FROM theme_plans WHERE user_id = ?';
    const params = [userId];
    
    if (status !== undefined) {
      sql += ' AND status = ?';
      params.push(parseInt(status));
    }
    
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await query(countSql, params);
    const total = countResult[0].total;
    
    const offset = (parseInt(page) - 1) * parseInt(page_size);
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(page_size), offset);
    
    const plans = await query(sql, params);
    
    res.json({
      status: 'success',
      data: plans,
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

async function getThemePlanById(req, res, next) {
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
    
    const result = await query('SELECT * FROM theme_plans WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '主题规划不存在'
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

async function createThemePlan(req, res, next) {
  try {
    const { openid, theme_name, description, start_date, end_date, status } = req.body;
    
    if (!openid || !theme_name) {
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
    
    const sql = `INSERT INTO theme_plans 
      (user_id, theme_name, description, start_date, end_date, status)
      VALUES (?, ?, ?, ?, ?, ?)`;
    
    const result = await query(sql, [
      userId, theme_name, description, start_date || null, end_date || null, status !== undefined ? status : 0
    ]);
    
    res.json({
      status: 'success',
      message: '主题规划创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

async function updateThemePlan(req, res, next) {
  try {
    const { id } = req.params;
    const { openid, theme_name, description, start_date, end_date, status } = req.body;
    
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
    
    const existingPlan = await query('SELECT * FROM theme_plans WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (existingPlan.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '主题规划不存在'
      });
    }
    
    const sql = `UPDATE theme_plans SET 
      theme_name = ?, 
      description = ?, 
      start_date = ?, 
      end_date = ?, 
      status = ?,
      updated_at = NOW()
      WHERE id = ? AND user_id = ?`;
    
    await query(sql, [
      theme_name || existingPlan[0].theme_name,
      description !== undefined ? description : existingPlan[0].description,
      start_date !== undefined ? start_date : existingPlan[0].start_date,
      end_date !== undefined ? end_date : existingPlan[0].end_date,
      status !== undefined ? status : existingPlan[0].status,
      id, userId
    ]);
    
    res.json({
      status: 'success',
      message: '主题规划更新成功'
    });
  } catch (error) {
    next(error);
  }
}

async function deleteThemePlan(req, res, next) {
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
    
    const result = await query('DELETE FROM theme_plans WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: '主题规划不存在'
      });
    }
    
    res.json({
      status: 'success',
      message: '主题规划删除成功'
    });
  } catch (error) {
    next(error);
  }
}

async function addThemeContent(req, res, next) {
  try {
    const { openid, theme_id, content_title, content_description, content_type, target_platforms, planned_date, status } = req.body;
    
    if (!openid || !theme_id || !content_title) {
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
    
    const sql = `INSERT INTO theme_contents 
      (user_id, theme_id, content_title, content_description, content_type, target_platforms, planned_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const result = await query(sql, [
      userId, theme_id, content_title, content_description, content_type, target_platforms, planned_date || null, status !== undefined ? status : 0
    ]);
    
    res.json({
      status: 'success',
      message: '主题内容添加成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

async function getThemeContents(req, res, next) {
  try {
    const { openid, theme_id, status, page = 1, page_size = 20 } = req.query;
    
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
    
    let sql = 'SELECT tc.*, tp.theme_name FROM theme_contents tc LEFT JOIN theme_plans tp ON tc.theme_id = tp.id WHERE tc.user_id = ?';
    const params = [userId];
    
    if (theme_id) {
      sql += ' AND tc.theme_id = ?';
      params.push(parseInt(theme_id));
    }
    
    if (status !== undefined) {
      sql += ' AND tc.status = ?';
      params.push(parseInt(status));
    }
    
    const countSql = sql.replace('SELECT tc.*, tp.theme_name', 'SELECT COUNT(*) as total');
    const countResult = await query(countSql, params);
    const total = countResult[0].total;
    
    const offset = (parseInt(page) - 1) * parseInt(page_size);
    sql += ' ORDER BY tc.planned_date ASC, tc.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(page_size), offset);
    
    const contents = await query(sql, params);
    
    res.json({
      status: 'success',
      data: contents,
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

module.exports = {
  getThemePlans,
  getThemePlanById,
  createThemePlan,
  updateThemePlan,
  deleteThemePlan,
  addThemeContent,
  getThemeContents
};
