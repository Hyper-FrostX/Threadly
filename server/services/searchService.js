import { posts } from '../data/sampleData.js'
import { listCommunities } from './communityService.js'
import { listPosts } from './postService.js'
import { listUsers } from './userService.js'

export function search(query) {
  const normalized = query.trim().toLowerCase()
  const matchedCommunities = listCommunities().filter((community) =>
    [community.name, community.title, community.description]
      .some((value) => value.toLowerCase().includes(normalized)),
  )
  const matchedPosts = listPosts({ page: 1, limit: posts.length || 1, sort: 'latest' }).posts
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
