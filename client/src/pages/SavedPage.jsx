import { Bookmark } from 'lucide-react'
import PostFeed from '../components/posts/PostFeed.jsx'
import { useThreadly } from '../context/ThreadlyContext.jsx'

export default function SavedPage() {
  const { posts, bookmarks } = useThreadly()
  const savedPosts = posts.filter((post) => bookmarks.includes(post.id))
  return (
    <div className="space-y-5">
      <header className="page-heading">
        <div>
          <p className="eyebrow">YOUR PERSONAL READING LIST</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold tracking-tight"><Bookmark size={22} className="text-primary" /> Saved posts</h1>
          <p className="mt-1 text-sm text-muted">Keep the good ones close for later.</p>
        </div>
      </header>
      <PostFeed posts={savedPosts} showTabs={false} emptyMessage="Nothing saved yet. Bookmark a post to keep it here." />
    </div>
  )
}
