import * as authService from '../services/authService.js'
import { sendData } from '../utils/response.js'

export function register(req, res) {
  return sendData(res, authService.register(req.body), 201)
}

export function login(req, res) {
  return sendData(res, authService.login(req.body))
}

export function me(req, res) {
  return sendData(res, authService.getCurrentUser(req.auth.userId))
}

export function logout(req, res) {
  authService.logout(req.auth.userId, req.auth.sessionId)
  return res.status(204).end()
}
