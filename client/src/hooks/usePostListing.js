import { useEffect, useRef, useState } from 'react'
import { getPosts } from '../services/postService.js'
import { getUserPosts } from '../services/userService.js'

export function usePostListing({ initialSort = 'latest', communityId, authorId }) {
  const [sort, setSort] = useState(initialSort)
  const [posts, setPosts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [retryKey, setRetryKey] = useState(0)
  const [requestState, setRequestState] = useState({ key: null, status: 'loading', error: null })
  const requestId = useRef(0)
  const requestKey = `${sort}:${communityId || ''}:${authorId || ''}:${page}:${retryKey}`

  useEffect(() => {
    let active = true
    const currentRequestId = ++requestId.current

    const request = authorId
      ? getUserPosts(authorId, { page, limit: 10, sort })
      : getPosts({ page, limit: 10, sort, communityId })
    request
      .then((result) => {
        if (!active || currentRequestId !== requestId.current) return
        setPosts((current) => page === 1 ? result.posts : [...current, ...result.posts])
        setPagination(result.pagination)
        setRequestState({ key: requestKey, status: 'success', error: null })
      })
      .catch((requestError) => {
        if (!active || currentRequestId !== requestId.current) return
        setRequestState({ key: requestKey, status: 'error', error: requestError })
      })

    return () => {
      active = false
    }
  }, [authorId, communityId, page, requestKey, retryKey, sort])

  function changeSort(nextSort) {
    if (sort === nextSort && page === 1) {
      setRetryKey((key) => key + 1)
      return
    }
    setPosts([])
    setPagination(null)
    setPage(1)
    setSort(nextSort)
  }

  const currentRequest = requestState.key === requestKey
  return {
    posts,
    pagination,
    page,
    status: currentRequest ? requestState.status : 'loading',
    error: currentRequest ? requestState.error : null,
    retry: () => setRetryKey((key) => key + 1),
    loadMore: () => setPage((current) => current + 1),
    changeSort,
    selectedSort: sort,
    canLoadMore: Boolean(pagination?.hasNextPage),
  }
}
