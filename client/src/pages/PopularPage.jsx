import { Flame } from 'lucide-react'
import PostFeed from '../components/posts/PostFeed.jsx'

export default function PopularPage() {
  return (
    <div className="space-y-5">
      <header className="page-heading">
        <div>
          <p className="eyebrow">WHAT PEOPLE ARE TALKING ABOUT</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold tracking-tight"><Flame size={24} className="text-primary" /> Popular right now</h1>
          <p className="mt-1 text-sm text-muted">The posts sparking the best conversations across Threadly.</p>
        </div>
      </header>
      <PostFeed initialSort="popular" />
    </div>
  )
}
