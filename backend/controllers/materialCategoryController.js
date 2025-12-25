const { query } = require('../config/database');

async function getUserIdByOpenid(openid) {
  const userSql = 'SELECT id FROM users WHERE openid = ?';
  const users = await query(userSql, [openid]);
  
  if (users.length === 0) {
    return null;
  }
  
  return users[0].id;
}

async function getMaterialCategories(req, res, next) {
  try {
    const { openid, status } = req.query;
    
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
    
    let sql = 'SELECT * FROM material_categories WHERE user_id = ?';
    const params = [userId];
    
    if (status !== undefined) {
      sql += ' AND status = ?';
      params.push(parseInt(status));
    }
    
    sql += ' ORDER BY sort_order ASC, created_at DESC';
    
    const categories = await query(sql, params);
    
    res.json({
      status: 'success',
      data: categories
    });
  } catch (error) {
    next(error);
  }
}

async function createMaterialCategory(req, res, next) {
  try {
    const { openid, name, icon, color, sort_order } = req.body;
    
    if (!openid || !name) {
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
    
    const sql = `INSERT INTO material_categories 
      (user_id, name, icon, color, sort_order)
      VALUES (?, ?, ?, ?, ?)`;
    
    const result = await query(sql, [
      userId, name, icon, color, sort_order || 0
    ]);
    
    res.json({
      status: 'success',
      message: '素材分类创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

async function updateMaterialCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { openid, name, icon, color, sort_order, status } = req.body;
    
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
    
    const sql = `UPDATE material_categories SET
      name = COALESCE(?, name),
      icon = COALESCE(?, icon),
      color = COALESCE(?, color),
      sort_order = COALESCE(?, sort_order),
      status = COALESCE(?, status),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?`;
    
    await query(sql, [
      name, icon, color, sort_order, status, id, userId
    ]);
    
    res.json({
      status: 'success',
      message: '素材分类更新成功'
    });
  } catch (error) {
    next(error);
  }
}

async function deleteMaterialCategory(req, res, next) {
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
    
    const sql = 'UPDATE material_categories SET status = 0 WHERE id = ? AND user_id = ?';
    await query(sql, [id, userId]);
    
    res.json({
      status: 'success',
      message: '素材分类删除成功'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMaterialCategories,
  createMaterialCategory,
  updateMaterialCategory,
  deleteMaterialCategory
};