import * as postService from '../services/postService.js'
import { sendData } from '../utils/response.js'

export function listComments(req, res) {
  return sendData(res, postService.getPostComments(req.params.postId))
}

export function createComment(req, res) {
  return sendData(
    res,
    postService.createComment(req.params.postId, req.body.body, req.auth.userId),
    201,
  )
}

export function createReply(req, res) {
  const parent = postService.findComment(req.params.commentId)
  return sendData(
    res,
    postService.createComment(parent.postId, req.body.body, req.auth.userId, parent.id),
    201,
  )
}

export function deleteComment(req, res) {
  postService.deleteComment(req.params.commentId, req.auth.userId)
  return res.status(204).end()
}
