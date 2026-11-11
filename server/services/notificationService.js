import { randomUUID } from 'node:crypto'
import { notificationsRepository } from '../repositories/platformRepository.js'
import { httpError } from '../utils/httpError.js'

export function listNotifications(userId) {
  return notificationsRepository.listForUser(userId)
}

export function createNotification({ userId, type, title, body = '', targetUrl = null }) {
  notificationsRepository.insert({
    id: `notification-${randomUUID()}`,
    userId,
    type,
    title,
    body,
    targetUrl,
    read: false,
    createdAt: new Date().toISOString(),
  })
}

export function markNotificationRead(notificationId, userId, read = true) {
  const notification = notificationsRepository.markRead(notificationId, userId, read)
  if (!notification) throw httpError(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found.')
  return notification
}
