import { useRef, useState } from 'react'
import { useClickOutside } from '../../hooks/useClickOutside.js'

export default function Dropdown({ trigger, children, align = 'right', width = 'w-72' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((value) => !value)}>{trigger}</div>
      {open ? (
        <div
          className={`absolute top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-line bg-surface shadow-xl shadow-ink/5 ${width} ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      ) : null}
    </div>
  )
}
