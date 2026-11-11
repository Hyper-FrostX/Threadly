import { Menu, Moon, Plus, Search, Sun } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useThreadly } from '../../context/ThreadlyContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import Dropdown from '../common/Dropdown.jsx'
import Logo from '../common/Logo.jsx'

export default function Header({ onMenuClick }) {
  const [query, setQuery] = useState('')
  const { isDark, toggleTheme } = useTheme()
  const { setCreatePostOpen, setNotice } = useThreadly()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  function submitSearch(event) {
    event.preventDefault()
    navigate(`/explore?q=${encodeURIComponent(query.trim())}`)
  }

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      setNotice(error.message || 'Could not sign out. Please try again.', 'error')
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center gap-2 px-2 sm:gap-3 sm:px-6 lg:px-8">
        <button
          type="button"
          className="icon-button lg:hidden"
          aria-label="Open navigation"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>
        <div className="lg:hidden">
          <Logo hideTagline />
        </div>
        <div className="hidden shrink-0 lg:block">
          <Logo />
        </div>
        <form
          className="ml-auto hidden w-full max-w-[500px] flex-1 items-center gap-2 rounded-2xl border border-line bg-background px-3 transition focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 sm:flex lg:mx-auto"
          onSubmit={submitSearch}
          role="search"
        >
          <Search size={17} className="shrink-0 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search communities and posts"
            aria-label="Search communities and posts"
            className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </form>
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:ml-0 sm:gap-2">
          <button
            type="button"
            onClick={() => setCreatePostOpen(true)}
            aria-label="Create post"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-3.5 text-sm font-semibold text-white shadow-sm shadow-primary/20 transition hover:bg-primary-dark"
          >
            <Plus size={17} />
            <span className="hidden sm:inline">Create post</span>
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            onClick={toggleTheme}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <Link to={`/profile/${user.username}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary sm:hidden" aria-label="Your profile">
              {user.displayName?.slice(0, 1).toUpperCase() || '?'}
            </Link>
          ) : (
            <Link to="/login" className="rounded-xl px-2 py-2 text-xs font-semibold text-primary sm:hidden">Sign in</Link>
          )}
          <div className="hidden items-center gap-2 sm:flex">
            {user ? (
              <Dropdown
                width="w-52"
                trigger={<button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary" aria-label="Open profile menu">{user.displayName?.slice(0, 1).toUpperCase() || '?'}</button>}
              >
                <div className="border-b border-line px-4 py-3">
                  <p className="text-sm font-bold">{user.displayName}</p>
                  <p className="mt-0.5 text-xs text-muted">@{user.username}</p>
                </div>
                <Link to={`/profile/${user.username}`} className="block px-4 py-2.5 text-sm hover:bg-background">Your profile</Link>
                <Link to="/saved" className="block px-4 py-2.5 text-sm hover:bg-background">Saved posts</Link>
                <Link to="/communities" className="block px-4 py-2.5 text-sm hover:bg-background">Your spaces</Link>
                <button type="button" className="block w-full border-t border-line px-4 py-2.5 text-left text-sm text-muted hover:bg-background" onClick={() => void handleSignOut()}>Sign out</button>
              </Dropdown>
            ) : (
              <>
                <Link to="/login" className="rounded-xl px-3 py-2 text-sm font-semibold text-muted hover:bg-background hover:text-ink">Sign in</Link>
                <Link to="/register" className="rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/15">Join Threadly</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
