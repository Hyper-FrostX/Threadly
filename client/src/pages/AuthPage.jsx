import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Logo from '../components/common/Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const { isAuthenticated, isLoading, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({
    username: '',
    displayName: '',
    email: '',
    identity: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isLoading && isAuthenticated) return <Navigate to="/" replace />

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    setError('')
  }

  async function submit(event) {
    event.preventDefault()
    if (isRegister && values.password !== values.confirmPassword) {
      setError('Your passwords do not match.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      if (isRegister) {
        await signUp({
          username: values.username,
          displayName: values.displayName,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
        })
      } else {
        await signIn({ identity: values.identity, password: values.password })
      }
      navigate('/', { replace: true })
    } catch (requestError) {
      setError(requestError.message || 'We could not complete that request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[440px]">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <section className="auth-card">
          <div className="mb-6 text-center">
            <p className="eyebrow">{isRegister ? 'FIND YOUR PEOPLE' : 'WELCOME BACK'}</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">
              {isRegister ? 'Make yourself at home.' : 'Good to have you back.'}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              {isRegister
                ? 'Create an account to join spaces and share what matters to you.'
                : 'Sign in to pick up the conversations you care about.'}
            </p>
          </div>
          <form className="space-y-4" onSubmit={submit}>
            {isRegister ? (
              <>
                <label className="form-label">
                  Display name
                  <input className="form-control" value={values.displayName} onChange={(event) => update('displayName', event.target.value)} autoComplete="name" maxLength={80} required />
                </label>
                <label className="form-label">
                  Username
                  <span className="relative block">
                    <UserRound size={16} className="pointer-events-none absolute left-3 top-3 text-muted" />
                    <input className="form-control pl-9" value={values.username} onChange={(event) => update('username', event.target.value)} autoComplete="username" minLength={3} maxLength={32} pattern="[A-Za-z0-9_]+" required />
                  </span>
                  <span className="mt-1 block font-normal text-muted">3–32 letters, numbers, or underscores.</span>
                </label>
                <label className="form-label">
                  Email
                  <span className="relative block">
                    <Mail size={16} className="pointer-events-none absolute left-3 top-3 text-muted" />
                    <input className="form-control pl-9" type="email" value={values.email} onChange={(event) => update('email', event.target.value)} autoComplete="email" required />
                  </span>
                </label>
              </>
            ) : (
              <label className="form-label">
                Email or username
                <span className="relative block">
                  <UserRound size={16} className="pointer-events-none absolute left-3 top-3 text-muted" />
                  <input className="form-control pl-9" value={values.identity} onChange={(event) => update('identity', event.target.value)} autoComplete="username" required />
                </span>
              </label>
            )}
            <label className="form-label">
              Password
              <span className="relative block">
                <LockKeyhole size={16} className="pointer-events-none absolute left-3 top-3 text-muted" />
                <input className="form-control pl-9" type="password" value={values.password} onChange={(event) => update('password', event.target.value)} autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={8} maxLength={72} required />
              </span>
            </label>
            {isRegister ? (
              <label className="form-label">
                Confirm password
                <span className="relative block">
                  <LockKeyhole size={16} className="pointer-events-none absolute left-3 top-3 text-muted" />
                  <input className="form-control pl-9" type="password" value={values.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} autoComplete="new-password" minLength={8} maxLength={72} required />
                </span>
              </label>
            ) : null}
            {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800" role="alert">{error}</p> : null}
            <button type="submit" className="button-primary mt-2 w-full" disabled={submitting || isLoading}>
              {submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
              {!submitting ? <ArrowRight size={16} /> : null}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-muted">
            {isRegister ? 'Already have an account?' : 'New to Threadly?'}{' '}
            <Link to={isRegister ? '/login' : '/register'} className="font-bold text-primary hover:underline">
              {isRegister ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </section>
        <p className="mt-5 text-center text-xs text-muted">A calmer corner of the internet, built around good conversation.</p>
      </div>
    </main>
  )
}
