import { randomUUID } from 'node:crypto'
import { comments, posts } from '../data/sampleData.js'
import { httpError } from '../utils/httpError.js'
import { findCommunity } from './communityService.js'
import { findUser, publicUser } from './userService.js'

function present(post) {
  const community = findCommunity(post.communityId)
  const author = findUser(post.authorId)
  const publicPost = { ...post }
  delete publicPost.votes
  delete publicPost.bookmarks
  return {
    ...publicPost,
    community: {
      id: community.id,
      name: community.name,
      title: community.title,
    },
    author: publicUser(author),
    commentCount: comments.filter((comment) => comment.postId === post.id).length,
  }
}

export function findPost(postId) {
  const post = posts.find((item) => item.id === postId)
  if (!post) throw httpError(404, 'POST_NOT_FOUND', 'Post not found.')
  return post
}

export function getPost(postId) {
  return present(findPost(postId))
}

export function listPosts({ page, limit, sort, communityId, authorId }) {
  let result = posts.filter((post) => {
    return (!communityId || post.communityId === communityId) &&
      (!authorId || post.authorId === authorId)
  })

  if (sort === 'latest') {
    result.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  } else if (sort === 'popular') {
    result.sort((a, b) => b.score - a.score)
  } else if (sort === 'trending') {
    result.sort((a, b) => {
      const aComments = comments.filter((comment) => comment.postId === a.id).length
      const bComments = comments.filter((comment) => comment.postId === b.id).length
      return (b.score + bComments * 4) - (a.score + aComments * 4)
    })
  }

  const total = result.length
  const start = (page - 1) * limit
  return {
    posts: result.slice(start, start + limit).map(present),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNextPage: start + limit < total,
      hasPreviousPage: page > 1,
    },
  }
}

export function createPost({ communityId, title, body = '', image = null }, authorId) {
  findCommunity(communityId)
  const timestamp = new Date().toISOString()
  const post = {
    id: `post-${randomUUID()}`,
    communityId,
    authorId,
    title: title.trim(),
    body: body.trim(),
    image,
    score: 0,
    votes: {},
    bookmarks: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  posts.unshift(post)
  return present(post)
}

export function updatePost(postId, updates, authorId) {
  const post = findPost(postId)
  if (post.authorId !== authorId) throw httpError(403, 'FORBIDDEN', 'Only the post author can update it.')
  if (updates.communityId !== undefined) findCommunity(updates.communityId)
  for (const field of ['communityId', 'title', 'body', 'image']) {
    if (updates[field] !== undefined) {
      post[field] = typeof updates[field] === 'string' ? updates[field].trim() : updates[field]
    }
  }
  post.updatedAt = new Date().toISOString()
  return present(post)
}

export function deletePost(postId, authorId) {
  const post = findPost(postId)
  if (post.authorId !== authorId) throw httpError(403, 'FORBIDDEN', 'Only the post author can delete it.')
  posts.splice(posts.indexOf(post), 1)
  for (let index = comments.length - 1; index >= 0; index -= 1) {
    if (comments[index].postId === postId) comments.splice(index, 1)
  }
}

export function votePost(postId, userId, value) {
  const post = findPost(postId)
  const previous = post.votes[userId] || 0
  if (previous === value) return present(post)
  post.score = post.score - previous + value
  if (value === 0) delete post.votes[userId]
  else post.votes[userId] = value
  return present(post)
}

export function toggleBookmark(postId, userId) {
  const post = findPost(postId)
  if (post.bookmarks.includes(userId)) {
    post.bookmarks = post.bookmarks.filter((id) => id !== userId)
  } else {
    post.bookmarks.push(userId)
  }
  return { ...present(post), bookmarked: post.bookmarks.includes(userId) }
}

export function getPostComments(postId) {
  findPost(postId)
  return comments
    .filter((comment) => comment.postId === postId && !comment.parentCommentId)
    .map(presentComment)
}

export function createComment(postId, body, authorId, parentCommentId = null) {
  findPost(postId)
  if (parentCommentId) {
    const parent = comments.find((comment) => comment.id === parentCommentId && comment.postId === postId)
    if (!parent) throw httpError(404, 'COMMENT_NOT_FOUND', 'Parent comment not found.')
  }
  const comment = {
    id: `comment-${randomUUID()}`,
    postId,
    authorId,
    parentCommentId,
    body: body.trim(),
    score: 0,
    createdAt: new Date().toISOString(),
  }
  comments.push(comment)
  return presentComment(comment)
}

export function findComment(commentId) {
  const comment = comments.find((item) => item.id === commentId)
  if (!comment) throw httpError(404, 'COMMENT_NOT_FOUND', 'Comment not found.')
  return comment
}

export function deleteComment(commentId, userId) {
  const comment = findComment(commentId)
  if (comment.authorId !== userId) throw httpError(403, 'FORBIDDEN', 'Only the comment author can delete it.')
  const toDelete = new Set([commentId])
  let changed = true
  while (changed) {
    changed = false
    for (const item of comments) {
      if (item.parentCommentId && toDelete.has(item.parentCommentId) && !toDelete.has(item.id)) {
        toDelete.add(item.id)
        changed = true
      }
    }
  }
  for (let index = comments.length - 1; index >= 0; index -= 1) {
    if (toDelete.has(comments[index].id)) comments.splice(index, 1)
  }
  return comment
}

function presentComment(comment) {
  const replies = comments
    .filter((item) => item.parentCommentId === comment.id)
    .map((item) => ({
      ...item,
      author: publicUser(findUser(item.authorId)),
    }))
  return {
    ...comment,
    author: publicUser(findUser(comment.authorId)),
    replies,
  }
}
