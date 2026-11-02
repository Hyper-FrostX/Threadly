import api, { unwrapResponse } from './api.js'

export async function searchAll(query) {
  const response = await api.get('/search', { params: { q: query } })
  const result = unwrapResponse(response)
  return {
    ...result,
    communities: Array.isArray(result.communities)
      ? result.communities.map((community) => ({
          ...community,
          members: community.memberCount ?? 0,
          joined: community.joined ?? false,
        }))
      : [],
    users: result.users ?? [],
    posts: (result.posts ?? []).map((post) => ({
      ...post,
      communityId: post.community?.id ?? post.communityId,
      community: post.community?.name ?? post.community,
      communityTitle: post.community?.title,
      communityInfo: post.community,
      authorId: post.author?.id ?? post.authorId,
      author: post.author?.username ?? post.author,
      authorProfile: post.author,
      commentCount: post.commentCount ?? 0,
      userVote: 0,
    })),
  }
}
