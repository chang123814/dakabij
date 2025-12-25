// 错误处理中间件

function errorHandler(err, req, res, next) {
  console.error('错误详情:', err);
  
  // 数据库错误
  if (err.code && err.code.startsWith('ER_')) {
    return res.status(500).json({
      status: 'error',
      message: '数据库操作失败',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  
  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: '无效的令牌'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: '令牌已过期'
    });
  }
  
  // 验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: '数据验证失败',
      errors: err.errors
    });
  }
  
  // 默认错误处理
  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';
  
  res.status(statusCode).json({
    status: 'error',
    message: message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = errorHandler;
