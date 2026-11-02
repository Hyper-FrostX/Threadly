import { Activity } from 'lucide-react'
import { useHealth } from '../../hooks/useHealth.js'

const styles = {
  loading: 'bg-zinc-100 text-zinc-600',
  ok: 'bg-emerald-50 text-emerald-700',
  error: 'bg-amber-50 text-amber-800',
}

export default function HealthBadge() {
  const { status, data, error } = useHealth()

  const label =
    status === 'ok'
      ? `API ${data.status}`
      : status === 'error'
        ? 'API offline'
        : 'Checking API'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
      title={error || data?.service || 'Threadly API'}
    >
      <Activity size={12} />
      {label}
    </span>
  )
}
