import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function PaymentIntake({ orderDetails, onPaymentSubmitted }) {
  const [utrNumber, setUtrNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      
      const response = await fetch(`http://localhost:8000/api/orders/orders/${orderDetails.id}/submit_payment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          utr_number: utrNumber,
          amount: orderDetails.final_price,
          payment_method: 'gpay'
        })
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to submit payment details')
      }
      
      onPaymentSubmitted()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Static QR URI formatting standard (UPI)
  const upiId = 'geetanjali.itr@okaxis' // Merchant UPI ID
  const merchantName = 'Geetanjali ITR Filings'
  const finalPrice = orderDetails.final_price
  
  // Create UPI Deep link that could be used in a real QR generator
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${finalPrice}&cu=INR`

  return (
    <div className="bg-[var(--color-surface)] p-8 rounded-lg shadow-sm border border-[var(--color-border)] max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-2">Secure Payment</h2>
        <p className="text-[var(--color-text-muted)]">Please scan the QR code using Google Pay, PhonePe, or any UPI app to transfer ₹{finalPrice}</p>
      </div>

      <div className="flex justify-center mb-8">
        {/* Placeholder for the Static QR Code Image */}
        <div className="w-64 h-64 border-4 border-[var(--color-primary)] rounded-xl flex items-center justify-center bg-white p-4 shadow-inner">
          <div className="text-center">
            {/* In a real app, this would be an actual QR code image generated from the upiLink */}
            <div className="w-48 h-48 bg-gray-200 mb-2 flex items-center justify-center">
               <span className="text-gray-500 text-sm font-mono break-all text-center">{upiLink}</span>
            </div>
            <p className="font-bold">{merchantName}</p>
            <p className="text-sm font-mono text-[var(--color-text-muted)]">{upiId}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-[var(--color-danger)] p-4 rounded mb-6 border-l-4 border-[var(--color-danger)]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 border-t border-[var(--color-border)] pt-6">
        <div>
          <label className="block text-sm font-bold mb-2">Enter 12-Digit UTR / Reference Number *</label>
          <p className="text-xs text-[var(--color-text-muted)] mb-2">After making the payment, enter the transaction reference number below.</p>
          <input 
            type="text" 
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
            placeholder="e.g. 123456789012"
            pattern="[A-Z0-9]{10,20}"
            className="w-full p-3 border border-[var(--color-border)] rounded bg-transparent font-mono tracking-widest uppercase text-center"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || utrNumber.length < 10}
          className="w-full bg-[var(--color-success)] text-white py-3 rounded hover:bg-opacity-90 transition-opacity font-bold disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Submit Payment Proof'}
        </button>
      </form>
    </div>
  )
}
