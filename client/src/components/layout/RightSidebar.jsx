import { ArrowUpRight, Flame, MessageCircle, Search, Users } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useThreadly } from '../../context/ThreadlyContext.jsx'
import HealthBadge from '../common/HealthBadge.jsx'

export default function RightSidebar() {
  const { communities, posts } = useThreadly()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const trending = [...communities].sort((a, b) => b.members - a.members).slice(0, 4)
  const discussions = [...posts].sort((a, b) => b.score - a.score).slice(0, 3)

  function submitSearch(event) {
    event.preventDefault()
    navigate(`/explore?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <aside className="hidden space-y-5 xl:block">
      <form className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 shadow-sm shadow-ink/[0.02] focus-within:border-primary/50" onSubmit={submitSearch} role="search">
        <Search size={17} className="text-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          placeholder="Search Threadly"
          aria-label="Search Threadly"
        />
      </form>
      <section className="side-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="section-label"><Flame size={15} className="text-primary" /> Trending communities</h2>
          <Link to="/communities" className="text-xs font-semibold text-primary hover:underline">See all</Link>
        </div>
        <div className="space-y-3">
          {trending.map((community, index) => (
            <Link to={`/c/${community.name}`} key={community.name} className="flex items-center gap-3 rounded-lg transition hover:bg-background">
              <span className="community-dot h-9 w-9" style={{ backgroundColor: community.color }}>
                {community.name.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{community.title || community.name}</span>
                <span className="block text-xs text-muted">{community.members.toLocaleString()} members</span>
              </span>
              <span className="text-xs font-medium text-muted">#{index + 1}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="side-card">
        <h2 className="section-label mb-4"><MessageCircle size={15} className="text-primary" /> Popular discussions</h2>
        <div className="space-y-4">
          {discussions.map((post) => (
            <Link key={post.id} to={`/post/${post.id}`} className="group block">
              <p className="text-sm font-semibold leading-5 transition group-hover:text-primary">{post.title}</p>
              <p className="mt-1 text-xs text-muted">{post.community} · {post.commentCount} replies</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="side-card">
        <h2 className="section-label mb-4"><Users size={15} className="text-primary" /> Find your people</h2>
        <p className="mb-4 text-xs leading-5 text-muted">Join a community to make your home feed feel more like you.</p>
        <Link to="/explore" className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10">
          Explore communities <ArrowUpRight size={16} />
        </Link>
      </section>
      <section className="rounded-2xl border border-line bg-surface/60 p-4">
        <div className="mb-3 text-sm font-semibold">A little about Threadly</div>
        <p className="text-xs leading-5 text-muted">A calmer corner of the internet, built around communities and thoughtful conversation.</p>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
          <span className="text-xs text-muted">Made for good conversations</span>
          <HealthBadge />
        </div>
      </section>
    </aside>
  )
}
