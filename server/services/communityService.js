import { randomUUID } from 'node:crypto'
import { communities } from '../data/sampleData.js'
import { httpError } from '../utils/httpError.js'

function present(community, userId) {
  const { members, ...data } = community
  return {
    ...data,
    memberCount: members.length,
    joined: userId ? members.includes(userId) : undefined,
  }
}

export function listCommunities(userId) {
  return communities.map((community) => present(community, userId))
}

export function findCommunity(communityId) {
  const community = communities.find((item) => item.id === communityId || item.name === communityId)
  if (!community) throw httpError(404, 'COMMUNITY_NOT_FOUND', 'Community not found.')
  return community
}

export function getCommunity(communityId, userId) {
  return present(findCommunity(communityId), userId)
}

export function createCommunity({ name, title, description }, userId) {
  if (communities.some((community) => community.name === name)) {
    throw httpError(409, 'COMMUNITY_EXISTS', 'A community with that name already exists.')
  }
  const community = {
    id: `community-${randomUUID()}`,
    name,
    title: title.trim(),
    description: description.trim(),
    about: description.trim(),
    members: [userId],
    color: '#FF5A36',
    createdAt: new Date().toISOString(),
  }
  communities.unshift(community)
  return present(community, userId)
}

export function joinCommunity(communityId, userId) {
  const community = findCommunity(communityId)
  if (!community.members.includes(userId)) community.members.push(userId)
  return present(community, userId)
}

export function leaveCommunity(communityId, userId) {
  const community = findCommunity(communityId)
  community.members = community.members.filter((id) => id !== userId)
  return present(community, userId)
}
