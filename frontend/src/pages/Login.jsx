import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] p-8 rounded-lg shadow-lg border border-[var(--color-border)] w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Sign In</h1>
          <p className="text-[var(--color-text-muted)]">ITR Filing Management Platform</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-[var(--color-danger)] p-3 rounded mb-4 text-sm border-l-4 border-[var(--color-danger)]">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-[var(--color-border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-[var(--color-border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-transparent"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[var(--color-primary)] text-white py-2 px-4 rounded hover:bg-opacity-90 transition-opacity font-medium disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[var(--color-accent)] hover:underline font-medium">
            Register here
          </Link>
        </div>
      </div>
    </div>
  )
}
