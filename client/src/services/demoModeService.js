import {
  currentUser,
  sampleComments,
  sampleCommunities,
  samplePosts,
} from '../utils/sampleData.js'

export const DEMO_STORAGE_KEY = 'threadly-demo-state-v1'

function createSeedState() {
  return {
    posts: samplePosts.map((post) => ({
      ...post,
      communityId: post.community,
      authorId: post.author,
      userVote: 0,
      image: post.image || null,
    })),
    communities: sampleCommunities.map((community) => ({
      ...community,
      id: community.name,
    })),
    comments: sampleComments.map((comment) => ({
      ...comment,
      parentCommentId: null,
    })),
    bookmarks: [],
    users: [
      currentUser,
      ...new Map(
        samplePosts
          .filter((post) => post.author !== currentUser.username)
          .map((post) => [post.author, {
            id: post.author,
            username: post.author,
            displayName: post.author.charAt(0).toUpperCase() + post.author.slice(1),
            bio: 'A member of the Threadly community.',
            karma: post.score,
            location: '',
            joinedAt: post.createdAt,
          }]),
      ).values(),
    ],
  }
}

function isValidState(value) {
  return value &&
    Array.isArray(value.posts) &&
    Array.isArray(value.communities) &&
    Array.isArray(value.comments) &&
    Array.isArray(value.bookmarks) &&
    Array.isArray(value.users)
}

export function readDemoState() {
  const seed = createSeedState()
  try {
    const stored = localStorage.getItem(DEMO_STORAGE_KEY)
    if (!stored) return seed
    const parsed = JSON.parse(stored)
    if (!isValidState(parsed)) return seed

    const savedPosts = new Map(parsed.posts.map((post) => [post.id, post]))
    const savedCommunities = new Map(parsed.communities.map((community) => [community.name, community]))
    const storedComments = parsed.comments.filter((comment) => comment.id.startsWith('demo-comment-'))
    const posts = seed.posts.map((post) => {
      const saved = savedPosts.get(post.id)
      const commentCount = storedComments.filter((comment) => comment.postId === post.id).length
      return {
        ...post,
        userVote: saved?.userVote || 0,
        score: post.score + (saved?.userVote || 0),
        commentCount: post.commentCount + commentCount,
      }
    })
    const customPosts = parsed.posts.filter((post) => post.demoOwned && !seed.posts.some((item) => item.id === post.id))
    const allPosts = [...posts, ...customPosts]
    const communities = seed.communities.map((community) => {
      const saved = savedCommunities.get(community.name)
      if (!saved) return community
      const membershipChange = saved.joined === community.joined ? 0 : saved.joined ? 1 : -1
      return {
        ...community,
        joined: saved.joined,
        members: Math.max(0, community.members + membershipChange),
      }
    })

    return {
      ...seed,
      posts: allPosts,
      communities,
      comments: [...seed.comments, ...storedComments.filter((comment) => allPosts.some((post) => post.id === comment.postId))],
      bookmarks: parsed.bookmarks.filter((id) => allPosts.some((post) => post.id === id)),
    }
  } catch {
    return seed
  }
}

export function writeDemoState(state) {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state))
}
