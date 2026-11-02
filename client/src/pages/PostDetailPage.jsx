import { ArrowLeft, ArrowBigDown, ArrowBigUp, Bookmark, MessageCircle, Send, Share2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Avatar from '../components/common/Avatar.jsx'
import { useThreadly } from '../context/ThreadlyContext.jsx'
import CommentThread from '../components/posts/CommentThread.jsx'
import PostOwnershipActions from '../components/posts/PostOwnershipActions.jsx'
import { formatRelativeTime } from '../utils/formatTime.js'

export default function PostDetailPage() {
  const { postId } = useParams()
  const { posts, comments, communities, currentUser, votePost, addComment, toggleBookmark, isBookmarked } = useThreadly()
  const [commentBody, setCommentBody] = useState('')
  const [formError, setFormError] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const post = posts.find((item) => item.id === postId)
  const postComments = comments.filter((comment) => comment.postId === postId)
  const topLevelComments = postComments.filter((comment) => !comment.parentCommentId)
  const community = communities.find((item) => item.name === post?.community)
  const bookmarked = post ? isBookmarked(post.id) : false

  if (!post) return <section className="empty-state"><h1 className="text-xl font-bold">Post not found</h1><p className="mt-2">This post does not exist yet.</p><Link to="/" className="mt-4 inline-block font-semibold text-primary">Back to home</Link></section>

  function submitComment(event) {
    event.preventDefault()
    if (commentBody.trim().length < 2) {
      setFormError('Write at least 2 characters before commenting.')
      return
    }
    const result = addComment(post.id, commentBody)
    if (result) {
      setCommentBody('')
      setFormError('')
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
        <div className="flex items-center gap-2 text-xs text-muted">
          <Link to={`/c/${post.community}`} className="community-dot h-9 w-9" style={{ backgroundColor: community?.color || '#ff5a36' }}>{community?.title?.charAt(0).toUpperCase() || post.community.charAt(0).toUpperCase()}</Link>
          <span><Link to={`/c/${post.community}`} className="font-bold text-ink hover:text-primary">t/{post.community}</Link><span className="mx-1.5">·</span><Link to={`/profile/${post.author}`} className="hover:text-primary">u/{post.author}</Link><span className="mx-1.5">·</span><time dateTime={post.createdAt}>{formatRelativeTime(post.createdAt)}</time></span>
        </div>
        <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-[-0.03em]">{post.title}</h1>
        {post.body ? <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted">{post.body}</p> : null}
        {post.image ? <img src={post.image} alt="" className="mt-4 max-h-[480px] w-full rounded-xl object-cover" /> : null}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <div className="inline-flex items-center rounded-full bg-background p-1">
            <button type="button" onClick={() => votePost(post.id, 1)} className={`vote-button ${post.userVote === 1 ? 'vote-active' : ''}`} aria-label="Upvote"><ArrowBigUp size={19} /></button>
            <span className="min-w-[34px] text-center text-xs font-bold">{post.score.toLocaleString()}</span>
            <button type="button" onClick={() => votePost(post.id, -1)} className={`vote-button ${post.userVote === -1 ? 'vote-down-active' : ''}`} aria-label="Downvote"><ArrowBigDown size={19} /></button>
          </div>
          <span className="action-pill"><MessageCircle size={16} /> {post.commentCount} comments</span>
          <button type="button" onClick={sharePost} className="action-pill"><Share2 size={15} /> Share</button>
          <button type="button" onClick={() => toggleBookmark(post.id)} className={`action-pill ${bookmarked ? 'text-primary' : ''}`} aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark post'}>
            <Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} /> {bookmarked ? 'Saved' : 'Save'}
          </button>
          <PostOwnershipActions post={post} />
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
          {topLevelComments.length ? topLevelComments.map((comment) => <CommentThread key={comment.id} comment={comment} comments={postComments} postId={post.id} />) : <p className="py-4 text-sm text-muted">No replies yet. Be the first to add one.</p>}
        </div>
      </section>
    </div>
  )
}
