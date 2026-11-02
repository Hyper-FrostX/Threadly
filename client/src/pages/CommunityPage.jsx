import { ArrowLeft, Check, Plus, Users } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import PostFeed from '../components/posts/PostFeed.jsx'
import { useThreadly } from '../context/ThreadlyContext.jsx'

export default function CommunityPage() {
  const { communityName } = useParams()
  const { communities, toggleJoin, setCreatePostOpen } = useThreadly()
  const community = communities.find((item) => item.name === communityName)

  if (!community) {
    return <section className="empty-state"><h1 className="text-xl font-bold">Community not found</h1><p className="mt-2">t/{communityName} is not available yet.</p><Link className="mt-4 inline-block font-semibold text-primary" to="/explore">Explore communities</Link></section>
  }

  return (
    <div className="space-y-5">
      <Link to="/communities" className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-primary"><ArrowLeft size={15} /> Communities</Link>
      <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm shadow-ink/[0.025]">
        <div className="h-24" style={{ background: `linear-gradient(110deg, ${community.color}38, ${community.color}10)` }} />
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between gap-3">
            <span className="community-dot -mt-7 h-14 w-14 rounded-2xl border-4 border-surface text-xl" style={{ backgroundColor: community.color }}>{community.title.charAt(0).toUpperCase()}</span>
            <div className="flex gap-2">
              <button type="button" className="button-secondary h-9 px-3 text-xs" onClick={() => setCreatePostOpen(true)}>Create post</button>
              <button type="button" onClick={() => toggleJoin(community)} className={community.joined ? 'button-secondary h-9 px-3 text-xs' : 'button-primary h-9 px-3 text-xs'}>
                {community.joined ? <><Check size={14} /> Joined</> : <><Plus size={14} /> Join</>}
              </button>
            </div>
          </div>
          <h1 className="mt-3 text-xl font-extrabold">t/{community.name}</h1>
          <p className="text-sm font-semibold text-muted">{community.title}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{community.about || community.description}</p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted"><Users size={14} /> {community.members.toLocaleString()} members</div>
        </div>
      </section>
      <PostFeed communityId={community.id || community.name} emptyMessage="No posts in this community yet. Start the conversation." />
    </div>
  )
}
