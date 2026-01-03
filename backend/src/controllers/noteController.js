const { Op } = require('sequelize')
const { Note } = require('../models')
const asyncHandler = require('../utils/asyncHandler')
const { resolveOpenId, parseInteger, parseTinyInt, normalizeTags } = require('../utils/requestHelpers')

const buildNoteFilters = (req, openid) => {
  const where = { userId: openid }

  const categoryRaw = req.query.category_id ?? req.query.categoryId
  if (categoryRaw !== undefined && categoryRaw !== '') {
    where.categoryId = parseInteger(categoryRaw, null)
  }

  const noteTypeRaw = req.query.note_type ?? req.query.noteType
  if (noteTypeRaw) {
    where.noteType = noteTypeRaw
  }

  const status = parseTinyInt(req.query.status)
  if (status !== undefined) {
    where.status = status
  }

  if (req.query.tags) {
    const tags = normalizeTags(req.query.tags)
    if (tags) {
      const tagList = tags.split(',')
      where[Op.and] = (where[Op.and] || []).concat(tagList.map(tag => ({
        tags: { [Op.like]: `%${tag}%` }
      })))
    }
  }

  if (req.query.keyword) {
    const keyword = String(req.query.keyword).trim()
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { content: { [Op.like]: `%${keyword}%` } }
      ]
    }
  }

  return where
}

// GET /api/notes
const listNotes = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const where = buildNoteFilters(req, openid)

  const notes = await Note.findAll({
    where,
    order: [['createdAt', 'DESC']]
  })

  res.json({
    status: 'success',
    data: notes
  })
})

// GET /api/notes/:id
const getNoteDetail = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const id = parseInteger(req.params.id, null)
  if (!id) {
    const error = new Error('id is required')
    error.status = 400
    throw error
  }

  const note = await Note.findOne({
    where: {
      id,
      userId: openid
    }
  })

  if (!note) {
    return res.status(404).json({ status: 'error', message: '笔记不存在' })
  }

  res.json({ status: 'success', data: note })
})

// POST /api/notes
const createNote = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const title = (req.body.title || '').trim()
  if (!title) {
    const error = new Error('title is required')
    error.status = 400
    throw error
  }

  const categoryInput = req.body.category_id ?? req.body.categoryId

  const note = await Note.create({
    userId: openid,
    title,
    content: req.body.content,
    categoryId: categoryInput !== undefined ? parseInteger(categoryInput, null) : null,
    noteType: req.body.note_type ?? req.body.noteType ?? 'general',
    tags: normalizeTags(req.body.tags)
  })

  res.status(201).json({
    status: 'success',
    message: '笔记创建成功',
    data: { id: note.id }
  })
})

// PUT /api/notes/:id
const updateNote = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const id = parseInteger(req.params.id, null)
  if (!id) {
    const error = new Error('id is required')
    error.status = 400
    throw error
  }

  const note = await Note.findOne({ where: { id, userId: openid } })
  if (!note) {
    return res.status(404).json({ status: 'error', message: '笔记不存在' })
  }

  const payload = {}

  if (req.body.title !== undefined) payload.title = req.body.title
  if (req.body.content !== undefined) payload.content = req.body.content

  if (req.body.category_id !== undefined || req.body.categoryId !== undefined) {
    payload.categoryId = parseInteger(req.body.category_id ?? req.body.categoryId, null)
  }

  if (req.body.note_type !== undefined || req.body.noteType !== undefined) {
    payload.noteType = req.body.note_type ?? req.body.noteType
  }

  if (req.body.tags !== undefined) {
    payload.tags = normalizeTags(req.body.tags)
  }

  if (req.body.status !== undefined) {
    const status = parseTinyInt(req.body.status)
    if (status !== undefined) payload.status = status
  }

  await note.update(payload)

  res.json({ status: 'success', message: '笔记更新成功' })
})

// DELETE /api/notes/:id
const deleteNote = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const id = parseInteger(req.params.id, null)
  if (!id) {
    const error = new Error('id is required')
    error.status = 400
    throw error
  }

  const deleted = await Note.destroy({
    where: {
      id,
      userId: openid
    }
  })

  if (!deleted) {
    return res.status(404).json({ status: 'error', message: '笔记不存在' })
  }

  res.json({ status: 'success', message: '笔记删除成功' })
})

module.exports = {
  listNotes,
  getNoteDetail,
  createNote,
  updateNote,
  deleteNote
}
