import { Outlet } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { Bookmark, Compass, Home, Sparkles, Users } from 'lucide-react'
import CreateCommunityModal from '../common/CreateCommunityModal.jsx'
import EditPostModal from '../common/EditPostModal.jsx'
import CreatePostModal from '../common/CreatePostModal.jsx'
import Header from './Header.jsx'
import RightSidebar from './RightSidebar.jsx'
import Sidebar from './Sidebar.jsx'
import { useThreadly } from '../../context/ThreadlyContext.jsx'

export default function MainLayout() {
  const {
    createPostOpen,
    createCommunityOpen,
    editingPostId,
    directoryStatus,
    directoryError,
    reloadDirectory,
    notice,
    dismissNotice,
  } = useThreadly()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-ink">
      <Header onMenuClick={() => setSidebarOpen((open) => !open)} />
      {directoryStatus === 'error' ? (
        <div className="mx-auto mt-3 flex max-w-[1440px] items-center justify-between gap-3 px-4 text-sm text-red-700 sm:px-6 lg:px-8" role="alert">
          <span>{directoryError?.message || 'Changes could not be saved to browser storage and may not persist after refresh.'}</span>
          <button type="button" className="button-secondary shrink-0" onClick={reloadDirectory}>Retry</button>
        </div>
      ) : null}
      {notice ? (
        <div className={`mx-auto mt-3 flex max-w-[1440px] items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm sm:px-6 lg:px-8 ${notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`} role="status">
          <span>{notice.message}</span>
          <button type="button" className="text-xs font-semibold" onClick={dismissNotice}>Dismiss</button>
        </div>
      ) : null}
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <div className="mx-auto grid min-h-[calc(100vh-68px)] max-w-[1440px] grid-cols-1 gap-6 px-4 pb-24 pt-5 sm:px-6 lg:grid-cols-[218px_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:pb-8 xl:grid-cols-[218px_minmax(0,680px)_280px]">
        <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
        <main className="min-w-0">
          <Outlet />
        </main>
        <RightSidebar />
      </div>
      <nav className="mobile-nav fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-line bg-surface/95 px-2 py-2 backdrop-blur lg:hidden" aria-label="Primary navigation">
        {[
          ['/', 'Home', Home],
          ['/popular', 'Popular', Sparkles],
          ['/explore', 'Explore', Compass],
          ['/communities', 'Spaces', Users],
          ['/saved', 'Saved', Bookmark],
        ].map(([to, label, Icon]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `mobile-nav-link ${isActive ? 'mobile-nav-active' : ''}`}>
            <Icon size={16} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      {createPostOpen ? <CreatePostModal /> : null}
      {createCommunityOpen ? <CreateCommunityModal /> : null}
      {editingPostId ? <EditPostModal key={editingPostId} /> : null}
    </div>
  )
}
