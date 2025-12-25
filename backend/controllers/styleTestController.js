const { query } = require('../config/database');

async function getUserIdByOpenid(openid) {
  const result = await query('SELECT id FROM users WHERE openid = ?', [openid]);
  return result.length > 0 ? result[0].id : null;
}

async function getStyleTests(req, res, next) {
  try {
    const { openid, test_type, status, page = 1, page_size = 20 } = req.query;
    
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
    
    let sql = 'SELECT * FROM style_tests WHERE user_id = ?';
    const params = [userId];
    
    if (test_type) {
      sql += ' AND test_type = ?';
      params.push(test_type);
    }
    
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
    
    const tests = await query(sql, params);
    
    res.json({
      status: 'success',
      data: tests,
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

async function getStyleTestById(req, res, next) {
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
    
    const result = await query('SELECT * FROM style_tests WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '风格测试不存在'
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

async function createStyleTest(req, res, next) {
  try {
    const { openid, test_type, test_content, test_images, tags, test_date, status } = req.body;
    
    if (!openid || !test_type || !test_content) {
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
    
    const sql = `INSERT INTO style_tests 
      (user_id, test_type, test_content, test_images, tags, test_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    const result = await query(sql, [
      userId, test_type, test_content, test_images, tags, test_date || null, status !== undefined ? status : 0
    ]);
    
    res.json({
      status: 'success',
      message: '风格测试创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

async function updateStyleTest(req, res, next) {
  try {
    const { id } = req.params;
    const { openid, test_type, test_content, test_images, tags, test_date, status } = req.body;
    
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
    
    const existingTest = await query('SELECT * FROM style_tests WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (existingTest.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '风格测试不存在'
      });
    }
    
    const sql = `UPDATE style_tests SET 
      test_type = ?, 
      test_content = ?, 
      test_images = ?, 
      tags = ?, 
      test_date = ?, 
      status = ?,
      updated_at = NOW()
      WHERE id = ? AND user_id = ?`;
    
    await query(sql, [
      test_type || existingTest[0].test_type,
      test_content !== undefined ? test_content : existingTest[0].test_content,
      test_images !== undefined ? test_images : existingTest[0].test_images,
      tags !== undefined ? tags : existingTest[0].tags,
      test_date !== undefined ? test_date : existingTest[0].test_date,
      status !== undefined ? status : existingTest[0].status,
      id, userId
    ]);
    
    res.json({
      status: 'success',
      message: '风格测试更新成功'
    });
  } catch (error) {
    next(error);
  }
}

async function deleteStyleTest(req, res, next) {
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
    
    const result = await query('DELETE FROM style_tests WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: '风格测试不存在'
      });
    }
    
    res.json({
      status: 'success',
      message: '风格测试删除成功'
    });
  } catch (error) {
    next(error);
  }
}

async function addTestResult(req, res, next) {
  try {
    const { id } = req.params;
    const { openid, result_data, conclusion, next_action } = req.body;
    
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
    
    const existingTest = await query('SELECT * FROM style_tests WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (existingTest.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '风格测试不存在'
      });
    }
    
    const sql = `UPDATE style_tests SET 
      result_data = ?, 
      conclusion = ?, 
      next_action = ?,
      status = 1,
      updated_at = NOW()
      WHERE id = ? AND user_id = ?`;
    
    await query(sql, [result_data, conclusion, next_action, id, userId]);
    
    res.json({
      status: 'success',
      message: '测试结果添加成功'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStyleTests,
  getStyleTestById,
  createStyleTest,
  updateStyleTest,
  deleteStyleTest,
  addTestResult
};
