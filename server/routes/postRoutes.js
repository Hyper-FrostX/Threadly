import { Router } from 'express'
import * as commentController from '../controllers/commentController.js'
import * as postController from '../controllers/postController.js'
import { requireAuth } from '../middleware/authorization.js'
import { validateBody, validators } from '../middleware/validate.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/', asyncHandler(postController.listPosts))
router.post('/', validateBody(validators.post), requireAuth, asyncHandler(postController.createPost))
router.get('/:postId/comments', asyncHandler(commentController.listComments))
router.post('/:postId/comments', validateBody(validators.comment), requireAuth, asyncHandler(commentController.createComment))
router.post('/:postId/vote', validateBody(validators.vote), requireAuth, asyncHandler(postController.votePost))
router.post('/:postId/bookmark', requireAuth, asyncHandler(postController.toggleBookmark))
router.get('/:postId', asyncHandler(postController.getPost))
router.put('/:postId', validateBody(validators.postUpdate), requireAuth, asyncHandler(postController.updatePost))
router.delete('/:postId', requireAuth, asyncHandler(postController.deletePost))

export default router
