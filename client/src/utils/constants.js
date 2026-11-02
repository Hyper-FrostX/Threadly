export const APP_NAME = 'Threadly'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const THEME_STORAGE_KEY = 'threadly-theme'

export const FEED_PAGE_SIZE = 4

export const FEED_SORTS = [
  { id: 'latest', label: 'Latest' },
  { id: 'popular', label: 'Popular' },
  { id: 'trending', label: 'Trending' },
]
