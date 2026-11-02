import api, { unwrapResponse } from './api.js'

function normalizePost(post) {
  const community = post.community
  const author = post.author
  return {
    ...post,
    communityId: community?.id ?? post.communityId,
    community: community?.name ?? post.community,
    communityTitle: community?.title,
    communityInfo: community,
    authorId: author?.id ?? post.authorId,
    author: author?.username ?? post.author,
    authorProfile: author,
    commentCount: post.commentCount ?? 0,
    userVote: 0,
  }
}

export async function getPosts(params = {}) {
  const response = await api.get('/posts', { params })
  const data = unwrapResponse(response)
  return {
    posts: (Array.isArray(data) ? data : []).map(normalizePost),
    pagination: response.data?.meta ?? null,
  }
}

export async function getPost(postId) {
  const response = await api.get(`/posts/${encodeURIComponent(postId)}`)
  return normalizePost(unwrapResponse(response))
}

export async function getPostComments(postId) {
  const response = await api.get(`/posts/${encodeURIComponent(postId)}/comments`)
  return unwrapResponse(response)
}

export async function createPost(payload) {
  const response = await api.post('/posts', payload)
  return normalizePost(unwrapResponse(response))
}

export async function updatePost(postId, payload) {
  const response = await api.put(`/posts/${encodeURIComponent(postId)}`, payload)
  return normalizePost(unwrapResponse(response))
}

export async function deletePost(postId) {
  await api.delete(`/posts/${encodeURIComponent(postId)}`)
}

export async function votePost(postId, value) {
  const response = await api.post(`/posts/${encodeURIComponent(postId)}/vote`, { value })
  return normalizePost(unwrapResponse(response))
}

export async function toggleBookmark(postId) {
  const response = await api.post(`/posts/${encodeURIComponent(postId)}/bookmark`)
  return normalizePost(unwrapResponse(response))
}

export async function createComment(postId, body) {
  const response = await api.post(`/posts/${encodeURIComponent(postId)}/comments`, { body })
  return unwrapResponse(response)
}
