import {
  Bookmark,
  Compass,
  Home,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useThreadly } from '../../context/ThreadlyContext.jsx'
import { currentUser as fallbackUser } from '../../utils/sampleData.js'
import Avatar from '../common/Avatar.jsx'
import Logo from '../common/Logo.jsx'

const mainLinks = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/popular', label: 'Popular', icon: Sparkles },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/communities', label: 'Communities', icon: Users },
  { to: '/saved', label: 'Saved posts', icon: Bookmark },
]

export default function Sidebar({ open, onNavigate }) {
  const { communities, users, setCreateCommunityOpen } = useThreadly()
  const joined = communities.filter((community) => community.joined).slice(0, 6)
  const currentUser = users.find((user) => user.username === fallbackUser.username) || fallbackUser

  return (
    <aside className={`sidebar fixed inset-y-0 left-0 z-40 w-[270px] -translate-x-full border-r border-line bg-surface px-5 pb-6 pt-5 transition-transform lg:sticky lg:inset-y-auto lg:left-auto lg:top-[88px] lg:z-auto lg:block lg:h-[calc(100vh-108px)] lg:w-auto lg:translate-x-0 lg:border-0 lg:bg-transparent lg:px-0 lg:pt-1 ${open ? 'translate-x-0' : ''}`}>
      <div className="mb-9 hidden lg:block">
        <Logo />
      </div>
      <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Menu</div>
      <nav className="space-y-1">
        {mainLinks.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            <Icon size={18} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        onClick={() => {
          onNavigate()
          setCreateCommunityOpen(true)
        }}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 px-3 py-2.5 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
      >
        <Plus size={17} />
        Create community
      </button>
      <div className="mb-3 mt-8 flex items-center justify-between px-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Your communities</span>
        <span className="text-xs text-muted">{joined.length}</span>
      </div>
      <nav className="space-y-1">
        {joined.map((community) => (
          <NavLink
            key={community.name}
            to={`/c/${community.name}`}
            onClick={onNavigate}
            className={({ isActive }) => `community-nav-link ${isActive ? 'community-nav-active' : ''}`}
          >
            <span className="community-dot" style={{ backgroundColor: community.color }}>
              {community.name.charAt(0).toUpperCase()}
            </span>
            <span className="truncate">t/{community.name}</span>
          </NavLink>
        ))}
      </nav>
      <NavLink to="/profile" onClick={onNavigate} className="absolute bottom-5 left-0 right-0 flex items-center gap-3 rounded-xl border border-line bg-surface p-3 transition hover:border-primary/30 lg:static lg:bottom-auto lg:left-auto lg:right-auto lg:mt-8">
        <Avatar name={currentUser.displayName} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{currentUser.displayName}</span>
          <span className="block text-xs text-muted">@{currentUser.username}</span>
        </span>
        <span className="h-2 w-2 rounded-full bg-emerald-500" aria-label="Online" />
      </NavLink>
    </aside>
  )
}
