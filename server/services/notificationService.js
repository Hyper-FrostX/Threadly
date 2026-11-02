import { notifications } from '../data/sampleData.js'
import { httpError } from '../utils/httpError.js'

export function listNotifications(userId) {
  return notifications
    .filter((notification) => notification.userId === userId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
}

export function markNotificationRead(notificationId, userId, read = true) {
  const notification = notifications.find(
    (item) => item.id === notificationId && item.userId === userId,
  )
  if (!notification) throw httpError(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found.')
  notification.read = read
  return notification
}
