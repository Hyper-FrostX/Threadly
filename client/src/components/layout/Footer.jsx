import { APP_NAME } from '../../utils/constants.js'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted">
        {APP_NAME} is a community platform for ideas, interests, and good conversation.
      </div>
    </footer>
  )
}
