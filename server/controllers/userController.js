import * as userService from '../services/userService.js'
import { listPosts } from '../services/postService.js'
import { parsePostListQuery } from '../utils/pagination.js'
import { sendData } from '../utils/response.js'

export function listUsers(_req, res) {
  return sendData(res, userService.listUsers())
}

export function getUser(req, res) {
  return sendData(res, userService.getUserProfile(req.params.userId))
}

export function updateProfile(req, res) {
  return sendData(res, userService.updateProfile(req.auth.userId, req.body))
}

export function getUserPosts(req, res) {
  const result = listPosts({
    ...parsePostListQuery(req.query),
    authorId: userService.findUser(req.params.userId).id,
  })
  return sendData(res, result.posts, 200, result.pagination)
}

export function followUser(req, res) {
  return sendData(res, userService.followUser(req.auth.userId, req.params.userId))
}

export function unfollowUser(req, res) {
  return sendData(res, userService.unfollowUser(req.auth.userId, req.params.userId))
}
