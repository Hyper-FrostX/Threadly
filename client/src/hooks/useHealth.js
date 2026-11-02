import { useEffect, useState } from 'react'
import { getHealth } from '../services/healthService.js'

export function useHealth() {
  const [state, setState] = useState({
    status: 'loading',
    data: null,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    getHealth()
      .then((data) => {
        if (!cancelled) {
          setState({ status: 'ok', data, error: null })
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: 'error', data: null, error: error.message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
