const { query } = require('../config/database');

async function getUserIdByOpenid(openid) {
  const userSql = 'SELECT id FROM users WHERE openid = ?';
  const users = await query(userSql, [openid]);
  
  if (users.length === 0) {
    return null;
  }
  
  return users[0].id;
}

async function getMaterials(req, res, next) {
  try {
    const { openid, category_id, material_type, keyword, is_favorite, page = 1, page_size = 20 } = req.query;
    
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
    
    let sql = 'SELECT m.*, mc.name as category_name FROM materials m LEFT JOIN material_categories mc ON m.category_id = mc.id WHERE m.user_id = ? AND m.status = 1';
    const params = [userId];
    
    if (category_id) {
      sql += ' AND m.category_id = ?';
      params.push(parseInt(category_id));
    }
    
    if (material_type) {
      sql += ' AND m.material_type = ?';
      params.push(material_type);
    }
    
    if (keyword) {
      sql += ' AND (m.title LIKE ? OR m.content LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    
    if (is_favorite !== undefined) {
      sql += ' AND m.is_favorite = ?';
      params.push(parseInt(is_favorite));
    }
    
    const offset = (parseInt(page) - 1) * parseInt(page_size);
    sql += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(page_size), offset);
    
    const materials = await query(sql, params);
    
    const countSql = 'SELECT COUNT(*) as total FROM materials m WHERE m.user_id = ? AND m.status = 1';
    const countParams = [userId];
    
    if (category_id) {
      countSql += ' AND m.category_id = ?';
      countParams.push(parseInt(category_id));
    }
    
    if (material_type) {
      countSql += ' AND m.material_type = ?';
      countParams.push(material_type);
    }
    
    if (keyword) {
      countSql += ' AND (m.title LIKE ? OR m.content LIKE ?)';
      countParams.push(`%${keyword}%`, `%${keyword}%`);
    }
    
    if (is_favorite !== undefined) {
      countSql += ' AND m.is_favorite = ?';
      countParams.push(parseInt(is_favorite));
    }
    
    const countResult = await query(countSql, countParams);
    const total = countResult[0].total;
    
    res.json({
      status: 'success',
      data: materials,
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

async function getMaterialById(req, res, next) {
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
    
    const sql = 'SELECT m.*, mc.name as category_name FROM materials m LEFT JOIN material_categories mc ON m.category_id = mc.id WHERE m.id = ? AND m.user_id = ?';
    const materials = await query(sql, [id, userId]);
    
    if (materials.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '素材不存在'
      });
    }
    
    await query('UPDATE materials SET view_count = view_count + 1 WHERE id = ?', [id]);
    
    res.json({
      status: 'success',
      data: materials[0]
    });
  } catch (error) {
    next(error);
  }
}

async function createMaterial(req, res, next) {
  try {
    const { openid, category_id, title, content, material_type, source, image_url, tags, is_favorite } = req.body;
    
    if (!openid || !title) {
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
    
    const tagsStr = Array.isArray(tags) ? tags.join(',') : tags;
    
    const sql = `INSERT INTO materials 
      (user_id, category_id, title, content, material_type, source, image_url, tags, is_favorite)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const result = await query(sql, [
      userId, category_id, title, content, material_type || 'inspiration',
      source, image_url, tagsStr, is_favorite || 0
    ]);
    
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const tagSql = 'SELECT id FROM tags WHERE user_id = ? AND name = ? AND tag_type = ?';
        const existingTags = await query(tagSql, [userId, tagName, 'material']);
        
        if (existingTags.length > 0) {
          await query('UPDATE tags SET usage_count = usage_count + 1 WHERE id = ?', [existingTags[0].id]);
        } else {
          await query('INSERT INTO tags (user_id, name, tag_type, usage_count) VALUES (?, ?, ?, 1)', [userId, tagName, 'material']);
        }
      }
    }
    
    res.json({
      status: 'success',
      message: '素材创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

async function updateMaterial(req, res, next) {
  try {
    const { id } = req.params;
    const { openid, category_id, title, content, material_type, source, image_url, tags, is_favorite } = req.body;
    
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
    
    const tagsStr = Array.isArray(tags) ? tags.join(',') : tags;
    
    const sql = `UPDATE materials SET
      category_id = COALESCE(?, category_id),
      title = COALESCE(?, title),
      content = COALESCE(?, content),
      material_type = COALESCE(?, material_type),
      source = COALESCE(?, source),
      image_url = COALESCE(?, image_url),
      tags = COALESCE(?, tags),
      is_favorite = COALESCE(?, is_favorite),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?`;
    
    await query(sql, [
      category_id, title, content, material_type, source, image_url, tagsStr, is_favorite, id, userId
    ]);
    
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const tagSql = 'SELECT id FROM tags WHERE user_id = ? AND name = ? AND tag_type = ?';
        const existingTags = await query(tagSql, [userId, tagName, 'material']);
        
        if (existingTags.length > 0) {
          await query('UPDATE tags SET usage_count = usage_count + 1 WHERE id = ?', [existingTags[0].id]);
        } else {
          await query('INSERT INTO tags (user_id, name, tag_type, usage_count) VALUES (?, ?, ?, 1)', [userId, tagName, 'material']);
        }
      }
    }
    
    res.json({
      status: 'success',
      message: '素材更新成功'
    });
  } catch (error) {
    next(error);
  }
}

async function deleteMaterial(req, res, next) {
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
    
    const sql = 'UPDATE materials SET status = 0 WHERE id = ? AND user_id = ?';
    await query(sql, [id, userId]);
    
    res.json({
      status: 'success',
      message: '素材删除成功'
    });
  } catch (error) {
    next(error);
  }
}

async function toggleFavorite(req, res, next) {
  try {
    const { id } = req.params;
    const { openid } = req.body;
    
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
    
    const getSql = 'SELECT is_favorite FROM materials WHERE id = ? AND user_id = ?';
    const materials = await query(getSql, [id, userId]);
    
    if (materials.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '素材不存在'
      });
    }
    
    const newFavorite = materials[0].is_favorite === 1 ? 0 : 1;
    await query('UPDATE materials SET is_favorite = ? WHERE id = ?', [newFavorite, id]);
    
    res.json({
      status: 'success',
      message: newFavorite === 1 ? '收藏成功' : '取消收藏成功',
      data: { is_favorite: newFavorite }
    });
  } catch (error) {
    next(error);
  }
}

async function getFavoriteMaterials(req, res, next) {
  try {
    const { openid, page = 1, page_size = 20 } = req.query;
    
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
    
    const offset = (parseInt(page) - 1) * parseInt(page_size);
    const sql = 'SELECT m.*, mc.name as category_name FROM materials m LEFT JOIN material_categories mc ON m.category_id = mc.id WHERE m.user_id = ? AND m.is_favorite = 1 AND m.status = 1 ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
    const materials = await query(sql, [userId, parseInt(page_size), offset]);
    
    const countSql = 'SELECT COUNT(*) as total FROM materials WHERE user_id = ? AND is_favorite = 1 AND status = 1';
    const countResult = await query(countSql, [userId]);
    const total = countResult[0].total;
    
    res.json({
      status: 'success',
      data: materials,
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
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  toggleFavorite,
  getFavoriteMaterials
};