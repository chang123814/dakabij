const express = require('express')
const { getAchievementRate, getEfficiency, getTrend, getMaterialStatistics, getCompare } = require('../../controllers/statisticsController')

const router = express.Router()

router.get('/achievement-rate', getAchievementRate)
router.get('/efficiency', getEfficiency)
router.get('/trend', getTrend)
router.get('/materials', getMaterialStatistics)
router.get('/compare', getCompare)

module.exports = router





