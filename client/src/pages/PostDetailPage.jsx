import { ArrowLeft, Bookmark, Heart, MessageCircle, Send, Share2, ThumbsDown } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Avatar from '../components/common/Avatar.jsx'
import { useThreadly } from '../context/ThreadlyContext.jsx'
import CommentThread from '../components/posts/CommentThread.jsx'
import PostOwnershipActions from '../components/posts/PostOwnershipActions.jsx'
import { formatRelativeTime } from '../utils/formatTime.js'
import { useAuth } from '../context/AuthContext.jsx'
import { getPostComments } from '../services/postService.js'

function flattenComments(items, parentCommentId = null) {
  return items.flatMap((item) => {
    const { replies = [], ...comment } = item
    return [
      { ...comment, parentCommentId: comment.parentCommentId || parentCommentId },
      ...flattenComments(replies, comment.id),
    ]
  })
}

export default function PostDetailPage() {
  const { postId } = useParams()
  const { posts, comments: demoComments, communities, currentUser, votePost, addComment, toggleBookmark, isBookmarked } = useThreadly()
  const { isAuthenticated } = useAuth()
  const [commentBody, setCommentBody] = useState('')
  const [formError, setFormError] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [commentResult, setCommentResult] = useState({ postId: null, status: 'idle', comments: [], error: '' })
  const comments = isAuthenticated && commentResult.postId === postId && commentResult.status === 'success'
    ? commentResult.comments
    : isAuthenticated
      ? []
      : demoComments
  const commentsError = isAuthenticated && commentResult.postId === postId && commentResult.status === 'error'
    ? commentResult.error
    : ''
  const post = posts.find((item) => item.id === postId)
  const postComments = comments.filter((comment) => comment.postId === postId)
  const topLevelComments = postComments.filter((comment) => !comment.parentCommentId)
  const community = communities.find((item) => item.name === post?.community)
  const bookmarked = post ? isBookmarked(post.id) : false

  const refreshComments = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const result = await getPostComments(postId)
      setCommentResult({ postId, status: 'success', comments: flattenComments(result), error: '' })
    } catch (error) {
      setCommentResult({
        postId,
        status: 'error',
        comments: [],
        error: error.message || 'Discussion replies could not be loaded.',
      })
    }
  }, [isAuthenticated, postId])

  useEffect(() => {
    if (!isAuthenticated) return undefined
    let active = true
    getPostComments(postId)
      .then((result) => {
        if (active) {
          setCommentResult({ postId, status: 'success', comments: flattenComments(result), error: '' })
        }
      })
      .catch((error) => {
        if (active) {
          setCommentResult({
            postId,
            status: 'error',
            comments: [],
            error: error.message || 'Discussion replies could not be loaded.',
          })
        }
      })
    return () => { active = false }
  }, [isAuthenticated, postId])

  if (!post) return <section className="empty-state"><h1 className="text-xl font-bold">Post not found</h1><p className="mt-2">This post does not exist yet.</p><Link to="/" className="mt-4 inline-block font-semibold text-primary">Back to home</Link></section>

  async function submitComment(event) {
    event.preventDefault()
    if (commentBody.trim().length < 2) {
      setFormError('Write at least 2 characters before commenting.')
      return
    }
    const result = await addComment(post.id, commentBody)
    if (result) {
      setCommentBody('')
      setFormError('')
      if (isAuthenticated) await refreshComments()
    } else {
      setFormError('Could not add that comment.')
    }
  }

  async function sharePost() {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: post.title, url })
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        setShareMessage('Link copied')
      } else setShareMessage('Sharing is unavailable in this browser')
    } catch (shareError) {
      if (shareError.name !== 'AbortError') setShareMessage('Could not share this post')
    }
  }

  return (
    <div className="space-y-4">
      <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-primary"><ArrowLeft size={15} /> Back to feed</Link>
      <article className="post-card">
        <div className="flex items-center gap-3">
          <Link to={`/c/${post.community}`} className="post-community-mark" style={{ backgroundColor: community?.color || '#ad624e' }} aria-label={`Visit ${community?.title || post.community}`}>{community?.title?.charAt(0).toUpperCase() || post.community.charAt(0).toUpperCase()}</Link>
          <span className="min-w-0 flex-1">
            <Link to={`/c/${post.community}`} className="post-community-title block">{community?.title || post.community}</Link>
            <span className="block text-[11px] text-muted">{community?.name || post.community} community · <time dateTime={post.createdAt}>{formatRelativeTime(post.createdAt)}</time></span>
          </span>
          <PostOwnershipActions post={post} compact />
        </div>
        <div className="post-author-line mt-4"><Avatar name={currentUser.username === post.author ? currentUser.displayName : post.author} size="sm" /><span><Link to={`/profile/${post.author}`} className="font-semibold text-ink hover:text-primary">{post.author}</Link> shared a thought</span></div>
        <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-[-0.03em]">{post.title}</h1>
        {post.body ? <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted">{post.body}</p> : null}
        {post.image ? <img src={post.image} alt="" className="mt-4 max-h-[480px] w-full rounded-2xl object-cover" /> : null}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <button type="button" onClick={() => votePost(post.id, 1)} className={`appreciate-button ${post.userVote === 1 ? 'appreciate-button-active' : ''}`} aria-label={`Appreciate post, score ${post.score}`} aria-pressed={post.userVote === 1}>
            <Heart size={15} fill={post.userVote === 1 ? 'currentColor' : 'none'} /> Appreciate <span className="tabular-nums">{post.score.toLocaleString()}</span>
          </button>
          <button type="button" onClick={() => votePost(post.id, -1)} className={`post-downvote-button ${post.userVote === -1 ? 'post-downvote-button-active' : ''}`} aria-label="Not for me" aria-pressed={post.userVote === -1}><ThumbsDown size={15} /></button>
          <span className="post-action-link"><MessageCircle size={16} /> {post.commentCount} replies</span>
          <button type="button" onClick={sharePost} className="post-action-link"><Share2 size={15} /> Share</button>
          <button type="button" onClick={() => toggleBookmark(post.id)} className={`post-save-button ${bookmarked ? 'post-save-button-active' : ''}`} aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark post'}>
            <Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} /> {bookmarked ? 'Saved' : 'Save'}
          </button>
          {shareMessage ? <span role="status" className="w-full text-right text-xs text-muted">{shareMessage}</span> : null}
        </div>
      </article>
      <section id="comments" className="post-card">
        <h2 className="mb-4 flex items-center gap-2 font-bold"><MessageCircle size={18} className="text-primary" /> Join the conversation</h2>
        <form onSubmit={submitComment}>
          <div className="flex items-start gap-3">
            <Avatar name={currentUser.displayName} size="sm" />
            <div className="flex-1">
              <textarea value={commentBody} onChange={(event) => setCommentBody(event.target.value)} className="form-control min-h-24 resize-y" maxLength={2000} placeholder="Share a thoughtful reply..." aria-label="Write a comment" />
              {formError ? <p className="mt-2 text-xs text-amber-700" role="alert">{formError}</p> : null}
              <div className="mt-2 flex justify-end">
                <button type="submit" className="button-primary h-9 px-3 text-xs"><Send size={14} /> Comment</button>
              </div>
            </div>
          </div>
        </form>
        <div className="mt-5 divide-y divide-line">
          {commentsError ? <p className="py-4 text-sm text-red-700" role="alert">{commentsError}</p> : null}
          {topLevelComments.length ? topLevelComments.map((comment) => <CommentThread key={comment.id} comment={comment} comments={postComments} postId={post.id} onCommentAdded={() => void refreshComments()} />) : !commentsError ? <p className="py-4 text-sm text-muted">No replies yet. Be the first to add one.</p> : null}
        </div>
      </section>
    </div>
  )
}
