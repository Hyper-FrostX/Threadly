import axios from 'axios'
import { API_BASE_URL } from '../utils/constants.js'

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
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
