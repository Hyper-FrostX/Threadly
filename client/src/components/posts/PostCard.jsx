import {
  ArrowBigDown,
  ArrowBigUp,
  Bookmark,
  MessageCircle,
  Share2,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useThreadly } from '../../context/ThreadlyContext.jsx'
import { formatRelativeTime } from '../../utils/formatTime.js'
import PostOwnershipActions from './PostOwnershipActions.jsx'

export default function PostCard({ post }) {
  const { communities, votePost, toggleBookmark, isBookmarked } = useThreadly()
  const [shareMessage, setShareMessage] = useState('')
  const community = communities.find((item) => item.name === post.community)
  const bookmarked = isBookmarked(post.id)

  async function sharePost() {
    const url = `${window.location.origin}/post/${post.id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        setShareMessage('Link copied')
      } else {
        setShareMessage('Sharing is unavailable in this browser')
      }
    } catch (error) {
      if (error.name !== 'AbortError') setShareMessage('Could not share this post')
    }
    window.setTimeout(() => setShareMessage(''), 2200)
  }

  return (
    <article className="post-card">
      <div className="flex items-start gap-3">
        <Link to={`/c/${post.community}`} className="community-dot h-10 w-10 shrink-0" style={{ backgroundColor: community?.color || '#ff5a36' }}>
          {(community?.title || post.community).charAt(0).toUpperCase()}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs">
            <Link to={`/c/${post.community}`} className="font-bold text-ink hover:text-primary">t/{post.community}</Link>
            <span className="text-muted">·</span>
            <span className="truncate text-muted">Posted by <Link to={`/profile/${post.author}`} className="font-medium hover:text-primary">u/{post.author}</Link></span>
            <span className="text-muted">·</span>
            <time className="shrink-0 text-muted" dateTime={post.createdAt}>{formatRelativeTime(post.createdAt)}</time>
          </div>
          <Link to={`/post/${post.id}`} className="mt-2 block text-[17px] font-bold leading-6 tracking-[-0.02em] text-ink transition hover:text-primary">
            {post.title}
          </Link>
        </div>
        <PostOwnershipActions post={post} compact />
      </div>
      {post.body ? <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted line-clamp-4">{post.body}</p> : null}
      {post.image ? (
        <Link to={`/post/${post.id}`} className="mt-4 block overflow-hidden rounded-xl border border-line bg-background">
          <img src={post.image} alt="" className="max-h-[390px] w-full object-cover" loading="lazy" />
        </Link>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center rounded-full bg-background p-1">
          <button type="button" onClick={() => void votePost(post.id, 1)} className={`vote-button ${post.userVote === 1 ? 'vote-active' : ''}`} aria-label="Upvote">
            <ArrowBigUp size={19} />
          </button>
          <span className="min-w-[34px] text-center text-xs font-bold tabular-nums">{post.score.toLocaleString()}</span>
          <button type="button" onClick={() => void votePost(post.id, -1)} className={`vote-button ${post.userVote === -1 ? 'vote-down-active' : ''}`} aria-label="Downvote">
            <ArrowBigDown size={19} />
          </button>
        </div>
        <Link to={`/post/${post.id}#comments`} className="action-pill">
          <MessageCircle size={16} /> {post.commentCount} <span className="hidden sm:inline">comments</span>
        </Link>
        <button type="button" onClick={sharePost} className="action-pill">
          <Share2 size={15} /> <span className="hidden sm:inline">Share</span>
        </button>
        <button type="button" onClick={() => void toggleBookmark(post.id)} className={`action-pill ml-auto ${bookmarked ? 'text-primary' : ''}`} aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark post'}>
          <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} /> <span className="hidden sm:inline">{bookmarked ? 'Saved' : 'Save'}</span>
        </button>
        {shareMessage ? <span role="status" className="w-full text-right text-xs text-muted">{shareMessage}</span> : null}
      </div>
    </article>
  )
}
