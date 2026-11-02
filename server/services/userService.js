import { users } from '../data/sampleData.js'
import { httpError } from '../utils/httpError.js'

export function publicUser(user) {
  if (!user) return null
  const { following, ...profile } = user
  return { ...profile, followingCount: following.length }
}

export function listUsers() {
  return users.map(publicUser)
}

export function findUser(userId) {
  const user = users.find((item) => item.id === userId || item.username === userId)
  if (!user) throw httpError(404, 'USER_NOT_FOUND', 'User not found.')
  return user
}

export function getUserProfile(userId) {
  return publicUser(findUser(userId))
}

export function updateProfile(userId, updates) {
  const user = findUser(userId)
  for (const field of ['displayName', 'bio', 'location']) {
    if (updates[field] !== undefined) user[field] = updates[field].trim()
  }
  return publicUser(user)
}

export function followUser(followerId, followedId) {
  if (followerId === followedId) {
    throw httpError(400, 'INVALID_FOLLOW', 'You cannot follow yourself.')
  }
  const follower = findUser(followerId)
  findUser(followedId)
  if (!follower.following.includes(followedId)) follower.following.push(followedId)
  return publicUser(follower)
}

export function unfollowUser(followerId, followedId) {
  const follower = findUser(followerId)
  findUser(followedId)
  follower.following = follower.following.filter((id) => id !== followedId)
  return publicUser(follower)
}
