const express = require('express')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const asyncHandler = require('../../utils/asyncHandler')

// 统一将上传目录指向项目 backend/uploads，方便通过 /uploads 静态路径访问
const uploadDir = path.join(__dirname, '../../../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}


const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '')
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, filename)
  }
})

const upload = multer({ storage })

const router = express.Router()

router.post('/image', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    const error = new Error('file is required')
    error.status = 400
    throw error
  }

  const filename = req.file.filename
  const urlPath = `/uploads/${filename}`
  const baseUrl = `${req.protocol}://${req.get('host')}`

  res.json({
    status: 'success',
    data: {
      url: `${baseUrl}${urlPath}`,
      path: urlPath,
      filename
    }
  })
}))

module.exports = router
