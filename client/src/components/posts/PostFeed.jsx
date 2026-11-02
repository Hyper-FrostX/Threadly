import { useMemo, useState } from 'react'
import { useThreadly } from '../../context/ThreadlyContext.jsx'
import { FEED_PAGE_SIZE, FEED_SORTS } from '../../utils/constants.js'
import { sortPosts } from '../../utils/formatTime.js'
import PostCard from './PostCard.jsx'

export default function PostFeed({
  initialSort = 'latest',
  communityId,
  authorId,
  posts: postsOverride,
  showTabs = true,
  emptyMessage = 'There are no posts here yet.',
}) {
  const { posts: demoPosts } = useThreadly()
  const [sort, setSort] = useState(initialSort)
  const [visibleCount, setVisibleCount] = useState(FEED_PAGE_SIZE)
  const sortedPosts = useMemo(() => {
    const filtered = (postsOverride || demoPosts).filter((post) =>
      (!communityId || post.communityId === communityId || post.community === communityId) &&
      (!authorId || post.authorId === authorId || post.author === authorId),
    )
    return sortPosts(filtered, sort)
  }, [authorId, communityId, demoPosts, postsOverride, sort])

  function changeSort(nextSort) {
    setSort(nextSort)
    setVisibleCount(FEED_PAGE_SIZE)
  }

  return (
    <section>
      {showTabs ? (
        <div className="feed-tabs" role="tablist" aria-label="Sort posts">
          {FEED_SORTS.map((item) => (
            <button type="button" key={item.id} role="tab" aria-selected={sort === item.id} onClick={() => changeSort(item.id)} className={`feed-tab ${sort === item.id ? 'feed-tab-active' : ''}`}>
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
      {sortedPosts.length ? (
        <>
          <div className="space-y-3">{sortedPosts.slice(0, visibleCount).map((post) => <PostCard key={post.id} post={post} />)}</div>
          {visibleCount < sortedPosts.length ? (
            <button type="button" className="button-secondary mt-4 w-full" onClick={() => setVisibleCount((count) => count + FEED_PAGE_SIZE)}>Load more posts</button>
          ) : null}
        </>
      ) : <div className="empty-state">{emptyMessage}</div>}
    </section>
  )
}
