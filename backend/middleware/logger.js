// 日志中间件

function logger(req, res, next) {
  const startTime = Date.now();
  
  // 记录请求信息
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // 监听响应完成事件
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
}

module.exports = logger;
