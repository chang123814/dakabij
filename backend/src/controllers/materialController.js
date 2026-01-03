const { Op } = require('sequelize')
const { Material } = require('../models')
const asyncHandler = require('../utils/asyncHandler')
const { resolveOpenId, parseInteger, parseTinyInt, normalizeTags } = require('../utils/requestHelpers')

const normalizeQueryParam = (value) => {
  if (value === undefined || value === null) return undefined
  if (value === '' || value === 'undefined' || value === 'null') return undefined
  return value
}

const buildMaterialFilters = (req, openid) => {
  const where = { userId: openid }

  const categoryRaw = normalizeQueryParam(req.query.category_id ?? req.query.categoryId)
  if (categoryRaw !== undefined) {
    where.categoryId = parseInteger(categoryRaw, null)
  }

  const materialTypeRaw = normalizeQueryParam(req.query.material_type ?? req.query.materialType)
  if (materialTypeRaw !== undefined) {
    where.materialType = materialTypeRaw
  }



  const favorite = parseTinyInt(req.query.is_favorite)
  if (favorite !== undefined) {
    where.isFavorite = favorite
  }

  const status = parseTinyInt(req.query.status)
  if (status !== undefined) {
    where.status = status
  }

  const andConditions = []

  if (req.query.tags) {
    const tags = normalizeTags(req.query.tags)
    if (tags) {
      const tagList = tags.split(',')
      tagList.forEach(tag => {
        andConditions.push({
          tags: { [Op.like]: `%${tag}%` }
        })
      })
    }
  }

  const keywordRaw = normalizeQueryParam(req.query.keyword)
  if (keywordRaw) {
    const keyword = keywordRaw.trim()
    if (keyword) {
      andConditions.push({
        [Op.or]: [
          { title: { [Op.like]: `%${keyword}%` } },
          { content: { [Op.like]: `%${keyword}%` } }
        ]
      })
    }
  }


  if (andConditions.length) {
    where[Op.and] = andConditions
  }

  return where
}

const listMaterials = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const page = Math.max(parseInteger(req.query.page, 1), 1)
  const pageSize = Math.min(Math.max(parseInteger(req.query.page_size, 20), 1), 100)

  const where = buildMaterialFilters(req, openid)

  console.log('[materials] list query', { query: req.query, where })

  const { rows, count } = await Material.findAndCountAll({
    where,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    order: [['createdAt', 'DESC']]
  })

  res.json({
    status: 'success',
    data: {
      list: rows,
      total: count,
      page,
      page_size: pageSize
    }
  })
})

const getMaterialDetail = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const id = parseInteger(req.params.id, null)
  if (!id) {
    const error = new Error('id is required')
    error.status = 400
    throw error
  }

  const material = await Material.findOne({
    where: {
      id,
      userId: openid
    }
  })

  if (!material) {
    return res.status(404).json({ status: 'error', message: '素材不存在' })
  }

  res.json({ status: 'success', data: material })
})


const createMaterial = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const { title } = req.body
  if (!title) {
    const error = new Error('title is required')
    error.status = 400
    throw error
  }

  const categoryInput = req.body.category_id ?? req.body.categoryId
  const material = await Material.create({
    userId: openid,
    categoryId: categoryInput !== undefined ? parseInteger(categoryInput, null) : null,
    title,
    content: req.body.content,
    materialType: req.body.material_type ?? req.body.materialType ?? 'inspiration',
    source: req.body.source,
    imageUrl: req.body.image_url ?? req.body.imageUrl,
    tags: normalizeTags(req.body.tags),
    isFavorite: parseTinyInt(req.body.is_favorite ?? req.body.isFavorite) ?? 0
  })


  res.status(201).json({
    status: 'success',
    message: '素材创建成功',
    data: { id: material.id }
  })
})

const updateMaterial = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const material = await Material.findOne({
    where: {
      id: req.params.id,
      userId: openid
    }
  })

  if (!material) {
    return res.status(404).json({ status: 'error', message: '素材不存在' })
  }

  const payload = {}
  if (req.body.category_id !== undefined || req.body.categoryId !== undefined) {
    payload.categoryId = parseInteger(req.body.category_id ?? req.body.categoryId, null)
  }

  if (req.body.title !== undefined) payload.title = req.body.title
  if (req.body.content !== undefined) payload.content = req.body.content
  if (req.body.material_type !== undefined || req.body.materialType !== undefined) {
    payload.materialType = req.body.material_type ?? req.body.materialType
  }
  if (req.body.source !== undefined) payload.source = req.body.source
  if (req.body.image_url !== undefined || req.body.imageUrl !== undefined) {
    payload.imageUrl = req.body.image_url ?? req.body.imageUrl
  }
  if (req.body.tags !== undefined) {
    payload.tags = normalizeTags(req.body.tags)
  }
  if (req.body.is_favorite !== undefined || req.body.isFavorite !== undefined) {
    const favorite = parseTinyInt(req.body.is_favorite ?? req.body.isFavorite)
    if (favorite !== undefined) payload.isFavorite = favorite
  }
  if (req.body.status !== undefined) {
    const status = parseTinyInt(req.body.status)
    if (status !== undefined) payload.status = status
  }

  await material.update(payload)

  res.json({ status: 'success', message: '素材更新成功' })
})

const deleteMaterial = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const deleted = await Material.destroy({
    where: {
      id: req.params.id,
      userId: openid
    }
  })

  if (!deleted) {
    return res.status(404).json({ status: 'error', message: '素材不存在' })
  }

  res.json({ status: 'success', message: '素材删除成功' })
})

const toggleFavorite = asyncHandler(async (req, res) => {
  const openid = resolveOpenId(req)
  const material = await Material.findOne({
    where: {
      id: req.params.id,
      userId: openid
    }
  })

  if (!material) {
    return res.status(404).json({ status: 'error', message: '素材不存在' })
  }

  const favoriteValue = parseTinyInt(req.body.is_favorite ?? req.body.isFavorite)
  if (favoriteValue === undefined) {
    const error = new Error('is_favorite is required')
    error.status = 400
    throw error
  }

  await material.update({ isFavorite: favoriteValue })

  res.json({
    status: 'success',
    message: favoriteValue ? '收藏成功' : '取消收藏成功'
  })
})

module.exports = {
  listMaterials,
  getMaterialDetail,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  toggleFavorite
}

