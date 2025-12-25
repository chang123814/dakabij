const { query } = require('../config/database');

async function getUserIdByOpenid(openid) {
  const result = await query('SELECT id FROM users WHERE openid = ?', [openid]);
  return result.length > 0 ? result[0].id : null;
}

async function getContentPublishes(req, res, next) {
  try {
    const { openid, platform_name, content_type, status, keyword, page = 1, page_size = 20 } = req.query;
    
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
    
    let sql = 'SELECT cp.*, sp.platform_name, sp.platform_nickname FROM content_publishes cp LEFT JOIN social_platforms sp ON cp.platform_id = sp.id WHERE cp.user_id = ?';
    const params = [userId];
    
    if (platform_name) {
      sql += ' AND sp.platform_name = ?';
      params.push(platform_name);
    }
    
    if (content_type) {
      sql += ' AND cp.content_type = ?';
      params.push(content_type);
    }
    
    if (status !== undefined) {
      sql += ' AND cp.status = ?';
      params.push(parseInt(status));
    }
    
    if (keyword) {
      sql += ' AND (cp.title LIKE ? OR cp.content LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    
    const countSql = sql.replace('SELECT cp.*, sp.platform_name, sp.platform_nickname', 'SELECT COUNT(*) as total');
    const countResult = await query(countSql, params);
    const total = countResult[0].total;
    
    const offset = (parseInt(page) - 1) * parseInt(page_size);
    sql += ' ORDER BY cp.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(page_size), offset);
    
    const publishes = await query(sql, params);
    
    res.json({
      status: 'success',
      data: publishes,
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

async function getContentPublishById(req, res, next) {
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
    
    const result = await query('SELECT cp.*, sp.platform_name, sp.platform_nickname FROM content_publishes cp LEFT JOIN social_platforms sp ON cp.platform_id = sp.id WHERE cp.id = ? AND cp.user_id = ?', [id, userId]);
    
    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '内容发布记录不存在'
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

async function createContentPublish(req, res, next) {
  try {
    const { openid, platform_id, title, content, content_type, cover_image, tags, publish_time, status } = req.body;
    
    if (!openid || !platform_id || !title || !content_type) {
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
    
    const sql = `INSERT INTO content_publishes 
      (user_id, platform_id, title, content, content_type, cover_image, tags, publish_time, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const result = await query(sql, [
      userId, platform_id, title, content, content_type, cover_image, tags, publish_time || null, status !== undefined ? status : 0
    ]);
    
    res.json({
      status: 'success',
      message: '内容发布记录创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

async function updateContentPublish(req, res, next) {
  try {
    const { id } = req.params;
    const { openid, platform_id, title, content, content_type, cover_image, tags, publish_time, status } = req.body;
    
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
    
    const existingPublish = await query('SELECT * FROM content_publishes WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (existingPublish.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '内容发布记录不存在'
      });
    }
    
    const sql = `UPDATE content_publishes SET 
      platform_id = ?, 
      title = ?, 
      content = ?, 
      content_type = ?, 
      cover_image = ?, 
      tags = ?, 
      publish_time = ?, 
      status = ?,
      updated_at = NOW()
      WHERE id = ? AND user_id = ?`;
    
    await query(sql, [
      platform_id || existingPublish[0].platform_id,
      title || existingPublish[0].title,
      content !== undefined ? content : existingPublish[0].content,
      content_type || existingPublish[0].content_type,
      cover_image !== undefined ? cover_image : existingPublish[0].cover_image,
      tags !== undefined ? tags : existingPublish[0].tags,
      publish_time !== undefined ? publish_time : existingPublish[0].publish_time,
      status !== undefined ? status : existingPublish[0].status,
      id, userId
    ]);
    
    res.json({
      status: 'success',
      message: '内容发布记录更新成功'
    });
  } catch (error) {
    next(error);
  }
}

async function deleteContentPublish(req, res, next) {
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
    
    const result = await query('DELETE FROM content_publishes WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: '内容发布记录不存在'
      });
    }
    
    res.json({
      status: 'success',
      message: '内容发布记录删除成功'
    });
  } catch (error) {
    next(error);
  }
}

async function updatePublishStats(req, res, next) {
  try {
    const { id } = req.params;
    const { openid, views, likes, comments, shares, favorites } = req.body;
    
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
    
    const existingPublish = await query('SELECT * FROM content_publishes WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (existingPublish.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '内容发布记录不存在'
      });
    }
    
    const sql = `UPDATE content_publishes SET 
      views = ?, 
      likes = ?, 
      comments = ?, 
      shares = ?, 
      favorites = ?,
      updated_at = NOW()
      WHERE id = ? AND user_id = ?`;
    
    await query(sql, [
      views !== undefined ? views : existingPublish[0].views,
      likes !== undefined ? likes : existingPublish[0].likes,
      comments !== undefined ? comments : existingPublish[0].comments,
      shares !== undefined ? shares : existingPublish[0].shares,
      favorites !== undefined ? favorites : existingPublish[0].favorites,
      id, userId
    ]);
    
    res.json({
      status: 'success',
      message: '发布数据更新成功'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getContentPublishes,
  getContentPublishById,
  createContentPublish,
  updateContentPublish,
  deleteContentPublish,
  updatePublishStats
};
