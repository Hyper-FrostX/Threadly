import { ArrowUpRight, Check, Plus, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useThreadly } from '../../context/ThreadlyContext.jsx'

export default function CommunityCard({ community }) {
  const { toggleJoin } = useThreadly()
  return (
    <article className="community-card">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/c/${community.name}`} className="community-dot h-12 w-12 text-lg" style={{ backgroundColor: community.color }}>
          {(community.title || community.name).charAt(0).toUpperCase()}
        </Link>
        <button type="button" className={community.joined ? 'button-secondary h-9 px-3 text-xs' : 'button-primary h-9 px-3 text-xs'} onClick={() => void toggleJoin(community)}>
          {community.joined ? <><Check size={14} /> Joined</> : <><Plus size={14} /> Join</>}
        </button>
      </div>
      <Link to={`/c/${community.name}`} className="mt-4 block text-base font-bold hover:text-primary">t/{community.name}</Link>
      <p className="mt-1 text-sm font-medium text-muted">{community.title}</p>
      <p className="mt-3 min-h-10 text-sm leading-5 text-muted">{community.description}</p>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted"><Users size={14} /> {community.members.toLocaleString()} members</span>
        <Link to={`/c/${community.name}`} aria-label={`View t/${community.name}`} className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-primary"><ArrowUpRight size={17} /></Link>
      </div>
    </article>
  )
}
