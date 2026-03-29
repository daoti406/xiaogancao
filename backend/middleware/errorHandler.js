/**
 * 全局错误处理中间件
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // 区分开发环境和生产环境
  const isDev = process.env.NODE_ENV !== 'production';

  // JWT相关错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 401,
      data: null,
      message: '无效的认证令牌'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 401,
      data: null,
      message: '登录已过期，请重新登录'
    });
  }

  // Supabase相关错误
  if (err.message?.includes('Supabase')) {
    return res.status(500).json({
      code: 500,
      data: null,
      message: isDev ? err.message : '数据库服务错误'
    });
  }

  // Dify相关错误
  if (err.message?.includes('Dify') || err.message?.includes('dify')) {
    return res.status(502).json({
      code: 502,
      data: null,
      message: isDev ? err.message : 'AI服务暂时不可用'
    });
  }

  // 其他错误
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    code: statusCode,
    data: null,
    message: err.message || '服务器内部错误',
    ...(isDev && { stack: err.stack })
  });
};

/**
 * 404处理中间件
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    code: 404,
    data: null,
    message: '请求的资源不存在'
  });
};

export default errorHandler;
