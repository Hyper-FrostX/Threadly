export default function Avatar({ name, size = 'md' }) {
  const initial = (name || '?').slice(0, 1).toUpperCase()
  const sizes = {
    sm: 'h-7 w-7 text-[11px]',
    md: 'h-9 w-9 text-sm',
    lg: 'h-14 w-14 text-lg',
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark font-semibold text-white ${sizes[size]}`}
      aria-hidden="true"
    >
      {initial}
    </span>
  )
}
