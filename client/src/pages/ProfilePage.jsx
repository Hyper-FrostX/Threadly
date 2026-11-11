import { CalendarDays, MapPin, Pencil, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Avatar from '../components/common/Avatar.jsx'
import EditProfileModal from '../components/common/EditProfileModal.jsx'
import PostFeed from '../components/posts/PostFeed.jsx'
import { useThreadly } from '../context/ThreadlyContext.jsx'
import { formatNumber, formatRelativeTime } from '../utils/formatTime.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProfilePage() {
  const { username } = useParams()
  const { currentUser, users, posts, communities } = useThreadly()
  const { user: authenticatedUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const profileName = username || authenticatedUser?.username || currentUser.username
  const isOwnProfile = authenticatedUser?.username === profileName
  const profile = isOwnProfile
    ? { ...users.find((user) => user.username === profileName), ...authenticatedUser }
    : users.find((user) => user.username === profileName)
  if (!profile) return <div className="empty-state">This profile could not be found.</div>
  const userPosts = posts.filter((post) => post.author === profile.username)
  const joinedCount = communities.filter((community) => community.joined).length

  return (
    <div className="space-y-5">
      <section className="profile-card">
        <div className="profile-cover">
          <span className="profile-cover-label">A little corner of Threadly</span>
          <span className="profile-cover-orbit" aria-hidden="true">{profile.displayName.slice(0, 1).toUpperCase()}</span>
        </div>
        <div className="px-5 pb-5 sm:px-7">
          <div className="relative z-10 -mt-8 flex items-end justify-between">
            <Avatar name={profile.displayName} size="lg" />
            {isOwnProfile ? (
              <button type="button" className="button-secondary h-9 px-3 text-xs" onClick={() => setIsEditing(true)}>
                <Pencil size={14} /> Edit profile
              </button>
            ) : null}
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-[-0.04em]">{profile.displayName}</h1>
          <p className="text-sm text-muted">@{profile.username}</p>
          <p className="mt-3 max-w-xl text-sm leading-6">{profile.bio}</p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
            {profile.location ? <span className="inline-flex items-center gap-1.5"><MapPin size={14} />{profile.location}</span> : null}
            {profile.joinedAt || profile.createdAt ? <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} />Joined {formatRelativeTime(profile.joinedAt || profile.createdAt)}</span> : null}
          </div>
          <div className="profile-metrics mt-5">
            <div><span className="block text-lg font-extrabold">{userPosts.length}</span><span className="text-xs text-muted">shared posts</span></div>
            <div><span className="block text-lg font-extrabold">{formatNumber(profile.karma)}</span><span className="text-xs text-muted">appreciation</span></div>
            <div><span className="block text-lg font-extrabold">{joinedCount}</span><span className="text-xs text-muted">spaces joined</span></div>
          </div>
        </div>
      </section>
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <p className="eyebrow">IDEAS AND CONVERSATIONS</p>
          <h2 className="mt-1 flex items-center gap-2 text-lg font-extrabold tracking-[-0.03em]"><Sparkles size={17} className="text-primary" /> Posts by {profile.displayName}</h2>
        </div>
        <span className="text-xs text-muted">{userPosts.length} shared</span>
      </div>
      <PostFeed posts={userPosts} showTabs={false} emptyMessage="This profile has not shared any posts yet." />
      {isEditing ? <EditProfileModal profile={profile} onClose={() => setIsEditing(false)} /> : null}
    </div>
  )
}
