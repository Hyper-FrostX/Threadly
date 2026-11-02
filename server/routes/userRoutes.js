import { Router } from 'express'
import * as userController from '../controllers/userController.js'
import { requireAuth } from '../middleware/authorization.js'
import { validateBody, validators } from '../middleware/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/', asyncHandler(userController.listUsers))
router.put('/profile', validateBody(validators.profile), requireAuth, asyncHandler(userController.updateProfile))
router.get('/:userId/posts', asyncHandler(userController.getUserPosts))
router.post('/:userId/follow', requireAuth, asyncHandler(userController.followUser))
router.delete('/:userId/follow', requireAuth, asyncHandler(userController.unfollowUser))
router.get('/:userId', asyncHandler(userController.getUser))

export default router
