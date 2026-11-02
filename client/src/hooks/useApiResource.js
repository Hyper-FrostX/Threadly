import { useCallback, useEffect, useState } from 'react'

export function useApiResource(loader) {
  const [reloadKey, setReloadKey] = useState(0)
  const [state, setState] = useState({
    data: null,
    loader: null,
    reloadKey: -1,
    error: null,
  })

  const retry = useCallback(() => setReloadKey((key) => key + 1), [])

  useEffect(() => {
    let active = true
    loader()
      .then((data) => {
        if (active) setState({ data, loader, reloadKey, status: 'success', error: null })
      })
      .catch((error) => {
        if (active) setState((current) => ({ ...current, loader, reloadKey, status: 'error', error }))
      })
    return () => {
      active = false
    }
  }, [loader, reloadKey])

  const matchesCurrentRequest = state.loader === loader && state.reloadKey === reloadKey
  return {
    data: state.data,
    status: matchesCurrentRequest ? state.status : 'loading',
    error: matchesCurrentRequest ? state.error : null,
    retry,
  }
}
