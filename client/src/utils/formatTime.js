const DIVISIONS = [
  { amount: 60, name: 'seconds' },
  { amount: 60, name: 'minutes' },
  { amount: 24, name: 'hours' },
  { amount: 7, name: 'days' },
  { amount: 4.34524, name: 'weeks' },
  { amount: 12, name: 'months' },
  { amount: Number.POSITIVE_INFINITY, name: 'years' },
]

const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function formatRelativeTime(isoDate) {
  let duration = (new Date(isoDate).getTime() - Date.now()) / 1000

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.name)
    }
    duration /= division.amount
  }

  return formatter.format(0, 'seconds')
}

export function formatNumber(value) {
  return Intl.NumberFormat('en', { notation: 'compact' }).format(value)
}

export function sortPosts(posts, sort) {
  const copy = [...posts]

  if (sort === 'latest') {
    return copy.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }

  if (sort === 'trending') {
    return copy.sort(
      (a, b) => b.score * 2 + b.commentCount - (a.score * 2 + a.commentCount),
    )
  }

  if (sort === 'popular') {
    return copy.sort((a, b) => b.score - a.score)
  }

  return copy.sort((a, b) => Number(b.featured) - Number(a.featured) || b.score - a.score)
}

export function matchesQuery(post, query, communities) {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const community = communities.find((item) => item.name === post.community)

  return [post.title, post.body, post.author, post.community, community?.title]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(q))
}
