import { randomUUID } from 'node:crypto'
import { communitiesRepository } from '../repositories/platformRepository.js'
import { httpError } from '../utils/httpError.js'

function present(community, userId) {
  if (!community) return null
  const { members, ...data } = community
  return {
    ...data,
    memberCount: members.length,
    joined: userId ? members.includes(userId) : false,
  }
}

export function listCommunities(userId) {
  return communitiesRepository.list().map((community) => present(community, userId))
}

export function findCommunity(communityId) {
  const community = communitiesRepository.find(communityId)
  if (!community) throw httpError(404, 'COMMUNITY_NOT_FOUND', 'Community not found.')
  return community
}

export function getCommunity(communityId, userId) {
  return present(findCommunity(communityId), userId)
}

export function createCommunity({ name, title, description }, userId) {
  const normalizedName = name.trim().toLowerCase()
  if (communitiesRepository.find(normalizedName)) {
    throw httpError(409, 'COMMUNITY_EXISTS', 'A community with that name already exists.')
  }
  const createdAt = new Date().toISOString()
  try {
    return present(communitiesRepository.insert({
      id: `community-${randomUUID()}`,
      name: normalizedName,
      title: title.trim(),
      description: description.trim(),
      about: description.trim(),
      members: [userId],
      color: '#AD624E',
      createdAt,
    }), userId)
  } catch (error) {
    if (error.code === 'ERR_SQLITE_CONSTRAINT_UNIQUE') {
      throw httpError(409, 'COMMUNITY_EXISTS', 'A community with that name already exists.')
    }
    throw error
  }
}

export function joinCommunity(communityId, userId) {
  const community = findCommunity(communityId)
  return present(communitiesRepository.join(community.id, userId), userId)
}

export function leaveCommunity(communityId, userId) {
  const community = findCommunity(communityId)
  return present(communitiesRepository.leave(community.id, userId), userId)
}
