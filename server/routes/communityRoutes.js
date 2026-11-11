import { Router } from 'express'
import * as communityController from '../controllers/communityController.js'
import { optionalAuth, requireAuth } from '../middleware/authorization.js'
import { validateBody, validators } from '../middleware/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.use(optionalAuth)
router.get('/', asyncHandler(communityController.listCommunities))
router.post('/', validateBody(validators.community), requireAuth, asyncHandler(communityController.createCommunity))
router.post('/:communityId/join', requireAuth, asyncHandler(communityController.joinCommunity))
router.delete('/:communityId/join', requireAuth, asyncHandler(communityController.leaveCommunity))
router.get('/:communityId', asyncHandler(communityController.getCommunity))

export default router
