import { Compass, Search } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import CommunityCard from '../components/communities/CommunityCard.jsx'
import PostCard from '../components/posts/PostCard.jsx'
import { useThreadly } from '../context/ThreadlyContext.jsx'
import { matchesQuery } from '../utils/formatTime.js'

export default function ExplorePage() {
  const { posts, communities, users } = useThreadly()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const normalized = query.trim().toLowerCase()
  const filteredCommunities = communities.filter((community) => `${community.name} ${community.title} ${community.description}`.toLowerCase().includes(normalized))
  const filteredPosts = posts.filter((post) => matchesQuery(post, query, communities))
  const filteredUsers = users.filter((user) => `${user.username} ${user.displayName} ${user.bio}`.toLowerCase().includes(normalized))

  function updateQuery(value) {
    if (value) setParams({ q: value }, { replace: true })
    else setParams({}, { replace: true })
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">A WORLD OF GOOD CONVERSATIONS</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold tracking-tight"><Compass size={23} className="text-primary" /> Explore Threadly</h1>
        <p className="mt-1 text-sm text-muted">Find your next favorite community, idea, or conversation.</p>
      </header>
      <label className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 shadow-sm focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10">
        <Search size={18} className="text-muted" />
        <input value={query} onChange={(event) => updateQuery(event.target.value)} className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" placeholder="Search posts, topics, and communities" aria-label="Search posts, topics, and communities" />
      </label>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">{query ? 'Matching communities' : 'Communities to explore'}</h2>
          <span className="text-xs text-muted">{filteredCommunities.length} found</span>
        </div>
        {filteredCommunities.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredCommunities.slice(0, 4).map((community) => <CommunityCard key={community.id || community.name} community={community} />)}
          </div>
        ) : <p className="empty-state">No communities match that search.</p>}
      </section>
      {query && filteredUsers.length ? (
        <section>
          <h2 className="mb-3 text-sm font-bold">People</h2>
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <Link key={user.id} to={`/profile/${user.username}`} className="block rounded-xl border border-line bg-surface p-3 hover:border-primary/30">
                <span className="block text-sm font-bold">{user.displayName}</span>
                <span className="text-xs text-muted">@{user.username}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <section>
        <h2 className="mb-3 text-sm font-bold">{query ? 'Matching posts' : 'Posts worth a look'}</h2>
        {filteredPosts.length ? (
          <div className="space-y-3">{filteredPosts.map((post) => <PostCard key={post.id} post={post} />)}</div>
        ) : <p className="empty-state">No posts match your search yet.</p>}
      </section>
    </div>
  )
}
