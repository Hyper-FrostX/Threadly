import api, { unwrapResponse } from './api.js'

function normalizeUser(user) {
  return {
    ...user,
    karma: user.karma ?? 0,
    joinedAt: user.joinedAt ?? user.createdAt,
    location: user.location || '',
    followingCount: user.followingCount ?? 0,
  }
}

export async function getUsers() {
  const response = await api.get('/users')
  return unwrapResponse(response).map(normalizeUser)
}

export async function getUser(userId) {
  const response = await api.get(`/users/${encodeURIComponent(userId)}`)
  return normalizeUser(unwrapResponse(response))
}

export async function getUserPosts(userId, params = {}) {
  const response = await api.get(`/users/${encodeURIComponent(userId)}/posts`, { params })
  return {
    posts: unwrapResponse(response).map((post) => ({
      ...post,
      communityId: post.community?.id ?? post.communityId,
      community: post.community?.name ?? post.community,
      communityTitle: post.community?.title,
      communityInfo: post.community,
      authorId: post.author?.id ?? post.authorId,
      author: post.author?.username ?? post.author,
      authorProfile: post.author,
      userVote: 0,
    })),
    pagination: response.data?.meta ?? null,
  }
}

export async function getUserPostCount(userId) {
  const response = await api.get(`/users/${encodeURIComponent(userId)}/posts`, {
    params: { page: 1, limit: 1 },
  })
  return response.data?.meta?.total ?? 0
}

export async function updateProfile(payload) {
  const response = await api.put('/users/profile', payload)
  return normalizeUser(unwrapResponse(response))
}
