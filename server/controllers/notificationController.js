import * as notificationService from '../services/notificationService.js'
import { sendData } from '../utils/response.js'

export function listNotifications(req, res) {
  return sendData(res, notificationService.listNotifications(req.auth.userId))
}

export function markRead(req, res) {
  return sendData(
    res,
    notificationService.markNotificationRead(
      req.params.notificationId,
      req.auth.userId,
      req.body.read ?? true,
    ),
  )
}
