import { APP_NAME } from '../../utils/constants.js'

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-zinc-500">
        {APP_NAME} is a Reddit-inspired community platform.
      </div>
    </footer>
  )
}
