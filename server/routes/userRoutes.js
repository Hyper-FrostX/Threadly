import { Router } from 'express'
import * as userController from '../controllers/userController.js'
import { optionalAuth, requireAuth } from '../middleware/authorization.js'
import { validateBody, validators } from '../middleware/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.use(optionalAuth)
router.get('/', asyncHandler(userController.listUsers))
router.put('/profile', validateBody(validators.profile), requireAuth, asyncHandler(userController.updateProfile))
router.get('/:userId/posts', asyncHandler(userController.getUserPosts))
router.get('/:userId/followers', asyncHandler(userController.getFollowers))
router.get('/:userId/following', asyncHandler(userController.getFollowing))
router.post('/:userId/follow', requireAuth, asyncHandler(userController.followUser))
router.delete('/:userId/follow', requireAuth, asyncHandler(userController.unfollowUser))
router.get('/:userId', asyncHandler(userController.getUser))

export default router
