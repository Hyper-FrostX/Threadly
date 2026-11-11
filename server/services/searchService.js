import { listCommunities } from './communityService.js'
import { listPosts } from './postService.js'
import { listUsers } from './userService.js'
import { httpError } from '../utils/httpError.js'

export function search(query) {
  const normalized = query.trim().toLowerCase()
  if (normalized.length < 2 || normalized.length > 100) {
    throw httpError(400, 'INVALID_SEARCH', 'Search query must be between 2 and 100 characters.')
  }
  const matchedCommunities = listCommunities().filter((community) =>
    [community.name, community.title, community.description]
      .some((value) => value.toLowerCase().includes(normalized)),
  )
  const matchedPosts = listPosts({ page: 1, limit: 100, sort: 'latest' }).posts
    .filter((post) => [
      post.title,
      post.body,
      post.community.name,
      post.community.title,
      post.author.username,
    ].some((value) => value.toLowerCase().includes(normalized)))
  const matchedUsers = listUsers().filter((user) =>
    [user.username, user.displayName, user.bio]
      .some((value) => value.toLowerCase().includes(normalized)),
  )

  return {
    query,
    communities: matchedCommunities,
    posts: matchedPosts,
    users: matchedUsers,
  }
}
