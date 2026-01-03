const express = require('express')
const {
  listNotes,
  getNoteDetail,
  createNote,
  updateNote,
  deleteNote
} = require('../../controllers/noteController')

const router = express.Router()

router.get('/', listNotes)
router.get('/:id', getNoteDetail)
router.post('/', createNote)
router.put('/:id', updateNote)
router.delete('/:id', deleteNote)

module.exports = router
