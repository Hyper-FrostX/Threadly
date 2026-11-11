import { ImagePlus, Link2, PenLine } from 'lucide-react'
import { useThreadly } from '../context/ThreadlyContext.jsx'
import Avatar from '../components/common/Avatar.jsx'
import HealthBadge from '../components/common/HealthBadge.jsx'
import PostFeed from '../components/posts/PostFeed.jsx'

const dateLabel = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' })
  .format(new Date())
  .toUpperCase()

export default function HomePage() {
  const { currentUser, users, communities, setCreatePostOpen } = useThreadly()
  const profile = users.find((user) => user.username === currentUser.username) || currentUser
  const joinedCount = communities.filter((community) => community.joined).length
  return (
    <div className="space-y-5">
      <section className="home-welcome page-heading">
        <div>
          <p className="eyebrow">{dateLabel}</p>
          <h1 className="mt-2 max-w-lg text-[26px] font-extrabold leading-tight tracking-[-0.045em] sm:text-[30px]">A little more of what brings us together.</h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted">Fresh ideas from the spaces you care about, gathered in one thoughtful feed.</p>
          <p className="mt-4 text-xs font-semibold text-primary">{joinedCount} {joinedCount === 1 ? 'space' : 'spaces'} in your orbit</p>
        </div>
        <HealthBadge />
      </section>
      <button type="button" onClick={() => setCreatePostOpen(true)} className="composer-card">
        <Avatar name={profile.displayName} />
        <span className="flex-1 text-left text-sm text-muted">Share something with your communities...</span>
        <span className="hidden items-center gap-3 text-muted sm:flex">
          <ImagePlus size={18} />
          <Link2 size={17} />
        </span>
        <span className="compose-action"><PenLine size={15} /> Create</span>
      </button>
      <PostFeed initialSort="latest" />
    </div>
  )
}
