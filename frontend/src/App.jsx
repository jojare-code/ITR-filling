import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

import Login from './pages/Login'
import Register from './pages/Register'
import ClientProfileForm from './components/ClientProfileForm'
import ServiceSelection from './components/ServiceSelection'
import PaymentIntake from './components/PaymentIntake'
import DocumentUpload from './components/DocumentUpload'
import QueryManager from './components/QueryManager'
import WorkDelivery from './components/WorkDelivery'
import FeedbackForm from './components/FeedbackForm'
import AuditViewer from './components/AuditViewer'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => {
        setSession(data?.session || null)
      })
      .catch((err) => {
        console.error("Failed to get Supabase auth session:", err)
        setSession(null)
      })
      .finally(() => {
        setLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription?.unsubscribe?.()
  }, [])

  const [activeOrder, setActiveOrder] = useState(null)
  
  const fetchActiveOrder = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/orders/orders/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const orders = await response.json()
        if (orders.length > 0) {
          setActiveOrder(orders[0]) // Get the most recent order
        }
      }
    } catch (err) {
      console.error("Failed to fetch order", err)
    }
  }

  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    if (session) {
      fetchActiveOrder(session.access_token)
      checkUserRole(session.access_token)
    }
  }, [session])

  const checkUserRole = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/users/profile/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setUserRole(data.user.role)
      }
    } catch (err) {
      console.error("Failed to fetch user role", err)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          session ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          session ? (
            <div className="min-h-screen bg-[var(--color-bg)] pb-12">
              <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] p-4 shadow-sm">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                  <h1 className="text-xl font-bold font-heading text-[var(--color-primary)]">ITR Dashboard</h1>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[var(--color-text-muted)]">{session.user.email}</span>
                    <button 
                      onClick={() => supabase.auth.signOut()}
                      className="border border-[var(--color-border)] px-4 py-1.5 rounded text-sm text-[var(--color-danger)] hover:bg-red-50 transition"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </header>
              <main className="max-w-6xl mx-auto mt-8 px-4 space-y-12">
                <section>
                  <ClientProfileForm />
                </section>
                
                <section className="pt-12 border-t border-[var(--color-border)]">
                  {!activeOrder && (
                    <ServiceSelection 
                      onOrderCreated={() => fetchActiveOrder(session.access_token)} 
                    />
                  )}
                  {activeOrder && activeOrder.status === 'pending_payment' && (
                    <PaymentIntake 
                      orderDetails={activeOrder} 
                      onPaymentSubmitted={() => fetchActiveOrder(session.access_token)} 
                    />
                  )}
                  {activeOrder && activeOrder.status === 'documents_pending' && (
                    <DocumentUpload 
                      orderDetails={activeOrder} 
                      onUploadComplete={() => fetchActiveOrder(session.access_token)} 
                    />
                  )}
                  {activeOrder && ['processing', 'query_raised', 'review', 'completed'].includes(activeOrder.status) && (
                    <div className="space-y-8">
                      <div className="text-center p-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                        <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-2">Order In Progress</h2>
                        <p className="text-[var(--color-text-muted)]">
                          Your ITR work order is currently: <strong className="uppercase">{activeOrder.status.replace('_', ' ')}</strong>
                        </p>
                      </div>

                      <QueryManager orderDetails={activeOrder} />
                      
                      <WorkDelivery 
                        orderDetails={activeOrder} 
                        onDeliveryUpdated={() => fetchActiveOrder(session.access_token)} 
                      />
                    </div>
                  )}
                  {activeOrder && activeOrder.status === 'completed' && (
                    <div className="space-y-8">
                      <div className="text-center p-8 bg-[var(--color-surface)] border border-[var(--color-success)] rounded-lg">
                        <h2 className="text-2xl font-bold text-[var(--color-success)] mb-2">ITR Filed Successfully</h2>
                        <p className="text-[var(--color-text-muted)]">
                          Your ITR has been filed and the work order is now Complete. You can download your final documents from the portal.
                        </p>
                      </div>
                      
                      {userRole === 'client' && (
                        <FeedbackForm orderDetails={activeOrder} />
                      )}
                    </div>
                  )}

                  {userRole === 'owner' && (
                    <AuditViewer />
                  )}
                </section>
              </main>
            </div>
          ) : <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  )
}

export default App
