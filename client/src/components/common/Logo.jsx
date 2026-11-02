import { MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { APP_NAME } from '../../utils/constants.js'

export default function Logo({ compact = false, onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="flex items-center gap-2.5 font-semibold tracking-tight text-ink"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/30">
        <MessageCircle size={18} />
      </span>
      {compact ? null : (
        <span className="text-[17px]">
          {APP_NAME}
          <span className="block text-[11px] font-medium tracking-normal text-muted">
            Communities first
          </span>
        </span>
      )}
    </Link>
  )
}
