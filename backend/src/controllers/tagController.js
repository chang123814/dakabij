const { Tag } = require('../models')
const asyncHandler = require('../utils/asyncHandler')
const { resolveOpenId, parseInteger, parseTinyInt } = require('../utils/requestHelpers')

// GET /api/tags
const listTags = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)

  const where = { userId: openid }

  const tagType = req.query.tag_type ?? req.query.tagType
  if (tagType) {
    where.tagType = tagType
  }

  const status = parseTinyInt(req.query.status)
  if (status !== undefined) {
    where.status = status
  }

  const tags = await Tag.findAll({
    where,
    order: [
      ['usageCount', 'DESC'],
      ['createdAt', 'DESC']
    ]
  })

  res.json({ status: 'success', data: tags })
})

// POST /api/tags
const createTag = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const name = (req.body.name || '').trim()
  if (!name) {
    const error = new Error('name is required')
    error.status = 400
    throw error
  }

  const tag = await Tag.create({
    userId: openid,
    name,
    color: req.body.color,
    tagType: req.body.tag_type ?? req.body.tagType ?? 'material'
  })

  res.status(201).json({
    status: 'success',
    message: '标签创建成功',
    data: { id: tag.id }
  })
})

// PUT /api/tags/:id
const updateTag = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const id = parseInteger(req.params.id, null)
  if (!id) {
    const error = new Error('id is required')
    error.status = 400
    throw error
  }

  const tag = await Tag.findOne({ where: { id, userId: openid } })
  if (!tag) {
    return res.status(404).json({ status: 'error', message: '标签不存在' })
  }

  const payload = {}
  if (req.body.name !== undefined) payload.name = req.body.name.trim()
  if (req.body.color !== undefined) payload.color = req.body.color
  if (req.body.tag_type !== undefined || req.body.tagType !== undefined) {
    payload.tagType = req.body.tag_type ?? req.body.tagType
  }
  if (req.body.status !== undefined) {
    const statusValue = parseTinyInt(req.body.status)
    if (statusValue !== undefined) payload.status = statusValue
  }

  await tag.update(payload)

  res.json({ status: 'success', message: '标签更新成功' })
})

// DELETE /api/tags/:id
const deleteTag = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const id = parseInteger(req.params.id, null)
  if (!id) {
    const error = new Error('id is required')
    error.status = 400
    throw error
  }

  const deleted = await Tag.destroy({ where: { id, userId: openid } })
  if (!deleted) {
    return res.status(404).json({ status: 'error', message: '标签不存在' })
  }

  res.json({ status: 'success', message: '标签删除成功' })
})

module.exports = {
  listTags,
  createTag,
  updateTag,
  deleteTag
}
