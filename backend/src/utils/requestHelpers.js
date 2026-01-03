function resolveOpenId (req) {
  const openid = req?.body?.openid || req?.query?.openid

  if (!openid) {
    const error = new Error('openid is required')
    error.status = 400
    throw error
  }

  return openid
}

function parseInteger (value, defaultValue = 0) {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? defaultValue : parsed
}

function parseTinyInt (value) {
  if (value === undefined || value === null || value === '') {
    return undefined
  }
  return Number(value) ? 1 : 0
}

function normalizeTags (tags) {
  if (!tags) return ''
  if (Array.isArray(tags)) {
    return tags.map(tag => tag && String(tag).trim()).filter(Boolean).join(',')
  }
  return String(tags)
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)
    .join(',')
}

module.exports = {
  resolveOpenId,
  parseInteger,
  parseTinyInt,
  normalizeTags
}
