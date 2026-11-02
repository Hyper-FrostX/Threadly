import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useThreadly } from '../../context/ThreadlyContext.jsx'
import Dropdown from '../common/Dropdown.jsx'

export default function PostOwnershipActions({ post, compact = false }) {
  const { currentUser, setEditingPostId, deletePost } = useThreadly()
  const navigate = useNavigate()
  if (!post.demoOwned || post.author !== currentUser.username) return null

  function removePost() {
    if (!window.confirm('Delete this post? This only removes it from this browser.')) return
    const deleted = deletePost(post.id)
    if (deleted) navigate('/')
  }

  if (!compact) {
    return (
      <div className="flex gap-2">
        <button type="button" className="button-secondary h-9 px-3 text-xs" onClick={() => setEditingPostId(post.id)}><Pencil size={14} /> Edit</button>
        <button type="button" className="button-secondary h-9 px-3 text-xs text-red-600" onClick={removePost}><Trash2 size={14} /> Delete</button>
      </div>
    )
  }

  return (
    <Dropdown
      width="w-44"
      trigger={<button type="button" className="icon-button -mr-2 -mt-1 h-8 w-8" aria-label="More post options"><MoreHorizontal size={19} /></button>}
    >
      <button type="button" className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-background" onClick={() => setEditingPostId(post.id)}><Pencil size={14} /> Edit post</button>
      <button type="button" className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-background" onClick={removePost}><Trash2 size={14} /> Delete post</button>
    </Dropdown>
  )
}
