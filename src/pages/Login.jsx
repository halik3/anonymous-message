import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, LogIn } from 'lucide-react'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session) navigate('/dashboard', { replace: true })
  }, [session, navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!supabaseConfigured) {
      setError('Supabase is not configured yet.')
      return
    }
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) {
      setError(authError.message)
      return
    }
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white">
          <ArrowLeft size={16} /> Back to message page
        </Link>
        <form onSubmit={handleSubmit} className="glass-card enter rounded-3xl p-6">
          <h1 className="text-2xl font-semibold text-white">Admin login</h1>
          <p className="mt-2 text-sm text-zinc-500">Sign in to manage anonymous messages.</p>
          <label className="mt-6 block text-sm text-zinc-300" htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="violet-ring mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-white" />
          <label className="mt-4 block text-sm text-zinc-300" htmlFor="password">Password</label>
          <div className="relative mt-2">
            <input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="violet-ring w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 pr-12 text-sm text-white" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error && <p role="alert" className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
          <button type="submit" disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60">
            <LogIn size={17} /> {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
