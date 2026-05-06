import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function QueryManager({ orderDetails }) {
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [newQueryText, setNewQueryText] = useState('')
  const [replyText, setReplyText] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    fetchQueries()
    checkUserRole()
  }, [orderDetails.id])

  const checkUserRole = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      // Fetch user profile to get role. Since we don't have a direct /me endpoint easily accessible,
      // we can decode the JWT or fetch user details.
      // For simplicity in this component, we can fetch from a generic endpoint or pass it down.
      // Assuming it's passed down or we check it from local storage/context in a real app.
      // Here we will do a simple fetch to users/profile if possible, but let's assume we can get it from session.
      // Actually, Supabase JWT doesn't have custom roles unless mapped. We'll fetch from API.
      const response = await fetch('http://localhost:8000/api/users/profile/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setUserRole(data.user.role)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchQueries = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      
      const response = await fetch(`http://localhost:8000/api/queries/queries/?order=${orderDetails.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error('Failed to load queries')
      
      const data = await response.json()
      setQueries(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRaiseQuery = async (e) => {
    e.preventDefault()
    if (!newQueryText) return
    
    setSubmitting(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      
      const response = await fetch('http://localhost:8000/api/queries/queries/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          order: orderDetails.id,
          query_text: newQueryText
        })
      })
      
      if (!response.ok) throw new Error('Failed to raise query')
      
      setNewQueryText('')
      fetchQueries()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async (queryId) => {
    const text = replyText[queryId]
    if (!text) return
    
    setSubmitting(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      
      const response = await fetch(`http://localhost:8000/api/queries/queries/${queryId}/reply/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ client_reply: text })
      })
      
      if (!response.ok) throw new Error('Failed to submit reply')
      
      setReplyText({ ...replyText, [queryId]: '' })
      fetchQueries()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = async (queryId) => {
    setSubmitting(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      
      const response = await fetch(`http://localhost:8000/api/queries/queries/${queryId}/close/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error('Failed to close query')
      
      fetchQueries()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div>Loading queries...</div>

  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-lg shadow-sm border border-[var(--color-border)]">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-primary)]">Query Management</h2>
      
      {error && (
        <div className="bg-red-50 text-[var(--color-danger)] p-4 rounded mb-6 border-l-4 border-[var(--color-danger)]">
          {error}
        </div>
      )}

      {/* Staff Only: Raise New Query */}
      {(userRole === 'staff' || userRole === 'owner') && (
        <form onSubmit={handleRaiseQuery} className="mb-8 p-4 bg-gray-50 rounded border border-[var(--color-border)]">
          <h3 className="font-bold mb-2">Raise New Query</h3>
          <textarea 
            value={newQueryText}
            onChange={(e) => setNewQueryText(e.target.value)}
            className="w-full p-3 border border-[var(--color-border)] rounded focus:ring-2 focus:ring-[var(--color-primary)] min-h-[100px] mb-3"
            placeholder="Ask the client for clarification or missing information..."
            required
          />
          <button 
            type="submit"
            disabled={submitting || !newQueryText}
            className="bg-[var(--color-primary)] text-white px-6 py-2 rounded hover:bg-opacity-90 transition font-bold disabled:opacity-50"
          >
            {submitting ? 'Sending...' : 'Send Query to Client'}
          </button>
        </form>
      )}

      {/* Query List */}
      <div className="space-y-6">
        {queries.length === 0 && (
          <p className="text-[var(--color-text-muted)] text-center py-4">No queries have been raised for this order.</p>
        )}
        
        {queries.map(q => (
          <div key={q.id} className="border border-[var(--color-border)] rounded overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-[var(--color-border)] flex justify-between items-start">
              <div>
                <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-2 ${
                  q.status === 'open' ? 'bg-red-100 text-red-800' :
                  q.status === 'replied' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {q.status.toUpperCase()}
                </span>
                <p className="font-medium">{q.query_text}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Raised by {q.raised_by_details?.name || 'Staff'} on {new Date(q.created_at).toLocaleDateString()}
                </p>
              </div>
              
              {(userRole === 'staff' || userRole === 'owner') && q.status !== 'closed' && (
                <button 
                  onClick={() => handleClose(q.id)}
                  disabled={submitting}
                  className="text-xs bg-[var(--color-success)] text-white px-3 py-1 rounded hover:bg-opacity-90"
                >
                  Mark as Closed
                </button>
              )}
            </div>
            
            {q.client_reply && (
              <div className="p-4 bg-[var(--color-surface)]">
                <p className="text-sm font-bold text-[var(--color-text-muted)] mb-1">Client Reply:</p>
                <p className="text-sm">{q.client_reply}</p>
              </div>
            )}
            
            {userRole === 'client' && q.status === 'open' && (
              <div className="p-4 bg-white border-t border-[var(--color-border)]">
                <textarea 
                  value={replyText[q.id] || ''}
                  onChange={(e) => setReplyText({...replyText, [q.id]: e.target.value})}
                  className="w-full p-2 border border-[var(--color-border)] rounded text-sm mb-2"
                  placeholder="Type your reply here..."
                  rows="3"
                />
                <button 
                  onClick={() => handleReply(q.id)}
                  disabled={submitting || !replyText[q.id]}
                  className="bg-[var(--color-success)] text-white px-4 py-1.5 rounded text-sm hover:bg-opacity-90 disabled:opacity-50"
                >
                  Submit Reply
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
