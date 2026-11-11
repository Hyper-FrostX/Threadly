import { ImagePlus } from 'lucide-react'
import { useState } from 'react'
import { useThreadly } from '../../context/ThreadlyContext.jsx'
import Modal from './Modal.jsx'

export default function EditPostModal() {
  const { posts, communities, editingPostId, setEditingPostId, editPost } = useThreadly()
  const post = posts.find((item) => item.id === editingPostId)
  const [title, setTitle] = useState(post?.title || '')
  const [body, setBody] = useState(post?.body || '')
  const [community, setCommunity] = useState(post?.community || '')
  const [image, setImage] = useState(post?.image || '')
  const [error, setError] = useState('')

  if (!post) return null

  async function submit(event) {
    event.preventDefault()
    if (title.trim().length < 5 || body.trim().length < 10 || !community) {
      setError('Add a title, description, and community before saving.')
      return
    }
    if (await editPost(post.id, { title, body, community, image })) setEditingPostId(null)
  }

  return (
    <Modal title="Edit your post" onClose={() => setEditingPostId(null)}>
      <form className="space-y-4" onSubmit={submit}>
        <label className="form-label">Community
          <select className="form-control" value={community} onChange={(event) => setCommunity(event.target.value)} required>
            {communities.map((item) => <option key={item.id || item.name} value={item.name}>{item.title || item.name}</option>)}
          </select>
        </label>
        <label className="form-label">Title
          <input className="form-control" value={title} onChange={(event) => setTitle(event.target.value)} minLength={5} maxLength={140} required />
        </label>
        <label className="form-label">Description
          <textarea className="form-control min-h-32 resize-y" value={body} onChange={(event) => setBody(event.target.value)} minLength={10} maxLength={5000} required />
        </label>
        <label className="form-label">Image URL <span className="font-normal text-muted">(optional)</span>
          <span className="relative block"><ImagePlus size={16} className="absolute left-3 top-3 text-muted" /><input className="form-control pl-9" type="url" value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://..." /></span>
        </label>
        {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <button type="button" className="button-secondary" onClick={() => setEditingPostId(null)}>Cancel</button>
          <button type="submit" className="button-primary">Save changes</button>
        </div>
      </form>
    </Modal>
  )
}
