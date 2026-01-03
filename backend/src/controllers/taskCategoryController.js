const { TaskCategory } = require('../models')
const asyncHandler = require('../utils/asyncHandler')
const { resolveOpenId, parseInteger, parseTinyInt } = require('../utils/requestHelpers')

const listTaskCategories = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const where = { userId: openid }

  const status = parseTinyInt(req.query.status)
  if (status !== undefined) {
    where.status = status
  }

  const categories = await TaskCategory.findAll({
    where,
    order: [
      ['sortOrder', 'ASC'],
      ['createdAt', 'DESC']
    ]
  })

  res.json({ status: 'success', data: categories })
})

const createTaskCategory = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const { name, icon, color } = req.body
  if (!name) {
    const error = new Error('name is required')
    error.status = 400
    throw error
  }

  const sortOrder = parseInteger(req.body.sort_order ?? req.body.sortOrder, 0)

  const category = await TaskCategory.create({
    userId: openid,
    name,
    icon,
    color,
    sortOrder
  })

  res.status(201).json({
    status: 'success',
    message: '任务分类创建成功',
    data: { id: category.id }
  })
})

const updateTaskCategory = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const category = await TaskCategory.findOne({
    where: {
      id: req.params.id,
      userId: openid
    }
  })

  if (!category) {
    return res.status(404).json({ status: 'error', message: '任务分类不存在' })
  }

  const payload = {}
  if (req.body.name !== undefined) payload.name = req.body.name
  if (req.body.icon !== undefined) payload.icon = req.body.icon
  if (req.body.color !== undefined) payload.color = req.body.color
  if (req.body.sort_order !== undefined || req.body.sortOrder !== undefined) {
    payload.sortOrder = parseInteger(req.body.sort_order ?? req.body.sortOrder, category.sortOrder)
  }
  if (req.body.status !== undefined) {
    const status = parseTinyInt(req.body.status)
    if (status !== undefined) payload.status = status
  }

  await category.update(payload)

  res.json({ status: 'success', message: '任务分类更新成功' })
})

const deleteTaskCategory = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const deleted = await TaskCategory.destroy({
    where: {
      id: req.params.id,
      userId: openid
    }
  })

  if (!deleted) {
    return res.status(404).json({ status: 'error', message: '任务分类不存在' })
  }

  res.json({ status: 'success', message: '任务分类删除成功' })
})

module.exports = {
  listTaskCategories,
  createTaskCategory,
  updateTaskCategory,
  deleteTaskCategory
}
