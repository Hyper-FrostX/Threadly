import { useState } from 'react'
import { Search } from 'lucide-react'
import CommunityCard from '../components/communities/CommunityCard.jsx'
import { useThreadly } from '../context/ThreadlyContext.jsx'

export default function CommunitiesPage() {
  const { communities, directoryStatus, directoryError, reloadDirectory } = useThreadly()
  const [query, setQuery] = useState('')
  const filtered = communities.filter((community) => `${community.name} ${community.title} ${community.description}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <section className="space-y-5">
      <div className="page-heading">
        <div><p className="eyebrow">FIND YOUR PEOPLE</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight">Communities</h1><p className="mt-1 text-sm text-muted">Browse spaces made for the things you care about.</p></div>
      </div>
      <label className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 focus-within:border-primary/50">
        <Search size={17} className="text-muted" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" placeholder="Find a community" aria-label="Find a community" />
      </label>
      {directoryStatus === 'loading' ? <div className="empty-state" aria-label="Loading communities">Loading communities…</div> : null}
      {directoryStatus === 'error' ? (
        <div className="empty-state" role="alert">
          Could not load community data: {directoryError?.message || 'Unknown storage error.'}
          <button type="button" className="button-secondary mx-auto mt-3" onClick={reloadDirectory}>Retry</button>
        </div>
      ) : null}
      {directoryStatus === 'success' ? <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((community) => (
          <CommunityCard key={community.name} community={community} />
        ))}
      </div> : null}
      {directoryStatus === 'success' && filtered.length === 0 ? <div className="empty-state">No communities match “{query}”.</div> : null}
    </section>
  )
}
