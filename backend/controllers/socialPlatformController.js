const { query } = require('../config/database');

async function getUserIdByOpenid(openid) {
  const result = await query('SELECT id FROM users WHERE openid = ?', [openid]);
  return result.length > 0 ? result[0].id : null;
}

async function getSocialPlatforms(req, res, next) {
  try {
    const { openid, platform_name, status } = req.query;
    
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
    
    let sql = 'SELECT * FROM social_platforms WHERE user_id = ?';
    const params = [userId];
    
    if (platform_name) {
      sql += ' AND platform_name = ?';
      params.push(platform_name);
    }
    
    if (status !== undefined) {
      sql += ' AND status = ?';
      params.push(parseInt(status));
    }
    
    sql += ' ORDER BY is_primary DESC, created_at DESC';
    
    const platforms = await query(sql, params);
    
    res.json({
      status: 'success',
      data: platforms
    });
  } catch (error) {
    next(error);
  }
}

async function getSocialPlatformById(req, res, next) {
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
    
    const result = await query('SELECT * FROM social_platforms WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '社交平台不存在'
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

async function createSocialPlatform(req, res, next) {
  try {
    const { openid, platform_name, platform_nickname, platform_id, avatar_url, follower_count, is_primary } = req.body;
    
    if (!openid || !platform_name) {
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
    
    if (is_primary) {
      await query('UPDATE social_platforms SET is_primary = 0 WHERE user_id = ? AND platform_name = ?', [userId, platform_name]);
    }
    
    const sql = `INSERT INTO social_platforms 
      (user_id, platform_name, platform_nickname, platform_id, avatar_url, follower_count, is_primary)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    const result = await query(sql, [
      userId, platform_name, platform_nickname, platform_id, avatar_url, follower_count || 0, is_primary ? 1 : 0
    ]);
    
    res.json({
      status: 'success',
      message: '社交平台添加成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

async function updateSocialPlatform(req, res, next) {
  try {
    const { id } = req.params;
    const { openid, platform_nickname, platform_id, avatar_url, follower_count, is_primary, status } = req.body;
    
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
    
    const existingPlatform = await query('SELECT * FROM social_platforms WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (existingPlatform.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '社交平台不存在'
      });
    }
    
    if (is_primary && !existingPlatform[0].is_primary) {
      await query('UPDATE social_platforms SET is_primary = 0 WHERE user_id = ? AND platform_name = ? AND id != ?', 
        [userId, existingPlatform[0].platform_name, id]);
    }
    
    const sql = `UPDATE social_platforms SET 
      platform_nickname = ?, 
      platform_id = ?, 
      avatar_url = ?, 
      follower_count = ?, 
      is_primary = ?, 
      status = ?,
      updated_at = NOW()
      WHERE id = ? AND user_id = ?`;
    
    await query(sql, [
      platform_nickname, platform_id, avatar_url, follower_count, is_primary ? 1 : 0, status !== undefined ? status : 1, id, userId
    ]);
    
    res.json({
      status: 'success',
      message: '社交平台更新成功'
    });
  } catch (error) {
    next(error);
  }
}

async function deleteSocialPlatform(req, res, next) {
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
    
    const result = await query('DELETE FROM social_platforms WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: '社交平台不存在'
      });
    }
    
    res.json({
      status: 'success',
      message: '社交平台删除成功'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSocialPlatforms,
  getSocialPlatformById,
  createSocialPlatform,
  updateSocialPlatform,
  deleteSocialPlatform
};
