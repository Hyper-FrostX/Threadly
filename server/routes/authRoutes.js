import { Router } from 'express'
import * as authController from '../controllers/authController.js'
import { validateBody, validators } from '../middleware/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.post('/register', validateBody(validators.registration), asyncHandler(authController.register))
router.post('/login', validateBody(validators.login), asyncHandler(authController.login))
router.get('/me', asyncHandler(authController.me))

export default router
