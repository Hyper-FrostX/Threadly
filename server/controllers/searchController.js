import { search } from '../services/searchService.js'
import { httpError } from '../utils/httpError.js'
import { sendData } from '../utils/response.js'

export function searchAll(req, res) {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  if (!query) throw httpError(400, 'QUERY_REQUIRED', 'A non-empty q query parameter is required.')
  return sendData(res, search(query))
}
