import { httpError } from './httpError.js'

export function parsePostListQuery(query) {
  const page = query.page === undefined ? 1 : Number(query.page)
  const limit = query.limit === undefined ? 10 : Number(query.limit)
  if (!Number.isInteger(page) || page < 1) {
    throw httpError(400, 'INVALID_PAGINATION', 'page must be a positive integer.')
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw httpError(400, 'INVALID_PAGINATION', 'limit must be an integer between 1 and 100.')
  }
  const sort = query.sort || 'latest'
  if (!['latest', 'popular', 'trending'].includes(sort)) {
    throw httpError(400, 'INVALID_SORT', 'sort must be latest, popular, or trending.')
  }
  return { page, limit, sort }
}
