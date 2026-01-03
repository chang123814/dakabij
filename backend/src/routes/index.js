const express = require('express')
const taskCategoryRoutes = require('./modules/taskCategoryRoutes')
const materialCategoryRoutes = require('./modules/materialCategoryRoutes')
const materialRoutes = require('./modules/materialRoutes')
const habitRoutes = require('./modules/habitRoutes')
const statisticsRoutes = require('./modules/statisticsRoutes')
const tagRoutes = require('./modules/tagRoutes')
const authRoutes = require('./modules/authRoutes')
const noteRoutes = require('./modules/noteRoutes')
const uploadRoutes = require('./modules/uploadRoutes')



const router = express.Router()

router.get('/status', (req, res) => {
  res.json({
    status: 'ready',
    version: '0.1.0',
    timestamp: Date.now()
  })
})

router.use('/auth', authRoutes)
router.use('/task-categories', taskCategoryRoutes)
router.use('/material-categories', materialCategoryRoutes)
router.use('/materials', materialRoutes)
router.use('/habits', habitRoutes)
router.use('/statistics', statisticsRoutes)
router.use('/tags', tagRoutes)
router.use('/notes', noteRoutes)
router.use('/upload', uploadRoutes)



module.exports = router

