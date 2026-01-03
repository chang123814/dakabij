const express = require('express')
const {
  listHabits,
  getHabitDetail,
  createHabit,
  updateHabit,
  deleteHabit,
  createCheckIn
} = require('../../controllers/habitController')

const router = express.Router()

router.get('/', listHabits)
router.get('/:id', getHabitDetail)
router.post('/', createHabit)
router.put('/:id', updateHabit)
router.delete('/:id', deleteHabit)
router.post('/:id/check-in', createCheckIn)

module.exports = router
