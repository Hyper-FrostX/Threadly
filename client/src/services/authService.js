import api, { setApiAccessToken, SESSION_STORAGE_KEY, unwrapResponse } from './api.js'

function persistSession(session) {
  setApiAccessToken(session.accessToken)
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    setApiAccessToken(session.accessToken)
  }
  return session
}

export async function register(payload) {
  const response = await api.post('/auth/register', payload)
  return persistSession(unwrapResponse(response))
}

export async function login(payload) {
  const response = await api.post('/auth/login', payload)
  return persistSession(unwrapResponse(response))
}

export async function getCurrentSession() {
  const response = await api.get('/auth/me')
  return unwrapResponse(response)
}

export async function logout() {
  try {
    await api.post('/auth/logout')
  } finally {
    setApiAccessToken('')
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY)
    } catch {
      // Session state remains cleared in memory if storage is unavailable.
    }
  }
}

export function clearLocalSession() {
  setApiAccessToken('')
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // Session state remains cleared in memory if storage is unavailable.
  }
}

export function readStoredSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || 'null')
  } catch {
    return null
  }
}
