import { httpError } from '../utils/httpError.js'
import { verifyToken } from '../services/authService.js'

export function optionalAuth(req, _res, next) {
  const authorization = req.get('authorization') || ''
  if (!authorization) return next()
  const match = /^Bearer\s+([^\s]+)$/i.exec(authorization)
  if (!match) return next(httpError(401, 'INVALID_TOKEN', 'The session token is invalid.'))
  try {
    req.auth = verifyToken(match[1])
    return next()
  } catch (error) {
    return next(error)
  }
}

export function requireAuth(req, _res, next) {
  const authorization = req.get('authorization') || ''
  const match = /^Bearer\s+([^\s]+)$/i.exec(authorization)
  if (!match) return next(httpError(401, 'AUTH_REQUIRED', 'Sign in to perform this action.'))
  try {
    req.auth = verifyToken(match[1])
    return next()
  } catch (error) {
    return next(error)
  }
}
