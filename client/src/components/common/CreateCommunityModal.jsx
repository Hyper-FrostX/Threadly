import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThreadly } from '../../context/ThreadlyContext.jsx'
import Modal from './Modal.jsx'

export default function CreateCommunityModal() {
  const { communities, createCommunity, setCreateCommunityOpen } = useThreadly()
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function submit(event) {
    event.preventDefault()
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
    if (communities.some((community) => community.name === slug)) {
      setError('That community name is already taken.')
      return
    }
    if (slug.length < 3 || title.trim().length < 3 || description.trim().length < 10) {
      setError('Use a name with at least 3 letters, a title, and a description of at least 10 characters.')
      return
    }
    try {
      const community = await createCommunity({ name: slug, title, description })
      if (!community) return
      setCreateCommunityOpen(false)
      navigate(`/c/${community.name}`)
    } catch (requestError) {
      setError(requestError.message || 'The space could not be created.')
    }
  }

  return (
    <Modal title="Create a community" onClose={() => setCreateCommunityOpen(false)}>
      <form className="space-y-4" onSubmit={submit}>
        <label className="form-label">
          Community name
          <span className="relative block">
            <input className="form-control" value={name} onChange={(event) => setName(event.target.value)} maxLength={32} placeholder="yourcommunity" required />
          </span>
        </label>
        <label className="form-label">
          Display name
          <input className="form-control" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={60} placeholder="A welcoming name" required />
        </label>
        <label className="form-label">
          Description
          <textarea className="form-control min-h-24 resize-y" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={280} placeholder="What brings this community together?" required />
        </label>
        {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="button-secondary" onClick={() => setCreateCommunityOpen(false)}>Cancel</button>
          <button type="submit" className="button-primary">Create community</button>
        </div>
      </form>
    </Modal>
  )
}
