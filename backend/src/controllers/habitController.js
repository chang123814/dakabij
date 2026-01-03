const { Op } = require('sequelize')
const { Habit, CheckInRecord } = require('../models')
const asyncHandler = require('../utils/asyncHandler')
const { resolveOpenId, parseInteger, parseTinyInt, normalizeTags } = require('../utils/requestHelpers')

// 构建习惯查询条件
const buildHabitFilters = (req, openid) => {
  const where = { userId: openid }

  // 分类筛选
  const categoryIdRaw = req.query.category_id ?? req.query.categoryId
  if (categoryIdRaw !== undefined && categoryIdRaw !== '') {
    where.categoryId = parseInteger(categoryIdRaw, null)
  }

  // 时间段筛选
  if (req.query.time_slot || req.query.timeSlot) {
    where.timeSlot = req.query.time_slot || req.query.timeSlot
  }

  // 标签筛选（简单包含匹配）
  if (req.query.tags) {
    const tags = normalizeTags(req.query.tags)
    if (tags) {
      const tagList = tags.split(',')
      where[Op.and] = (where[Op.and] || []).concat(tagList.map(tag => ({
        tags: { [Op.like]: `%${tag}%` }
      })))
    }
  }

  // 关键词：名称或描述模糊匹配
  if (req.query.keyword) {
    const keyword = String(req.query.keyword).trim()
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ]
    }
  }

  return where
}

// GET /api/habits
const listHabits = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const where = buildHabitFilters(req, openid)

  const habits = await Habit.findAll({
    where,
    order: [['createdAt', 'DESC']]
  })

  res.json({
    status: 'success',
    data: habits
  })
})

// GET /api/habits/:id
const getHabitDetail = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const id = parseInteger(req.params.id, null)
  if (!id) {
    const error = new Error('id is required')
    error.status = 400
    throw error
  }

  const habit = await Habit.findOne({
    where: {
      id,
      userId: openid
    }
  })

  if (!habit) {
    return res.status(404).json({ status: 'error', message: '习惯不存在' })
  }

  res.json({ status: 'success', data: habit })
})

// POST /api/habits
const createHabit = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const name = (req.body.name || '').trim()
  if (!name) {
    const error = new Error('name is required')
    error.status = 400
    throw error
  }

  const habit = await Habit.create({
    userId: openid,
    categoryId: req.body.category_id ?? req.body.categoryId ?? null,
    name,
    description: req.body.description,
    targetValue: req.body.target_value ?? req.body.targetValue ?? null,
    timeSlot: req.body.time_slot ?? req.body.timeSlot ?? null,
    tags: normalizeTags(req.body.tags),
    priority: req.body.priority !== undefined ? parseInteger(req.body.priority, 2) : 2
  })

  res.status(201).json({
    status: 'success',
    message: '习惯创建成功',
    data: { id: habit.id }
  })
})

// PUT /api/habits/:id
const updateHabit = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const id = parseInteger(req.params.id, null)
  if (!id) {
    const error = new Error('id is required')
    error.status = 400
    throw error
  }

  const habit = await Habit.findOne({ where: { id, userId: openid } })
  if (!habit) {
    return res.status(404).json({ status: 'error', message: '习惯不存在' })
  }

  const payload = {}

  if (req.body.name !== undefined) payload.name = req.body.name
  if (req.body.description !== undefined) payload.description = req.body.description
  if (req.body.category_id !== undefined || req.body.categoryId !== undefined) {
    payload.categoryId = req.body.category_id ?? req.body.categoryId
  }
  if (req.body.target_value !== undefined || req.body.targetValue !== undefined) {
    payload.targetValue = req.body.target_value ?? req.body.targetValue
  }
  if (req.body.time_slot !== undefined || req.body.timeSlot !== undefined) {
    payload.timeSlot = req.body.time_slot ?? req.body.timeSlot
  }
  if (req.body.tags !== undefined) {
    payload.tags = normalizeTags(req.body.tags)
  }
  if (req.body.priority !== undefined) {
    payload.priority = parseInteger(req.body.priority, habit.priority || 2)
  }
  if (req.body.status !== undefined) {
    payload.status = parseTinyInt(req.body.status)
  }

  await habit.update(payload)

  res.json({ status: 'success', message: '习惯更新成功' })
})

// DELETE /api/habits/:id
const deleteHabit = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const id = parseInteger(req.params.id, null)
  if (!id) {
    const error = new Error('id is required')
    error.status = 400
    throw error
  }

  const deleted = await Habit.destroy({
    where: {
      id,
      userId: openid
    }
  })

  if (!deleted) {
    return res.status(404).json({ status: 'error', message: '习惯不存在' })
  }

  res.json({ status: 'success', message: '习惯删除成功' })
})

// POST /api/habits/:id/check-in
const createCheckIn = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const id = parseInteger(req.params.id, null)
  if (!id) {
    const error = new Error('id is required')
    error.status = 400
    throw error
  }

  const habit = await Habit.findOne({ where: { id, userId: openid } })
  if (!habit) {
    return res.status(404).json({ status: 'error', message: '习惯不存在' })
  }

  const completed = parseTinyInt(req.body.completed)
  const record = await CheckInRecord.create({
    userId: openid,
    habitId: id,
    completed: completed !== undefined ? completed : 1,
    satisfactionScore: req.body.satisfaction_score ?? req.body.satisfactionScore ?? null,
    timeSpent: req.body.time_spent ?? req.body.timeSpent ?? null,
    completionNotes: req.body.completion_notes ?? req.body.completionNotes ?? '',
    completionTime: req.body.completion_time ?? req.body.completionTime ?? new Date()
  })

  // 更新习惯的实际值（简单 +1，后续可根据业务调整）
  const currentActual = habit.actualValue || 0
  await habit.update({ actualValue: currentActual + 1 })

  res.status(201).json({
    status: 'success',
    message: '打卡成功',
    data: { id: record.id }
  })
})

module.exports = {
  listHabits,
  getHabitDetail,
  createHabit,
  updateHabit,
  deleteHabit,
  createCheckIn
}
