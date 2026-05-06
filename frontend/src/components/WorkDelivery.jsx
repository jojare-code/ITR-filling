import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function WorkDelivery({ orderDetails, onDeliveryUpdated }) {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [submitting, setSubmitting] = useState(false)
  const [userRole, setUserRole] = useState(null)

  // State for rejecting
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchDeliveries()
    checkUserRole()
  }, [orderDetails.id])

  const checkUserRole = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
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

  const fetchDeliveries = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      
      const response = await fetch(`http://localhost:8000/api/deliveries/deliveries/?order=${orderDetails.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error('Failed to load deliveries')
      
      const data = await response.json()
      setDeliveries(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitDelivery = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      
      const response = await fetch('http://localhost:8000/api/deliveries/deliveries/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          order: orderDetails.id,
          delivery_type: orderDetails.it_portal_upload_consent ? 'portal_upload' : 'xml_delivery'
        })
      })
      
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to submit delivery. Make sure all queries are closed.')
      }
      
      fetchDeliveries()
      if(onDeliveryUpdated) onDeliveryUpdated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (deliveryId) => {
    setSubmitting(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      
      const response = await fetch(`http://localhost:8000/api/deliveries/deliveries/${deliveryId}/approve/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error('Failed to approve delivery')
      
      fetchDeliveries()
      if(onDeliveryUpdated) onDeliveryUpdated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async (deliveryId) => {
    if (!rejectionReason) return
    setSubmitting(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      
      const response = await fetch(`http://localhost:8000/api/deliveries/deliveries/${deliveryId}/reject/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rejection_reason: rejectionReason })
      })
      
      if (!response.ok) throw new Error('Failed to reject delivery')
      
      setRejectingId(null)
      setRejectionReason('')
      fetchDeliveries()
      if(onDeliveryUpdated) onDeliveryUpdated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div>Loading delivery data...</div>

  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-lg shadow-sm border border-[var(--color-border)] mt-8">
      <h2 className="text-2xl font-bold mb-6 text-[var(--color-primary)]">Work Delivery</h2>
      
      {error && (
        <div className="bg-red-50 text-[var(--color-danger)] p-4 rounded mb-6 border-l-4 border-[var(--color-danger)]">
          {error}
        </div>
      )}

      {/* Staff Action */}
      {(userRole === 'staff') && (
        <div className="mb-8 p-4 bg-gray-50 rounded border border-[var(--color-border)]">
          <h3 className="font-bold mb-2">Submit Work for Approval</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Upload any final computation documents (via Document Management) and submit the final output to the Owner for review.
          </p>
          <button 
            onClick={handleSubmitDelivery}
            disabled={submitting}
            className="bg-[var(--color-primary)] text-white px-6 py-2 rounded hover:bg-opacity-90 transition font-bold disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit to Owner'}
          </button>
        </div>
      )}

      {/* Deliveries List */}
      <div className="space-y-4">
        {deliveries.length === 0 && (
          <p className="text-[var(--color-text-muted)] text-center py-4">No deliveries have been submitted yet.</p>
        )}
        
        {deliveries.map(d => (
          <div key={d.id} className="border border-[var(--color-border)] rounded overflow-hidden">
            <div className="bg-white p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-2 ${
                  d.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  d.approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {d.approval_status.toUpperCase()}
                </span>
                <p className="font-medium">Delivery via {d.delivery_type.replace('_', ' ')}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Submitted by {d.submitted_by_details?.name} on {new Date(d.submitted_at).toLocaleDateString()}
                </p>
                
                {d.approval_status === 'rejected' && (
                  <p className="text-sm text-[var(--color-danger)] mt-2 font-medium">
                    Reason: {d.rejection_reason}
                  </p>
                )}
              </div>
              
              {/* Owner Actions */}
              {userRole === 'owner' && d.approval_status === 'pending' && (
                <div className="mt-4 md:mt-0 flex gap-2">
                  <button 
                    onClick={() => handleApprove(d.id)}
                    disabled={submitting}
                    className="bg-[var(--color-success)] text-white px-4 py-2 rounded hover:bg-opacity-90 transition font-bold text-sm disabled:opacity-50"
                  >
                    Approve & File
                  </button>
                  <button 
                    onClick={() => setRejectingId(d.id)}
                    disabled={submitting}
                    className="bg-white border border-[var(--color-danger)] text-[var(--color-danger)] px-4 py-2 rounded hover:bg-red-50 transition font-bold text-sm disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
            
            {/* Reject Form */}
            {rejectingId === d.id && (
              <div className="p-4 bg-red-50 border-t border-red-100">
                <textarea 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide reason for rejection..."
                  className="w-full p-2 border border-[var(--color-border)] rounded text-sm mb-2"
                  rows="2"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleReject(d.id)}
                    disabled={!rejectionReason || submitting}
                    className="bg-[var(--color-danger)] text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-opacity-90 disabled:opacity-50"
                  >
                    Confirm Rejection
                  </button>
                  <button 
                    onClick={() => setRejectingId(null)}
                    className="px-3 py-1.5 rounded text-sm hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
