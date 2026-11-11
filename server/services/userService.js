import { followsRepository, usersRepository } from '../repositories/platformRepository.js'
import { httpError } from '../utils/httpError.js'
import { createNotification } from './notificationService.js'

export function publicUser(user, viewerId) {
  if (!user) return null
  const { passwordHash, email, preferences, ...profile } = user
  const following = followsRepository.listForUser(user.id)
  return {
    ...profile,
    followingCount: following.length,
    followersCount: followsRepository.countByFollowed(user.id),
    ...(viewerId ? { isFollowing: following.includes(viewerId) } : {}),
  }
}

export function listUsers(viewerId) {
  return usersRepository.list().map((user) => publicUser(user, viewerId))
}

export function findUser(userId) {
  const user = usersRepository.find(userId)
  if (!user) throw httpError(404, 'USER_NOT_FOUND', 'User not found.')
  return user
}

export function getUserProfile(userId, viewerId) {
  return publicUser(findUser(userId), viewerId)
}

export function updateProfile(userId, updates) {
  findUser(userId)
  const normalized = {}
  for (const field of ['displayName', 'bio', 'location', 'avatarUrl', 'coverUrl']) {
    if (updates[field] !== undefined) normalized[field] = updates[field].trim()
  }
  return publicUser(usersRepository.update(userId, normalized))
}

export function followUser(followerId, followedId) {
  if (followerId === followedId) {
    throw httpError(400, 'INVALID_FOLLOW', 'You cannot follow yourself.')
  }
  const followed = findUser(followedId)
  findUser(followerId)
  followsRepository.add(followerId, followed.id)
  const follower = usersRepository.find(followerId)
  if (follower.id !== followed.id) {
    createNotification({
      userId: followed.id,
      type: 'follow',
      title: `${follower.displayName} started following you`,
      targetUrl: `/profile/${follower.username}`,
    })
  }
  return publicUser(follower)
}

export function unfollowUser(followerId, followedId) {
  findUser(followerId)
  const followed = findUser(followedId)
  followsRepository.remove(followerId, followed.id)
  return publicUser(usersRepository.find(followerId))
}

export function getFollowers(userId) {
  findUser(userId)
  return followsRepository.listFollowers(userId).map((id) => publicUser(findUser(id)))
}

export function getFollowing(userId) {
  findUser(userId)
  return followsRepository.listForUser(userId).map((id) => publicUser(findUser(id)))
}
