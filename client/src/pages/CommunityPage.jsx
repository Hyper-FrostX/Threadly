import { ArrowLeft, Check, Plus, Users } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import PostFeed from '../components/posts/PostFeed.jsx'
import { useThreadly } from '../context/ThreadlyContext.jsx'

export default function CommunityPage() {
  const { communityName } = useParams()
  const { communities, toggleJoin, setCreatePostOpen } = useThreadly()
  const community = communities.find((item) => item.name === communityName)

  if (!community) {
    return <section className="empty-state"><h1 className="text-xl font-bold">Community not found</h1><p className="mt-2">{communityName} is not available yet.</p><Link className="mt-4 inline-block font-semibold text-primary" to="/explore">Explore communities</Link></section>
  }

  return (
    <div className="space-y-5">
      <Link to="/communities" className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-primary"><ArrowLeft size={15} /> Communities</Link>
      <section className="community-page-card">
        <div className="community-cover" style={{ background: `linear-gradient(115deg, ${community.color}48, ${community.color}14 65%, var(--color-surface))` }}>
          <span className="community-cover-label">A space for shared interests</span>
          <span className="community-cover-orbit" aria-hidden="true">{community.title.charAt(0).toUpperCase()}</span>
        </div>
        <div className="px-5 pb-5 sm:px-7">
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-3">
            <span className="community-dot -mt-8 h-16 w-16 rounded-[20px] border-4 border-surface text-xl" style={{ backgroundColor: community.color }}>{community.title.charAt(0).toUpperCase()}</span>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="button-secondary h-10 px-3 text-xs" onClick={() => setCreatePostOpen(true)}>Start a discussion</button>
              <button type="button" onClick={() => toggleJoin(community)} className={community.joined ? 'button-secondary h-10 px-3 text-xs' : 'button-primary h-10 px-3 text-xs'}>
                {community.joined ? <><Check size={14} /> Joined</> : <><Plus size={14} /> Join this space</>}
              </button>
            </div>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-primary">{community.name}</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em]">{community.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{community.about || community.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5"><Users size={14} /> {community.members.toLocaleString()} members</span>
            <span>{community.joined ? 'You are part of this space' : 'Open to curious minds'}</span>
          </div>
        </div>
      </section>
      <PostFeed communityId={community.id || community.name} emptyMessage="No posts in this community yet. Start the conversation." />
    </div>
  )
}
