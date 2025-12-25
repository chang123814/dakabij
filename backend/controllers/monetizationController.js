const { query } = require('../config/database');

async function getUserIdByOpenid(openid) {
  const result = await query('SELECT id FROM users WHERE openid = ?', [openid]);
  return result.length > 0 ? result[0].id : null;
}

async function getMonetizationPlans(req, res, next) {
  try {
    const { openid, plan_type, status, page = 1, page_size = 20 } = req.query;
    
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
    
    let sql = 'SELECT * FROM monetization_plans WHERE user_id = ?';
    const params = [userId];
    
    if (plan_type) {
      sql += ' AND plan_type = ?';
      params.push(plan_type);
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

async function getMonetizationPlanById(req, res, next) {
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
    
    const result = await query('SELECT * FROM monetization_plans WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '变现方案不存在'
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

async function createMonetizationPlan(req, res, next) {
  try {
    const { openid, plan_type, plan_name, description, target_amount, current_amount, start_date, end_date, status } = req.body;
    
    if (!openid || !plan_type || !plan_name) {
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
    
    const sql = `INSERT INTO monetization_plans 
      (user_id, plan_type, plan_name, description, target_amount, current_amount, start_date, end_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const result = await query(sql, [
      userId, plan_type, plan_name, description, target_amount || 0, current_amount || 0, start_date || null, end_date || null, status !== undefined ? status : 0
    ]);
    
    res.json({
      status: 'success',
      message: '变现方案创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

async function updateMonetizationPlan(req, res, next) {
  try {
    const { id } = req.params;
    const { openid, plan_type, plan_name, description, target_amount, current_amount, start_date, end_date, status } = req.body;
    
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
    
    const existingPlan = await query('SELECT * FROM monetization_plans WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (existingPlan.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '变现方案不存在'
      });
    }
    
    const sql = `UPDATE monetization_plans SET 
      plan_type = ?, 
      plan_name = ?, 
      description = ?, 
      target_amount = ?, 
      current_amount = ?, 
      start_date = ?, 
      end_date = ?, 
      status = ?,
      updated_at = NOW()
      WHERE id = ? AND user_id = ?`;
    
    await query(sql, [
      plan_type || existingPlan[0].plan_type,
      plan_name || existingPlan[0].plan_name,
      description !== undefined ? description : existingPlan[0].description,
      target_amount !== undefined ? target_amount : existingPlan[0].target_amount,
      current_amount !== undefined ? current_amount : existingPlan[0].current_amount,
      start_date !== undefined ? start_date : existingPlan[0].start_date,
      end_date !== undefined ? end_date : existingPlan[0].end_date,
      status !== undefined ? status : existingPlan[0].status,
      id, userId
    ]);
    
    res.json({
      status: 'success',
      message: '变现方案更新成功'
    });
  } catch (error) {
    next(error);
  }
}

async function deleteMonetizationPlan(req, res, next) {
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
    
    const result = await query('DELETE FROM monetization_plans WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: '变现方案不存在'
      });
    }
    
    res.json({
      status: 'success',
      message: '变现方案删除成功'
    });
  } catch (error) {
    next(error);
  }
}

async function addMonetizationRecord(req, res, next) {
  try {
    const { openid, plan_id, record_type, amount, description, record_date } = req.body;
    
    if (!openid || !plan_id || !record_type || !amount) {
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
    
    const sql = `INSERT INTO monetization_records 
      (user_id, plan_id, record_type, amount, description, record_date)
      VALUES (?, ?, ?, ?, ?, ?)`;
    
    const result = await query(sql, [
      userId, plan_id, record_type, amount, description, record_date || null
    ]);
    
    const plan = await query('SELECT current_amount FROM monetization_plans WHERE id = ? AND user_id = ?', [plan_id, userId]);
    if (plan.length > 0) {
      const newAmount = plan[0].current_amount + (record_type === 'income' ? amount : -amount);
      await query('UPDATE monetization_plans SET current_amount = ? WHERE id = ?', [newAmount, plan_id]);
    }
    
    res.json({
      status: 'success',
      message: '变现记录添加成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

async function getMonetizationRecords(req, res, next) {
  try {
    const { openid, plan_id, record_type, start_date, end_date, page = 1, page_size = 20 } = req.query;
    
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
    
    let sql = 'SELECT mr.*, mp.plan_name FROM monetization_records mr LEFT JOIN monetization_plans mp ON mr.plan_id = mp.id WHERE mr.user_id = ?';
    const params = [userId];
    
    if (plan_id) {
      sql += ' AND mr.plan_id = ?';
      params.push(parseInt(plan_id));
    }
    
    if (record_type) {
      sql += ' AND mr.record_type = ?';
      params.push(record_type);
    }
    
    if (start_date) {
      sql += ' AND mr.record_date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      sql += ' AND mr.record_date <= ?';
      params.push(end_date);
    }
    
    const countSql = sql.replace('SELECT mr.*, mp.plan_name', 'SELECT COUNT(*) as total');
    const countResult = await query(countSql, params);
    const total = countResult[0].total;
    
    const offset = (parseInt(page) - 1) * parseInt(page_size);
    sql += ' ORDER BY mr.record_date DESC, mr.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(page_size), offset);
    
    const records = await query(sql, params);
    
    res.json({
      status: 'success',
      data: records,
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
  getMonetizationPlans,
  getMonetizationPlanById,
  createMonetizationPlan,
  updateMonetizationPlan,
  deleteMonetizationPlan,
  addMonetizationRecord,
  getMonetizationRecords
};
