import { Menu, Moon, Plus, Search, Sun } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useThreadly } from '../../context/ThreadlyContext.jsx'
import Dropdown from '../common/Dropdown.jsx'
import Logo from '../common/Logo.jsx'

export default function Header({ onMenuClick }) {
  const [query, setQuery] = useState('')
  const { isDark, toggleTheme } = useTheme()
  const { setCreatePostOpen } = useThreadly()
  const navigate = useNavigate()

  function submitSearch(event) {
    event.preventDefault()
    navigate(`/explore?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="icon-button lg:hidden"
          aria-label="Open navigation"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>
        <div className="lg:hidden">
          <Logo />
        </div>
        <form
          className="ml-auto hidden w-full max-w-[440px] items-center gap-2 rounded-xl border border-line bg-background px-3 transition focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 sm:flex lg:ml-[250px]"
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
        <div className="ml-auto flex items-center gap-2 sm:ml-0">
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
          <div className="hidden sm:block">
            <Dropdown
              width="w-52"
              trigger={<button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffe8df] text-sm font-bold text-primary" aria-label="Open profile menu">V</button>}
            >
              <div className="border-b border-line px-4 py-3">
                <p className="text-sm font-bold">Vishnu</p>
                <p className="mt-0.5 text-xs text-muted">@vishnu</p>
              </div>
              <Link to="/profile" className="block px-4 py-2.5 text-sm hover:bg-background">Your profile</Link>
              <Link to="/saved" className="block px-4 py-2.5 text-sm hover:bg-background">Saved posts</Link>
              <Link to="/communities" className="block px-4 py-2.5 text-sm hover:bg-background">Your communities</Link>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  )
}
