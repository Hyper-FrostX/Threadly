import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-sm text-zinc-600">
        The page you are looking for does not exist.
      </p>
      <Link to="/" className="mt-4 inline-block text-sm font-medium text-brand hover:underline">
        Back to home
      </Link>
    </section>
  )
}
