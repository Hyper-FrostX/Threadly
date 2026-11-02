import { httpError } from '../utils/httpError.js'

export function requireAuth(req, _res, next) {
  if (req.auth?.userId) return next()
  return next(httpError(
    501,
    'AUTH_NOT_CONFIGURED',
    'Authentication is not configured yet. Protected operations are unavailable.',
  ))
}
