import * as userService from '../services/userService.js'
import { listPosts } from '../services/postService.js'
import { parsePostListQuery } from '../utils/pagination.js'
import { sendData } from '../utils/response.js'

export function listUsers(req, res) {
  return sendData(res, userService.listUsers(req.auth?.userId))
}

export function getUser(req, res) {
  return sendData(res, userService.getUserProfile(req.params.userId, req.auth?.userId))
}

export function updateProfile(req, res) {
  return sendData(res, userService.updateProfile(req.auth.userId, req.body))
}

export function getUserPosts(req, res) {
  const result = listPosts({
    ...parsePostListQuery(req.query),
    authorId: userService.findUser(req.params.userId).id,
    userId: req.auth?.userId,
  })
  return sendData(res, result.posts, 200, result.pagination)
}

export function followUser(req, res) {
  return sendData(res, userService.followUser(req.auth.userId, req.params.userId))
}

export function unfollowUser(req, res) {
  return sendData(res, userService.unfollowUser(req.auth.userId, req.params.userId))
}

export function getFollowers(req, res) {
  return sendData(res, userService.getFollowers(req.params.userId))
}

export function getFollowing(req, res) {
  return sendData(res, userService.getFollowing(req.params.userId))
}
