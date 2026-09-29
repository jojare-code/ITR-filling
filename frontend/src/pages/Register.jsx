import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import PrivacyPolicyModal from '../components/PrivacyPolicyModal'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!privacyAccepted) {
      setError('You must accept the Data Privacy Policy and Storage Consent to proceed.')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            mobile_no: mobile,
            role: 'client'
          }
        }
      })

      if (authError) {
        setError(authError.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to authentication server. Please verify network or Supabase settings.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-[var(--color-surface)] p-8 rounded-lg shadow-lg border border-[var(--color-border)] w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-[var(--color-success)] mb-4">Registration Successful!</h2>
          <p className="mb-6">Please check your email to verify your account.</p>
          <Link to="/login" className="inline-block bg-[var(--color-primary)] text-white py-2 px-6 rounded hover:bg-opacity-90 transition-opacity">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="bg-[var(--color-surface)] p-8 rounded-lg shadow-lg border border-[var(--color-border)] w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 font-heading">Register</h1>
          <p className="text-[var(--color-text-muted)]">Create your client account</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-[var(--color-danger)] p-3 rounded mb-4 text-sm border-l-4 border-[var(--color-danger)]">
            {error}
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Legal Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-[var(--color-border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mobile Number</label>
            <input 
              type="tel" 
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              pattern="[0-9]{10}"
              title="10 digit mobile number"
              className="w-full p-2 border border-[var(--color-border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-transparent"
              required
            />
          </div>
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
              minLength={8}
              className="w-full p-2 border border-[var(--color-border)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] bg-transparent"
              required
            />
          </div>
          
          <div className="pt-2">
            <div className="flex items-start text-sm text-[var(--color-text-muted)] gap-2">
              <input 
                type="checkbox" 
                id="privacy-consent"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                required 
                className="mt-1 cursor-pointer accent-[var(--color-primary)]" 
              />
              <label htmlFor="privacy-consent" className="cursor-pointer select-none">
                I accept the{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setIsPrivacyModalOpen(true)
                  }}
                  className="text-[var(--color-primary)] font-semibold underline hover:text-[var(--color-accent)] transition-colors cursor-pointer"
                >
                  Data Privacy Policy and Storage Consent
                </button>.
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[var(--color-primary)] text-white py-2 px-4 rounded hover:bg-opacity-90 transition-opacity font-medium mt-4 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--color-accent)] hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal 
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onAccept={() => setPrivacyAccepted(true)}
      />
    </div>
  )
}

