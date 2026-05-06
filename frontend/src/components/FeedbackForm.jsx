import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function FeedbackForm({ orderDetails, onFeedbackSubmitted }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      setError("Please select a star rating.")
      return
    }
    
    setSubmitting(true)
    setError(null)
    
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      
      const response = await fetch('http://localhost:8000/api/feedback/feedback/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          order: orderDetails.id,
          rating: rating,
          comments: comments
        })
      })
      
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to submit feedback')
      }
      
      setSuccess(true)
      if (onFeedbackSubmitted) onFeedbackSubmitted()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 p-6 rounded-lg text-center border border-green-200">
        <h3 className="text-xl font-bold text-[var(--color-success)] mb-2">Thank You!</h3>
        <p className="text-green-800">Your feedback has been received. We appreciate your business!</p>
      </div>
    )
  }

  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-lg shadow-sm border border-[var(--color-border)] mt-8 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-[var(--color-primary)] text-center">Rate Our Service</h2>
      <p className="text-center text-[var(--color-text-muted)] mb-6">Your ITR filing is complete. Please let us know how we did.</p>
      
      {error && (
        <div className="bg-red-50 text-[var(--color-danger)] p-4 rounded mb-6 border-l-4 border-[var(--color-danger)]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`text-4xl px-1 transition ${
                star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'
              }`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
        </div>
        
        <div>
          <label className="block text-sm font-bold mb-2">Additional Comments (Optional)</label>
          <textarea 
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full p-3 border border-[var(--color-border)] rounded focus:ring-2 focus:ring-[var(--color-primary)]"
            rows="4"
            placeholder="Tell us what you loved or what we can improve..."
          />
        </div>
        
        <button 
          type="submit"
          disabled={submitting || rating === 0}
          className="w-full bg-[var(--color-primary)] text-white py-3 rounded hover:bg-opacity-90 transition font-bold disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  )
}
