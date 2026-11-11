import axios from 'axios'
import { API_BASE_URL } from '../utils/constants.js'

export const SESSION_STORAGE_KEY = 'threadly-session-v1'

let memoryAccessToken = ''

export function setApiAccessToken(token) {
  memoryAccessToken = token || ''
}

function getApiAccessToken() {
  try {
    const stored = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || 'null')
    return stored?.accessToken || memoryAccessToken
  } catch {
    return memoryAccessToken
  }
}

export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = getApiAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getApiAccessToken()) {
      setApiAccessToken('')
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY)
      } catch {
        // The in-memory token is still cleared when browser storage is unavailable.
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('threadly:session-expired'))
      }
    }
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Request failed'
    return Promise.reject(new ApiError(message, {
      status: error.response?.status,
      code: error.response?.data?.error?.code,
      details: error.response?.data?.error?.details,
    }))
  },
)

export function unwrapResponse(response) {
  return response.data?.data ?? response.data
}

export default api
