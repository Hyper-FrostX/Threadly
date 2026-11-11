import { randomUUID } from 'node:crypto'
import {
  commentsRepository,
  postsRepository,
} from '../repositories/platformRepository.js'
import { httpError } from '../utils/httpError.js'
import { createNotification } from './notificationService.js'
import { findCommunity } from './communityService.js'
import { findUser, publicUser } from './userService.js'

function present(post, userId) {
  const community = findCommunity(post.communityId)
  const author = findUser(post.authorId)
  return {
    id: post.id,
    communityId: post.communityId,
    authorId: post.authorId,
    title: post.title,
    body: post.body,
    image: post.image,
    score: post.score,
    userVote: userId ? post.votes[userId] || 0 : 0,
    bookmarked: userId ? post.bookmarks.includes(userId) : false,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    community: {
      id: community.id,
      name: community.name,
      title: community.title,
    },
    author: publicUser(author),
    commentCount: commentsRepository.listForPost(post.id).length,
  }
}

export function findPost(postId) {
  const post = postsRepository.find(postId)
  if (!post) throw httpError(404, 'POST_NOT_FOUND', 'Post not found.')
  return post
}

export function getPost(postId, userId) {
  return present(findPost(postId), userId)
}

export function listPosts({ page, limit, sort, communityId, authorId, userId }) {
  let result = postsRepository.list().filter((post) =>
    (!communityId || post.communityId === communityId) &&
    (!authorId || post.authorId === authorId),
  )

  if (sort === 'latest') {
    result.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  } else if (sort === 'popular') {
    result.sort((a, b) => b.score - a.score)
  } else if (sort === 'trending') {
    result.sort((a, b) => {
      const aComments = commentsRepository.listForPost(a.id).length
      const bComments = commentsRepository.listForPost(b.id).length
      const aAge = Math.max(1, (Date.now() - Date.parse(a.createdAt)) / 3600000)
      const bAge = Math.max(1, (Date.now() - Date.parse(b.createdAt)) / 3600000)
      return ((b.score + bComments * 4) / bAge) - ((a.score + aComments * 4) / aAge)
    })
  }

  const total = result.length
  const start = (page - 1) * limit
  return {
    posts: result.slice(start, start + limit).map((post) => present(post, userId)),
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
  const community = findCommunity(communityId)
  const timestamp = new Date().toISOString()
  const post = postsRepository.insert({
    id: `post-${randomUUID()}`,
    communityId: community.id,
    authorId,
    title: title.trim(),
    body: body.trim(),
    image,
    score: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  })
  return present(post, authorId)
}

export function updatePost(postId, updates, authorId) {
  const post = findPost(postId)
  if (post.authorId !== authorId) throw httpError(403, 'FORBIDDEN', 'Only the post author can update it.')
  const normalized = { ...updates }
  if (normalized.communityId !== undefined) normalized.communityId = findCommunity(normalized.communityId).id
  for (const field of ['title', 'body']) {
    if (normalized[field] !== undefined) normalized[field] = normalized[field].trim()
  }
  return present(postsRepository.update(postId, normalized), authorId)
}

export function deletePost(postId, authorId) {
  const post = findPost(postId)
  if (post.authorId !== authorId) throw httpError(403, 'FORBIDDEN', 'Only the post author can delete it.')
  postsRepository.delete(postId)
}

export function votePost(postId, userId, value) {
  const post = findPost(postId)
  const previous = post.votes[userId] || 0
  const updated = postsRepository.vote(postId, userId, value)
  if (value === 1 && previous !== 1 && post.authorId !== userId) {
    const voter = findUser(userId)
    createNotification({
      userId: post.authorId,
      type: 'appreciation',
      title: `${voter.displayName} appreciated your post`,
      body: post.title,
      targetUrl: `/post/${post.id}`,
    })
  }
  return present(updated, userId)
}

export function toggleBookmark(postId, userId) {
  findPost(postId)
  return present(postsRepository.toggleBookmark(postId, userId), userId)
}

export function listSavedPosts(userId) {
  return postsRepository.listBookmarkedBy(userId).map((post) => present(post, userId))
}

function presentComment(comment, allComments, userId) {
  const author = findUser(comment.authorId)
  return {
    ...comment,
    author: publicUser(author),
    userVote: userId ? comment.votes[userId] || 0 : 0,
    replies: allComments
      .filter((item) => item.parentCommentId === comment.id)
      .map((item) => presentComment(item, allComments, userId)),
  }
}

export function getPostComments(postId, userId) {
  findPost(postId)
  const allComments = commentsRepository.listForPost(postId)
  return allComments
    .filter((comment) => !comment.parentCommentId)
    .map((comment) => presentComment(comment, allComments, userId))
}

export function createComment(postId, body, authorId, parentCommentId = null) {
  findPost(postId)
  if (parentCommentId) {
    const parent = commentsRepository.find(parentCommentId)
    if (!parent || parent.postId !== postId) {
      throw httpError(404, 'COMMENT_NOT_FOUND', 'Parent comment not found.')
    }
  }
  const comment = commentsRepository.insert({
    id: `comment-${randomUUID()}`,
    postId,
    authorId,
    parentCommentId,
    body: body.trim(),
    score: 0,
    createdAt: new Date().toISOString(),
  })
  const post = findPost(postId)
  const author = findUser(authorId)
  if (post.authorId !== authorId) {
    createNotification({
      userId: post.authorId,
      type: parentCommentId ? 'reply' : 'comment',
      title: parentCommentId ? `${author.displayName} replied to your post` : `${author.displayName} commented on your post`,
      body: comment.body,
      targetUrl: `/post/${postId}#comments`,
    })
  }
  return presentComment(comment, commentsRepository.listForPost(postId), authorId)
}

export function findComment(commentId) {
  const comment = commentsRepository.find(commentId)
  if (!comment) throw httpError(404, 'COMMENT_NOT_FOUND', 'Comment not found.')
  return comment
}

export function deleteComment(commentId, userId) {
  const comment = findComment(commentId)
  if (comment.authorId !== userId) throw httpError(403, 'FORBIDDEN', 'Only the comment author can delete it.')
  commentsRepository.delete(commentId)
  return comment
}

export function updateComment(commentId, body, userId) {
  const comment = findComment(commentId)
  if (comment.authorId !== userId) throw httpError(403, 'FORBIDDEN', 'Only the comment author can update it.')
  return presentComment(commentsRepository.update(commentId, body.trim()), commentsRepository.listForPost(comment.postId), userId)
}

export function voteComment(commentId, userId, value) {
  const comment = findComment(commentId)
  return presentComment(commentsRepository.vote(commentId, userId, value), commentsRepository.listForPost(comment.postId), userId)
}
