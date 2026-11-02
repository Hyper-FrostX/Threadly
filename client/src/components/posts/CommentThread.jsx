import { ArrowBigUp, CornerDownRight, Reply } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useThreadly } from '../../context/ThreadlyContext.jsx'
import Avatar from '../common/Avatar.jsx'
import { formatRelativeTime } from '../../utils/formatTime.js'

export default function CommentThread({ comment, comments, postId, depth = 0 }) {
  const { addComment } = useThreadly()
  const [replyOpen, setReplyOpen] = useState(false)
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const author = comment.author || 'member'
  const replies = comments.filter((item) => item.parentCommentId === comment.id)

  function submitReply(event) {
    event.preventDefault()
    if (body.trim().length < 2) {
      setError('Replies need at least 2 characters.')
      return
    }
    const reply = addComment(postId, body, comment.id)
    if (reply) {
      setBody('')
      setError('')
      setReplyOpen(false)
    } else {
      setError('Could not add that reply.')
    }
  }

  return (
    <article className={`py-4 ${depth ? 'ml-4 border-l-2 border-line pl-3 sm:ml-8 sm:pl-4' : ''}`}>
      <div className="flex items-start gap-3">
        <Avatar name={author} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs">
            <Link to={`/profile/${author}`} className="font-bold hover:text-primary">u/{author}</Link>
            <time className="text-muted" dateTime={comment.createdAt}>{formatRelativeTime(comment.createdAt)}</time>
          </div>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-muted">{comment.body}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-muted"><ArrowBigUp size={14} /> {comment.score || 0}</span>
            <button type="button" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-muted hover:bg-background hover:text-primary" onClick={() => setReplyOpen((open) => !open)}>
              <Reply size={13} /> Reply
            </button>
          </div>
          {replyOpen ? (
            <form className="mt-3" onSubmit={submitReply}>
              <textarea className="form-control min-h-20 resize-y" value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} placeholder={`Reply to u/${author}...`} aria-label={`Reply to ${author}`} />
              {error ? <p className="mt-1 text-xs text-red-600" role="alert">{error}</p> : null}
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" className="button-secondary h-8 px-3 text-xs" onClick={() => setReplyOpen(false)}>Cancel</button>
                <button type="submit" className="button-primary h-8 px-3 text-xs"><CornerDownRight size={13} /> Reply</button>
              </div>
            </form>
          ) : null}
          {replies.map((reply) => <CommentThread key={reply.id} comment={reply} comments={comments} postId={postId} depth={depth + 1} />)}
        </div>
      </div>
    </article>
  )
}
