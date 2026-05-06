import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function DocumentUpload({ orderDetails, onUploadComplete }) {
  const [phase, setPhase] = useState('questionnaire') // questionnaire, upload, consent
  const [answers, setAnswers] = useState({
    multipleEmployers: false,
    houseProperty: false,
    capitalGains: false
  })
  
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  
  const [consentData, setConsentData] = useState({
    portalPassword: '',
    consentGiven: false
  })

  // Determine required documents based on answers
  const requiredDocuments = ['PAN Card Copy', 'Aadhaar Card Copy', 'Bank Statement']
  if (answers.multipleEmployers) requiredDocuments.push('Form 16 from all employers')
  if (answers.houseProperty) requiredDocuments.push('Home Loan Interest Certificate')
  if (answers.capitalGains) requiredDocuments.push('Capital Gains Statement')

  const handleFileUpload = async (e, category, docType) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploading(true)
    setError(null)
    
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const formData = new FormData()
      formData.append('order', orderDetails.id)
      formData.append('document_category', category)
      formData.append('document_type', docType)
      formData.append('file_name', file.name)
      formData.append('file', file)

      const response = await fetch(`http://localhost:8000/api/documents/documents/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload document')
      }

      const newDoc = await response.json()
      setDocuments([...documents, newDoc])
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleFinalSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    setError(null)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const response = await fetch(`http://localhost:8000/api/documents/documents/complete_collection/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          order_id: orderDetails.id,
          portal_password: consentData.portalPassword,
          consent_given: consentData.consentGiven
        })
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to complete document collection')
      }

      onUploadComplete()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-[var(--color-surface)] p-8 rounded-lg shadow-sm border border-[var(--color-border)] max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold font-heading text-[var(--color-primary)] mb-2">Document Collection</h2>
        <p className="text-[var(--color-text-muted)]">Please provide the necessary documents for your ITR filing</p>
      </div>

      {error && (
        <div className="bg-red-50 text-[var(--color-danger)] p-4 rounded mb-6 border-l-4 border-[var(--color-danger)]">
          {error}
        </div>
      )}

      {/* PHASE 1: Questionnaire */}
      {phase === 'questionnaire' && (
        <div className="space-y-6">
          <h3 className="font-bold text-lg mb-4">Initial Assessment</h3>
          
          <label className="flex items-center gap-3 p-4 border border-[var(--color-border)] rounded hover:bg-gray-50 cursor-pointer">
            <input 
              type="checkbox" 
              checked={answers.multipleEmployers}
              onChange={(e) => setAnswers({...answers, multipleEmployers: e.target.checked})}
              className="w-5 h-5 text-[var(--color-primary)]"
            />
            <span>Did you have income from more than one employer this year?</span>
          </label>

          <label className="flex items-center gap-3 p-4 border border-[var(--color-border)] rounded hover:bg-gray-50 cursor-pointer">
            <input 
              type="checkbox" 
              checked={answers.houseProperty}
              onChange={(e) => setAnswers({...answers, houseProperty: e.target.checked})}
              className="w-5 h-5 text-[var(--color-primary)]"
            />
            <span>Do you have a home loan or income from house property?</span>
          </label>

          <label className="flex items-center gap-3 p-4 border border-[var(--color-border)] rounded hover:bg-gray-50 cursor-pointer">
            <input 
              type="checkbox" 
              checked={answers.capitalGains}
              onChange={(e) => setAnswers({...answers, capitalGains: e.target.checked})}
              className="w-5 h-5 text-[var(--color-primary)]"
            />
            <span>Did you sell any mutual funds, shares, or property?</span>
          </label>

          <button 
            onClick={() => setPhase('upload')}
            className="w-full bg-[var(--color-primary)] text-white py-3 rounded hover:bg-opacity-90 transition font-bold"
          >
            Continue to Document Upload
          </button>
        </div>
      )}

      {/* PHASE 2: Document Upload */}
      {phase === 'upload' && (
        <div className="space-y-6">
          <h3 className="font-bold text-lg mb-4">Required Documents Checklist</h3>
          
          <div className="space-y-4">
            {requiredDocuments.map((docName, idx) => {
              const isUploaded = documents.some(d => d.document_type === docName)
              return (
                <div key={idx} className="flex justify-between items-center p-4 border border-[var(--color-border)] rounded">
                  <div className="flex items-center gap-3">
                    {isUploaded ? (
                      <span className="text-[var(--color-success)] text-xl">✓</span>
                    ) : (
                      <span className="text-gray-300 text-xl">○</span>
                    )}
                    <span className={isUploaded ? 'text-[var(--color-success)] font-medium' : ''}>{docName}</span>
                  </div>
                  
                  {!isUploaded && (
                    <label className="bg-gray-100 px-4 py-2 rounded text-sm cursor-pointer hover:bg-gray-200 transition">
                      Upload
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, 'other', docName)}
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex gap-4 mt-8">
            <button 
              onClick={() => setPhase('questionnaire')}
              className="px-6 py-3 border border-[var(--color-border)] rounded hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button 
              onClick={() => setPhase('consent')}
              className="flex-1 bg-[var(--color-primary)] text-white py-3 rounded hover:bg-opacity-90 transition font-bold"
            >
              All Documents Uploaded
            </button>
          </div>
        </div>
      )}

      {/* PHASE 3: Consent & Password */}
      {phase === 'consent' && (
        <form onSubmit={handleFinalSubmit} className="space-y-6">
          <h3 className="font-bold text-lg mb-4">Final Authorisation</h3>
          
          <div className="p-4 bg-gray-50 rounded border border-[var(--color-border)]">
            <label className="block text-sm font-bold mb-2">Income Tax Portal Password *</label>
            <p className="text-xs text-[var(--color-text-muted)] mb-3">
              This password will be stored securely in an encrypted vault and is required for us to file your return on the portal.
            </p>
            <input 
              type="password" 
              value={consentData.portalPassword}
              onChange={(e) => setConsentData({...consentData, portalPassword: e.target.value})}
              className="w-full p-3 border border-[var(--color-border)] rounded focus:ring-2 focus:ring-[var(--color-primary)]"
              required
            />
          </div>

          <label className="flex items-start gap-3 p-4 border border-[var(--color-border)] rounded hover:bg-gray-50 cursor-pointer">
            <input 
              type="checkbox" 
              checked={consentData.consentGiven}
              onChange={(e) => setConsentData({...consentData, consentGiven: e.target.checked})}
              className="w-5 h-5 mt-1 text-[var(--color-primary)]"
              required
            />
            <span className="text-sm">
              <strong>Explicit Consent:</strong> I authorise Geetanjali Jojare & Associates to upload my Income Tax Return on the Income Tax Portal using my credentials. I understand that if I do not provide consent, the firm will only deliver the XML/JSON file and I will be responsible for uploading it myself.
            </span>
          </label>

          <div className="flex gap-4 mt-8">
            <button 
              type="button"
              onClick={() => setPhase('upload')}
              className="px-6 py-3 border border-[var(--color-border)] rounded hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button 
              type="submit"
              disabled={uploading || !consentData.consentGiven || !consentData.portalPassword}
              className="flex-1 bg-[var(--color-success)] text-white py-3 rounded hover:bg-opacity-90 transition font-bold disabled:opacity-50"
            >
              {uploading ? 'Submitting...' : 'Submit Work Order'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
