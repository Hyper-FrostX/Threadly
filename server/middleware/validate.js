import { httpError } from '../utils/httpError.js'

export function validateBody(validator) {
  return (req, _res, next) => {
    const errors = validator(req.body ?? {})
    if (errors.length) {
      return next(
        httpError(400, 'VALIDATION_ERROR', 'Request validation failed.', errors),
      )
    }
    return next()
  }
}

export const validators = {
  registration(body) {
    const errors = []
    if (typeof body.username !== 'string' || !/^[a-zA-Z0-9_]{3,32}$/.test(body.username.trim())) {
      errors.push({ field: 'username', message: 'Use 3–32 letters, numbers, or underscores.' })
    }
    if (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      errors.push({ field: 'email', message: 'Must be a valid email address.' })
    }
    if (typeof body.displayName !== 'string' || body.displayName.trim().length < 1 || body.displayName.trim().length > 80) {
      errors.push({ field: 'displayName', message: 'Must be between 1 and 80 characters.' })
    }
    if (typeof body.password !== 'string' || body.password.length < 8 || body.password.length > 72) {
      errors.push({ field: 'password', message: 'Must be between 8 and 72 characters.' })
    }
    if (typeof body.confirmPassword !== 'string' || body.confirmPassword !== body.password) {
      errors.push({ field: 'confirmPassword', message: 'Passwords do not match.' })
    }
    return errors
  },
  login(body) {
    const errors = []
    if (typeof (body.identity || body.email || body.username) !== 'string' || !(body.identity || body.email || body.username).trim()) {
      errors.push({ field: 'identity', message: 'Email or username is required.' })
    }
    if (typeof body.password !== 'string' || !body.password) {
      errors.push({ field: 'password', message: 'Password is required.' })
    }
    if (typeof body.password === 'string' && body.password.length > 72) {
      errors.push({ field: 'password', message: 'Password is invalid.' })
    }
    return errors
  },
  profile(body) {
    const errors = []
    if (!['displayName', 'bio', 'location'].some((field) => body[field] !== undefined)) {
      errors.push({ field: 'body', message: 'Provide at least one profile field to update.' })
    }
    for (const field of ['displayName', 'bio', 'location']) {
      if (body[field] !== undefined && typeof body[field] !== 'string') {
        errors.push({ field, message: 'Must be a string.' })
      }
    }
    if (body.displayName !== undefined && (body.displayName.trim().length < 1 || body.displayName.trim().length > 80)) {
      errors.push({ field: 'displayName', message: 'Must be between 1 and 80 characters.' })
    }
    if (body.bio !== undefined && body.bio.trim().length > 280) {
      errors.push({ field: 'bio', message: 'Must be 280 characters or fewer.' })
    }
    if (body.location !== undefined && body.location.trim().length > 100) {
      errors.push({ field: 'location', message: 'Must be 100 characters or fewer.' })
    }
    return errors
  },
  community(body) {
    const errors = []
    if (typeof body.name !== 'string' || !/^[a-z0-9_]{3,32}$/.test(body.name)) {
      errors.push({ field: 'name', message: 'Use 3–32 lowercase letters, numbers, or underscores.' })
    }
    if (typeof body.title !== 'string' || body.title.trim().length < 3 || body.title.trim().length > 80) {
      errors.push({ field: 'title', message: 'Must be between 3 and 80 characters.' })
    }
    if (typeof body.description !== 'string' || body.description.trim().length < 10 || body.description.trim().length > 280) {
      errors.push({ field: 'description', message: 'Must be between 10 and 280 characters.' })
    }
    return errors
  },
  post(body) {
    const errors = []
    if (typeof body.communityId !== 'string' || !body.communityId.trim()) {
      errors.push({ field: 'communityId', message: 'Community ID is required.' })
    }
    if (typeof body.title !== 'string' || body.title.trim().length < 5 || body.title.trim().length > 200) {
      errors.push({ field: 'title', message: 'Must be between 5 and 200 characters.' })
    }
    if (body.body !== undefined && (typeof body.body !== 'string' || body.body.length > 10000)) {
      errors.push({ field: 'body', message: 'Must be a string of 10,000 characters or fewer.' })
    }
    if (body.image !== undefined) errors.push(...validateImage(body.image))
    return errors
  },
  postUpdate(body) {
    const errors = []
    if (!['communityId', 'title', 'body', 'image'].some((field) => body[field] !== undefined)) {
      errors.push({ field: 'body', message: 'Provide at least one post field to update.' })
    }
    if (body.communityId !== undefined && (typeof body.communityId !== 'string' || !body.communityId.trim())) {
      errors.push({ field: 'communityId', message: 'Must be a non-empty string.' })
    }
    if (body.title !== undefined && (typeof body.title !== 'string' || body.title.trim().length < 5 || body.title.trim().length > 200)) {
      errors.push({ field: 'title', message: 'Must be between 5 and 200 characters.' })
    }
    if (body.body !== undefined && (typeof body.body !== 'string' || body.body.length > 10000)) {
      errors.push({ field: 'body', message: 'Must be a string of 10,000 characters or fewer.' })
    }
    if (body.image !== undefined) errors.push(...validateImage(body.image))
    return errors
  },
  vote(body) {
    return [-1, 0, 1].includes(body.value)
      ? []
      : [{ field: 'value', message: 'Must be -1, 0, or 1.' }]
  },
  comment(body) {
    return typeof body.body === 'string' && body.body.trim().length >= 2 && body.body.length <= 5000
      ? []
      : [{ field: 'body', message: 'Must be between 2 and 5,000 characters.' }]
  },
  notificationRead(body) {
    return body.read === undefined || typeof body.read === 'boolean'
      ? []
      : [{ field: 'read', message: 'Must be a boolean.' }]
  },
}

function validateImage(image) {
  if (image === null) return []
  if (typeof image !== 'string') {
    return [{ field: 'image', message: 'Must be an HTTP(S) URL or null.' }]
  }
  try {
    const url = new URL(image)
    if (url.protocol === 'http:' || url.protocol === 'https:') return []
  } catch {
    return [{ field: 'image', message: 'Must be a valid HTTP(S) URL or null.' }]
  }
  return [{ field: 'image', message: 'Must be an HTTP(S) URL or null.' }]
}
