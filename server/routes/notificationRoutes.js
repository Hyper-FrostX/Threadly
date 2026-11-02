import { Router } from 'express'
import * as notificationController from '../controllers/notificationController.js'
import { requireAuth } from '../middleware/authorization.js'
import { validateBody, validators } from '../middleware/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/', requireAuth, asyncHandler(notificationController.listNotifications))
router.patch('/:notificationId/read', validateBody(validators.notificationRead), requireAuth, asyncHandler(notificationController.markRead))

export default router
