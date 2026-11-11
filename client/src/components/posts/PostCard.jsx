import {
  Bookmark,
  Heart,
  MessageCircle,
  Share2,
  ThumbsDown,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useThreadly } from '../../context/ThreadlyContext.jsx'
import { formatRelativeTime } from '../../utils/formatTime.js'
import Avatar from '../common/Avatar.jsx'
import PostOwnershipActions from './PostOwnershipActions.jsx'

export default function PostCard({ post }) {
  const { communities, users, votePost, toggleBookmark, isBookmarked } = useThreadly()
  const [shareMessage, setShareMessage] = useState('')
  const community = communities.find((item) => item.name === post.community)
  const author = users.find((item) => item.username === post.author)
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
      <div className="flex items-center gap-3">
        <Link
          to={`/c/${post.community}`}
          className="post-community-mark shrink-0"
          style={{ backgroundColor: community?.color || '#ad624e' }}
          aria-label={`Visit ${community?.title || post.community}`}
        >
          {(community?.title || post.community).charAt(0).toUpperCase()}
        </Link>
        <span className="min-w-0 flex-1">
          <Link to={`/c/${post.community}`} className="post-community-title block truncate">
            {community?.title || post.community}
          </Link>
          <span className="block truncate text-[11px] text-muted">{community?.name || post.community} community</span>
        </span>
        <time className="shrink-0 text-[11px] text-muted" dateTime={post.createdAt}>
          {formatRelativeTime(post.createdAt)}
        </time>
        <PostOwnershipActions post={post} compact />
      </div>
      <div className="post-author-line mt-4">
        <Avatar name={author?.displayName || post.author} size="sm" />
        <span>
          <Link to={`/profile/${post.author}`} className="font-semibold text-ink hover:text-primary">
            {author?.displayName || post.author}
          </Link>
          <span> shared a thought</span>
        </span>
      </div>
      <Link to={`/post/${post.id}`} className="mt-3 block text-[18px] font-extrabold leading-7 tracking-[-0.035em] text-ink transition hover:text-primary sm:text-[20px]">
            {post.title}
      </Link>
      {post.body ? <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted line-clamp-4">{post.body}</p> : null}
      {post.image ? (
        <Link to={`/post/${post.id}`} className="mt-4 block overflow-hidden rounded-2xl border border-line bg-background">
          <img src={post.image} alt="" className="max-h-[390px] w-full object-cover" loading="lazy" />
        </Link>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center gap-1 border-t border-line pt-3">
        <button
          type="button"
          onClick={() => void votePost(post.id, 1)}
          className={`appreciate-button ${post.userVote === 1 ? 'appreciate-button-active' : ''}`}
          aria-label={`Appreciate post, score ${post.score}`}
          aria-pressed={post.userVote === 1}
        >
          <Heart size={15} fill={post.userVote === 1 ? 'currentColor' : 'none'} />
          Appreciate <span className="tabular-nums">{post.score.toLocaleString()}</span>
        </button>
        <button
          type="button"
          onClick={() => void votePost(post.id, -1)}
          className={`post-downvote-button ${post.userVote === -1 ? 'post-downvote-button-active' : ''}`}
          aria-label="Not for me"
          aria-pressed={post.userVote === -1}
          title="Not for me"
        >
          <ThumbsDown size={15} />
        </button>
        <Link to={`/post/${post.id}#comments`} className="post-action-link">
          <MessageCircle size={15} /> {post.commentCount} <span className="hidden sm:inline">replies</span>
        </Link>
        <button type="button" onClick={sharePost} className="post-action-link">
          <Share2 size={15} /> <span className="hidden sm:inline">Share</span>
        </button>
        <button type="button" onClick={() => void toggleBookmark(post.id)} className={`post-save-button ml-auto ${bookmarked ? 'post-save-button-active' : ''}`} aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark post'}>
          <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} /> <span className="hidden sm:inline">{bookmarked ? 'Saved' : 'Save'}</span>
        </button>
        {shareMessage ? <span role="status" className="w-full text-right text-xs text-muted">{shareMessage}</span> : null}
      </div>
    </article>
  )
}
