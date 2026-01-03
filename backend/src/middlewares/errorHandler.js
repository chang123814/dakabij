function errorHandler (err, req, res, next) { // eslint-disable-line
  const status = err.status || 500
  const payload = {
    message: err.message || 'Internal Server Error'
  }

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack
  }

  res.status(status).json(payload)
}

module.exports = errorHandler
