import * as postService from '../services/postService.js'
import { parsePostListQuery } from '../utils/pagination.js'
import { sendData } from '../utils/response.js'

export function listPosts(req, res) {
  const result = postService.listPosts({
    ...parsePostListQuery(req.query),
    communityId: req.query.communityId,
    authorId: req.query.authorId,
    userId: req.auth?.userId,
  })
  return sendData(res, result.posts, 200, result.pagination)
}

export function getPost(req, res) {
  return sendData(res, postService.getPost(req.params.postId, req.auth?.userId))
}

export function listSavedPosts(req, res) {
  return sendData(res, postService.listSavedPosts(req.auth.userId))
}

export function createPost(req, res) {
  return sendData(res, postService.createPost(req.body, req.auth.userId), 201)
}

export function updatePost(req, res) {
  return sendData(res, postService.updatePost(req.params.postId, req.body, req.auth.userId))
}

export function deletePost(req, res) {
  postService.deletePost(req.params.postId, req.auth.userId)
  return res.status(204).end()
}

export function votePost(req, res) {
  return sendData(res, postService.votePost(req.params.postId, req.auth.userId, req.body.value))
}

export function toggleBookmark(req, res) {
  return sendData(res, postService.toggleBookmark(req.params.postId, req.auth.userId))
}
