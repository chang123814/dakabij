const express = require('express')
const {
  listTags,
  createTag,
  updateTag,
  deleteTag
} = require('../../controllers/tagController')

const router = express.Router()

router.get('/', listTags)
router.post('/', createTag)
router.put('/:id', updateTag)
router.delete('/:id', deleteTag)

module.exports = router
