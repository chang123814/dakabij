function notFound (req, res, next) {
  res.status(404).json({
    message: 'Resource not found',
    path: req.originalUrl
  })
}

module.exports = notFound
