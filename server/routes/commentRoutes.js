import { Router } from 'express'
import * as commentController from '../controllers/commentController.js'
import { requireAuth } from '../middleware/authorization.js'
import { validateBody, validators } from '../middleware/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.post('/:commentId/replies', validateBody(validators.comment), requireAuth, asyncHandler(commentController.createReply))
router.put('/:commentId', validateBody(validators.comment), requireAuth, asyncHandler(commentController.updateComment))
router.post('/:commentId/vote', validateBody(validators.vote), requireAuth, asyncHandler(commentController.voteComment))
router.delete('/:commentId', requireAuth, asyncHandler(commentController.deleteComment))

export default router
