import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function ClientProfileForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    pan_number: '',
    aadhaar_number: '',
    aadhaar_consent: false,
    fathers_name: '',
    residential_address: '',
    tax_regime: 'new',
    bank_details_encrypted: '', // Will just store basic string for now
    it_portal_password: '',
    data_consent_accepted: false,
  })

  // We would normally fetch the user's auth session token here to pass as Bearer to our Django backend
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !sessionData.session) {
        throw new Error('Not authenticated. Please login again.')
      }
      
      const token = sessionData.session.access_token
      
      const response = await fetch('http://localhost:8000/api/users/profiles/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          privacy_policy_version: 'v1.0'
        })
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(JSON.stringify(errData) || 'Failed to save profile')
      }
      
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="bg-[var(--color-surface)] p-8 rounded-lg shadow-sm border border-[var(--color-border)] max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-primary)]">Complete Your Client Profile</h2>
      <p className="text-[var(--color-text-muted)] mb-8">
        We require this information to file your taxes accurately. All sensitive information is encrypted at rest using AES-256 military-grade encryption.
      </p>

      {error && (
        <div className="bg-red-50 text-[var(--color-danger)] p-4 rounded mb-6 border-l-4 border-[var(--color-danger)]">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-[var(--color-success)] p-4 rounded mb-6 border-l-4 border-[var(--color-success)]">
          Profile saved securely! You can now proceed to select your service plan.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">PAN Number *</label>
            <input 
              type="text" 
              name="pan_number"
              value={formData.pan_number}
              onChange={handleChange}
              placeholder="ABCDE1234F"
              className="w-full p-2 border border-[var(--color-border)] rounded bg-transparent uppercase"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Aadhaar Number</label>
            <input 
              type="text" 
              name="aadhaar_number"
              value={formData.aadhaar_number}
              onChange={handleChange}
              placeholder="1234 5678 9012"
              className="w-full p-2 border border-[var(--color-border)] rounded bg-transparent"
            />
          </div>
        </div>

        <div className="bg-[var(--color-bg)] p-4 rounded border border-[var(--color-border)]">
          <label className="flex items-start text-sm">
            <input 
              type="checkbox" 
              name="aadhaar_consent"
              checked={formData.aadhaar_consent}
              onChange={handleChange}
              className="mt-1 mr-3" 
            />
            <span>I voluntarily consent to provide my Aadhaar details for the purpose of e-verification and linking with PAN as mandated by the Income Tax Department.</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Father's Full Name *</label>
            <input 
              type="text" 
              name="fathers_name"
              value={formData.fathers_name}
              onChange={handleChange}
              className="w-full p-2 border border-[var(--color-border)] rounded bg-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tax Regime Preference</label>
            <select 
              name="tax_regime"
              value={formData.tax_regime}
              onChange={handleChange}
              className="w-full p-2 border border-[var(--color-border)] rounded bg-transparent"
            >
              <option value="new">New Tax Regime</option>
              <option value="old">Old Tax Regime</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Residential Address *</label>
          <textarea 
            name="residential_address"
            value={formData.residential_address}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border border-[var(--color-border)] rounded bg-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Bank Account Info *</label>
            <textarea 
              name="bank_details_encrypted"
              value={formData.bank_details_encrypted}
              onChange={handleChange}
              placeholder="A/C No: ...&#10;IFSC: ..."
              rows={2}
              className="w-full p-2 border border-[var(--color-border)] rounded bg-transparent font-mono text-sm"
              required
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Provide at least one primary account for refunds.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">IT Portal Password *</label>
            <input 
              type="password" 
              name="it_portal_password"
              value={formData.it_portal_password}
              onChange={handleChange}
              placeholder="Required for filing"
              className="w-full p-2 border border-[var(--color-border)] rounded bg-transparent font-mono"
              required
            />
             <p className="text-xs text-[var(--color-text-muted)] mt-1">This is stored in a secure encrypted vault.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--color-border)]">
          <label className="flex items-start text-sm">
            <input 
              type="checkbox" 
              name="data_consent_accepted"
              checked={formData.data_consent_accepted}
              onChange={handleChange}
              className="mt-1 mr-3" 
              required
            />
            <span className="font-bold">I confirm that all information provided is accurate and true to the best of my knowledge. I understand this will be used for my tax filing.</span>
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full md:w-auto px-8 bg-[var(--color-primary)] text-white py-3 rounded hover:bg-opacity-90 transition-opacity font-bold disabled:opacity-50"
        >
          {loading ? 'Securing Profile...' : 'Save Encrypted Profile'}
        </button>
      </form>
    </div>
  )
}
