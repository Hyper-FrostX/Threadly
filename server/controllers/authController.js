import { httpError } from '../utils/httpError.js'

export function register(_req, _res) {
  throw httpError(
    501,
    'AUTH_NOT_CONFIGURED',
    'Registration is not available until persistent users, password hashing, and JWT authentication are configured.',
  )
}

export function login(_req, _res) {
  throw httpError(
    501,
    'AUTH_NOT_CONFIGURED',
    'Login is not available until persistent users, password hashing, and JWT authentication are configured.',
  )
}

export function me(_req, _res) {
  throw httpError(
    501,
    'AUTH_NOT_CONFIGURED',
    'Current-user lookup is not available until JWT authentication is configured.',
  )
}
