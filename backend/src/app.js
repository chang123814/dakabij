const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const path = require('path')

const apiRoutes = require('./routes')

const notFound = require('./middlewares/notFound')
const errorHandler = require('./middlewares/errorHandler')

function createApp () {
  const app = express()

  // 信任反向代理（如 Nginx），这样 req.protocol 才能正确反映 https，用于生成图片等完整 URL
  app.set('trust proxy', true)

  app.use(helmet())

  app.use(cors())
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(morgan('dev'))
  // 静态图片资源开启长缓存，减少重复加载时间
  app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    maxAge: '30d',
    immutable: true
  }))


  app.get('/health', (req, res) => {

    res.json({ status: 'ok', timestamp: Date.now() })
  })

  app.use('/api', apiRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}

module.exports = createApp
