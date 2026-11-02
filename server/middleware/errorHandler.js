import { env } from '../config/env.js'

export function errorHandler(err, _req, res, _next) {
  const status = err.status || err.statusCode || (err.type === 'entity.parse.failed' ? 400 : 500)
  const code =
    err.type === 'entity.parse.failed'
      ? 'INVALID_JSON'
      : err.type === 'entity.too.large' || status === 413
        ? 'PAYLOAD_TOO_LARGE'
        : err.code || (status >= 500
          ? 'INTERNAL_SERVER_ERROR'
          : 'REQUEST_ERROR')
  const message =
    status >= 500 && !err.code
      ? 'An unexpected server error occurred.'
      : err.message || 'Request failed.'

  if (status >= 500) console.error(err)

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(err.details ? { details: err.details } : {}),
      ...(env.nodeEnv === 'development' && status >= 500 ? { stack: err.stack } : {}),
    },
  })
}
