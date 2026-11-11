import { Router } from 'express'
import * as authController from '../controllers/authController.js'
import { requireAuth } from '../middleware/authorization.js'
import { validateBody, validators } from '../middleware/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.post('/register', validateBody(validators.registration), asyncHandler(authController.register))
router.post('/login', validateBody(validators.login), asyncHandler(authController.login))
router.get('/me', requireAuth, asyncHandler(authController.me))
router.post('/logout', requireAuth, asyncHandler(authController.logout))

export default router
