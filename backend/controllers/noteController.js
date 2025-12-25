// 笔记控制器
const { query } = require('../config/database');

// 获取笔记列表
async function getNotes(req, res, next) {
  try {
    const { openid, category_id, is_public, limit = 50, offset = 0 } = req.query;
    
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
    
    let sql = 'SELECT * FROM notes WHERE user_id = ?';
    const params = [userId];
    
    if (category_id) {
      sql += ' AND category_id = ?';
      params.push(category_id);
    }
    
    if (is_public !== undefined) {
      sql += ' AND is_public = ?';
      params.push(parseInt(is_public));
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const notes = await query(sql, params);
    
    res.json({
      status: 'success',
      data: notes
    });
  } catch (error) {
    next(error);
  }
}

// 创建笔记
async function createNote(req, res, next) {
  try {
    const { openid, title, content, category_id, tags, is_public } = req.body;
    
    if (!openid || !title) {
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
    
    const sql = `INSERT INTO notes 
      (user_id, title, content, category_id, tags, is_public)
      VALUES (?, ?, ?, ?, ?, ?)`;
    
    const result = await query(sql, [
      userId, title, content, category_id, tags, is_public || 0
    ]);
    
    res.json({
      status: 'success',
      message: '笔记创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

// 获取笔记详情
async function getNoteDetail(req, res, next) {
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
    
    // 增加查看次数
    await query('UPDATE notes SET view_count = view_count + 1 WHERE id = ?', [id]);
    
    const sql = 'SELECT * FROM notes WHERE id = ? AND user_id = ?';
    const notes = await query(sql, [id, userId]);
    
    if (notes.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '笔记不存在'
      });
    }
    
    res.json({
      status: 'success',
      data: notes[0]
    });
  } catch (error) {
    next(error);
  }
}

// 更新笔记
async function updateNote(req, res, next) {
  try {
    const { id } = req.params;
    const { openid, title, content, category_id, tags, is_public } = req.body;
    
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
    
    const sql = `UPDATE notes SET
      title = COALESCE(?, title),
      content = COALESCE(?, content),
      category_id = COALESCE(?, category_id),
      tags = COALESCE(?, tags),
      is_public = COALESCE(?, is_public),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?`;
    
    await query(sql, [title, content, category_id, tags, is_public, id, userId]);
    
    res.json({
      status: 'success',
      message: '笔记更新成功'
    });
  } catch (error) {
    next(error);
  }
}

// 删除笔记
async function deleteNote(req, res, next) {
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
    
    const sql = 'DELETE FROM notes WHERE id = ? AND user_id = ?';
    await query(sql, [id, userId]);
    
    res.json({
      status: 'success',
      message: '笔记删除成功'
    });
  } catch (error) {
    next(error);
  }
}

// 获取笔记分类
async function getNoteCategories(req, res, next) {
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
    
    // 获取用户自定义分类
    const userSql2 = 'SELECT * FROM note_categories WHERE user_id = ? ORDER BY sort_order ASC';
    const userCategories = await query(userSql2, [userId]);
    
    // 获取默认分类
    const defaultSql = 'SELECT * FROM note_categories WHERE user_id = 0 ORDER BY sort_order ASC';
    const defaultCategories = await query(defaultSql);
    
    res.json({
      status: 'success',
      data: [...userCategories, ...defaultCategories]
    });
  } catch (error) {
    next(error);
  }
}

// 创建笔记分类
async function createNoteCategory(req, res, next) {
  try {
    const { openid, name, icon, color, sort_order } = req.body;
    
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
    
    const sql = `INSERT INTO note_categories 
      (user_id, name, icon, color, sort_order)
      VALUES (?, ?, ?, ?, ?)`;
    
    const result = await query(sql, [userId, name, icon, color, sort_order || 0]);
    
    res.json({
      status: 'success',
      message: '笔记分类创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

// 删除笔记分类
async function deleteNoteCategory(req, res, next) {
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
    
    const sql = 'DELETE FROM note_categories WHERE id = ? AND user_id = ?';
    await query(sql, [id, userId]);
    
    res.json({
      status: 'success',
      message: '笔记分类删除成功'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNotes,
  createNote,
  getNoteDetail,
  updateNote,
  deleteNote,
  getNoteCategories,
  createNoteCategory,
  deleteNoteCategory
};
