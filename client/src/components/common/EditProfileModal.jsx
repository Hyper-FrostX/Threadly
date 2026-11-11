import { useState } from 'react'
import { useThreadly } from '../../context/ThreadlyContext.jsx'
import Modal from './Modal.jsx'

export default function EditProfileModal({ profile, onClose }) {
  const { updateCurrentProfile } = useThreadly()
  const [displayName, setDisplayName] = useState(profile.displayName || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [location, setLocation] = useState(profile.location || '')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setIsSaving(true)
    try {
      const updated = await updateCurrentProfile({ displayName, bio, location })
      if (updated) onClose()
      else setError('Your profile could not be saved. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal title="Edit your profile" onClose={onClose}>
      <form className="space-y-4" onSubmit={submit}>
        <label className="form-label">
          Display name
          <input
            className="form-control"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={80}
            required
          />
        </label>
        <label className="form-label">
          About you
          <textarea
            className="form-control min-h-28 resize-y"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={280}
            placeholder="A few words about what you enjoy discussing."
          />
          <span className="text-right text-xs font-normal text-muted">{bio.length}/280</span>
        </label>
        <label className="form-label">
          Location
          <input
            className="form-control"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            maxLength={100}
            placeholder="City or region"
          />
        </label>
        {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="button-primary" disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
