import { ImagePlus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThreadly } from '../../context/ThreadlyContext.jsx'
import Modal from './Modal.jsx'

export default function CreatePostModal() {
  const { communities, createPost, setCreatePostOpen } = useThreadly()
  const [communityId, setCommunityId] = useState('')
  const selectedCommunityId = communityId || communities[0]?.id || communities[0]?.name || ''
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [image, setImage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function submit(event) {
    event.preventDefault()
    if (!selectedCommunityId || title.trim().length < 5 || body.trim().length < 10) {
      setError('Choose a community, write a title (at least 5 characters), and add a little more detail.')
      return
    }
    try {
      const post = createPost({ communityId: selectedCommunityId, title, body, image: image.trim() || null })
      if (!post) return
      setCreatePostOpen(false)
      navigate(`/post/${post.id}`)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <Modal title="Create a post" onClose={() => setCreatePostOpen(false)}>
      <form className="space-y-4" onSubmit={submit}>
        <label className="form-label">
          Community
          <select className="form-control" value={selectedCommunityId} onChange={(event) => setCommunityId(event.target.value)} required>
            <option value="">Choose a community</option>
            {communities.map((item) => <option key={item.id || item.name} value={item.id || item.name}>t/{item.name}</option>)}
          </select>
        </label>
        <label className="form-label">
          Title
          <input className="form-control" value={title} onChange={(event) => setTitle(event.target.value)} minLength={5} maxLength={140} placeholder="Give your post a clear title" required />
        </label>
        <label className="form-label">
          Your post
          <textarea className="form-control min-h-32 resize-y" value={body} onChange={(event) => setBody(event.target.value)} minLength={10} maxLength={5000} placeholder="Share the context, question, or idea..." required />
        </label>
        <label className="form-label">
          Image URL <span className="font-normal text-muted">(optional)</span>
          <span className="relative block">
            <ImagePlus size={16} className="absolute left-3 top-3 text-muted" />
            <input className="form-control pl-9" type="url" value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://..." />
          </span>
        </label>
        {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="button-secondary" onClick={() => setCreatePostOpen(false)}>Cancel</button>
          <button type="submit" className="button-primary">Publish post</button>
        </div>
      </form>
    </Modal>
  )
}
