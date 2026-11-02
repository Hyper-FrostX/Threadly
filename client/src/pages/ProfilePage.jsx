import { CalendarDays, MapPin, Sparkles } from 'lucide-react'
import { useParams } from 'react-router-dom'
import Avatar from '../components/common/Avatar.jsx'
import PostFeed from '../components/posts/PostFeed.jsx'
import { useThreadly } from '../context/ThreadlyContext.jsx'
import { formatNumber, formatRelativeTime } from '../utils/formatTime.js'

export default function ProfilePage() {
  const { username } = useParams()
  const { currentUser, users, posts, communities } = useThreadly()
  const profile = users.find((user) => user.username === (username || currentUser.username))
  if (!profile) return <div className="empty-state">This profile could not be found.</div>
  const userPosts = posts.filter((post) => post.author === profile.username)
  const joinedCount = communities.filter((community) => community.joined).length

  return (
    <div className="space-y-5">
      <section className="profile-card">
        <div className="h-28 rounded-t-2xl bg-gradient-to-r from-[#ffded2] via-[#fff0e8] to-[#f6e8ff]" />
        <div className="px-5 pb-5">
          <div className="-mt-8 flex items-end justify-between"><Avatar name={profile.displayName} size="lg" /></div>
          <h1 className="mt-3 text-xl font-extrabold">{profile.displayName}</h1>
          <p className="text-sm text-muted">@{profile.username}</p>
          <p className="mt-3 max-w-xl text-sm leading-6">{profile.bio}</p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
            {profile.location ? <span className="inline-flex items-center gap-1.5"><MapPin size={14} />{profile.location}</span> : null}
            {profile.joinedAt ? <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} />Joined {formatRelativeTime(profile.joinedAt)}</span> : null}
          </div>
          <div className="mt-5 flex gap-6 border-t border-line pt-4">
            <div><span className="font-bold">{userPosts.length}</span> <span className="text-xs text-muted">posts</span></div>
            <div><span className="font-bold">{formatNumber(profile.karma)}</span> <span className="text-xs text-muted">karma</span></div>
            <div><span className="font-bold">{joinedCount}</span> <span className="text-xs text-muted">communities</span></div>
          </div>
        </div>
      </section>
      <div className="flex items-center gap-2 px-1 text-sm font-bold"><Sparkles size={16} className="text-primary" /> Posts by {profile.displayName}</div>
      <PostFeed posts={userPosts} showTabs={false} emptyMessage="This profile has not shared any posts yet." />
    </div>
  )
}
