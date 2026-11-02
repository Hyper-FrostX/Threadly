import api, { unwrapResponse } from './api.js'

function normalizeCommunity(community) {
  return {
    ...community,
    members: community.memberCount ?? community.members?.length ?? 0,
    joined: community.joined ?? false,
  }
}

export async function getCommunities() {
  const response = await api.get('/communities')
  return unwrapResponse(response).map(normalizeCommunity)
}

export async function getCommunity(communityId) {
  const response = await api.get(`/communities/${encodeURIComponent(communityId)}`)
  return normalizeCommunity(unwrapResponse(response))
}

export async function createCommunity(payload) {
  const response = await api.post('/communities', payload)
  return normalizeCommunity(unwrapResponse(response))
}

export async function joinCommunity(communityId) {
  const response = await api.post(`/communities/${encodeURIComponent(communityId)}/join`)
  return normalizeCommunity(unwrapResponse(response))
}

export async function leaveCommunity(communityId) {
  const response = await api.delete(`/communities/${encodeURIComponent(communityId)}/join`)
  return normalizeCommunity(unwrapResponse(response))
}
