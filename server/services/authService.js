import { randomUUID, createHmac, timingSafeEqual } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { env } from '../config/env.js'
import {
  authSessionsRepository,
  getSigningSecret,
  usersRepository,
} from '../repositories/platformRepository.js'
import { httpError } from '../utils/httpError.js'

const signingSecret = getSigningSecret(env.jwtSecret)

function base64Url(value) {
  return Buffer.from(value).toString('base64url')
}

function sign(payload) {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64Url(JSON.stringify(payload))
  const content = `${header}.${body}`
  const signature = createHmac('sha256', signingSecret).update(content).digest('base64url')
  return `${content}.${signature}`
}

export function verifyToken(token) {
  const parts = token.split('.')
  if (parts.length !== 3) throw httpError(401, 'INVALID_TOKEN', 'The session token is invalid.')
  const [headerPart, bodyPart, signature] = parts
  const content = `${headerPart}.${bodyPart}`
  const expected = createHmac('sha256', signingSecret).update(content).digest()
  let actual
  try {
    actual = Buffer.from(signature, 'base64url')
  } catch {
    throw httpError(401, 'INVALID_TOKEN', 'The session token is invalid.')
  }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw httpError(401, 'INVALID_TOKEN', 'The session token is invalid.')
  }
  try {
    const header = JSON.parse(Buffer.from(headerPart, 'base64url').toString('utf8'))
    const payload = JSON.parse(Buffer.from(bodyPart, 'base64url').toString('utf8'))
    if (header.alg !== 'HS256' || typeof payload.sub !== 'string' || payload.exp <= Date.now() / 1000) {
      throw new Error('Invalid claims')
    }
    if (typeof payload.jti !== 'string' || !authSessionsRepository.isActive(payload.jti, payload.sub)) {
      throw new Error('Inactive session')
    }
    return { userId: payload.sub, role: payload.role, sessionId: payload.jti }
  } catch {
    throw httpError(401, 'INVALID_TOKEN', 'The session token is invalid or expired.')
  }
}

function tokenLifetimeSeconds() {
  const match = /^(\d+)([smhd])$/.exec(env.jwtExpiresIn)
  if (!match) throw new Error('JWT_EXPIRES_IN must be a duration such as 15m, 12h, or 7d.')
  const units = { s: 1, m: 60, h: 3600, d: 86400 }
  return Number(match[1]) * units[match[2]]
}

function safeUser(user) {
  const { passwordHash, ...data } = user
  return data
}

function issueSession(user) {
  const issuedAt = Math.floor(Date.now() / 1000)
  const expiresIn = tokenLifetimeSeconds()
  const sessionId = randomUUID()
  const expiresAt = new Date((issuedAt + expiresIn) * 1000).toISOString()
  authSessionsRepository.create(sessionId, user.id, expiresAt)
  return {
    accessToken: sign({
      sub: user.id,
      role: user.role,
      jti: sessionId,
      iat: issuedAt,
      exp: issuedAt + expiresIn,
    }),
    tokenType: 'Bearer',
    expiresIn,
    user: safeUser(user),
  }
}

export function register({ username, displayName, email, password }) {
  const normalizedUsername = username.trim().toLowerCase()
  const normalizedEmail = email.trim().toLowerCase()
  if (usersRepository.find(normalizedUsername)) {
    throw httpError(409, 'USERNAME_EXISTS', 'That username is already in use.')
  }
  if (usersRepository.findByEmailOrUsername(normalizedEmail)) {
    throw httpError(409, 'EMAIL_EXISTS', 'An account with that email already exists.')
  }
  const user = {
    id: `user-${randomUUID()}`,
    username: normalizedUsername,
    email: normalizedEmail,
    passwordHash: bcrypt.hashSync(password, 12),
    displayName: displayName.trim(),
    bio: '',
    createdAt: new Date().toISOString(),
    role: 'user',
  }
  try {
    return issueSession(usersRepository.insert(user))
  } catch (error) {
    if (error.code === 'ERR_SQLITE_CONSTRAINT_UNIQUE') {
      throw httpError(409, 'ACCOUNT_EXISTS', 'That username or email is already in use.')
    }
    throw error
  }
}

export function login({ identity, email, username, password }) {
  const accountIdentity = (identity || email || username || '').trim()
  const user = usersRepository.findByEmailOrUsername(accountIdentity)
  if (!user?.passwordHash || !bcrypt.compareSync(password, user.passwordHash)) {
    throw httpError(401, 'INVALID_CREDENTIALS', 'The username/email or password is incorrect.')
  }
  return issueSession(user)
}

export function getCurrentUser(userId) {
  const user = usersRepository.find(userId)
  if (!user || !user.passwordHash) throw httpError(401, 'SESSION_INVALID', 'Your session is no longer valid. Please sign in again.')
  return safeUser(user)
}

export function logout(userId, sessionId) {
  authSessionsRepository.revoke(sessionId, userId)
}
