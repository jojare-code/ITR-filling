import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function ServiceSelection() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [discountCode, setDiscountCode] = useState('')
  const [discountResult, setDiscountResult] = useState(null)
  const [discountError, setDiscountError] = useState(null)
  const [validating, setValidating] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Pass down from parent
  const onOrderCreated = arguments[0]?.onOrderCreated || (() => {})

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      
      const response = await fetch('http://localhost:8000/api/plans/service-plans/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to load service plans')
      
      const data = await response.json()
      setPlans(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const validateDiscount = async () => {
    if (!selectedPlan || !discountCode) return
    
    setValidating(true)
    setDiscountError(null)
    setDiscountResult(null)
    
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      
      const response = await fetch('http://localhost:8000/api/plans/service-plans/validate_discount/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: discountCode,
          service_id: selectedPlan.id
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid discount code')
      }
      
      setDiscountResult(data)
    } catch (err) {
      setDiscountError(err.message)
    } finally {
      setValidating(false)
    }
  }

  const getFinalPrice = () => {
    if (discountResult) return discountResult.new_price
    if (selectedPlan) return selectedPlan.base_price
    return '0.00'
  }

  const handleProceedToPayment = async () => {
    if (!selectedPlan) return
    setSubmitting(true)
    setError(null)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const response = await fetch('http://localhost:8000/api/orders/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          service: selectedPlan.id,
          final_price: getFinalPrice(),
          discount_applied: discountResult ? discountResult.discount_applied : '0.00',
          financial_year: 'FY2024-25',
          entity_type: 'individual',
          income_types: selectedPlan.applicable_income_types || [],
          original_or_revised: 'original'
        })
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to create work order')
      }

      onOrderCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading plans...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-[var(--color-primary)]">Select a Service Plan</h2>
        <p className="text-[var(--color-text-muted)]">Choose the plan that best fits your income sources.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-[var(--color-danger)] p-4 rounded border-l-4 border-[var(--color-danger)]">
          {error}
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.length === 0 && !loading && (
          <div className="col-span-2 text-center py-8 text-[var(--color-text-muted)]">
            No service plans are currently available. Please contact support.
          </div>
        )}
        
        {plans.map(plan => (
          <div 
            key={plan.id}
            onClick={() => {
              setSelectedPlan(plan)
              setDiscountResult(null)
              setDiscountError(null)
            }}
            className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
              selectedPlan?.id === plan.id 
                ? 'border-[var(--color-accent)] shadow-md bg-[var(--color-surface)]' 
                : 'border-[var(--color-border)] hover:border-[var(--color-primary)] bg-[var(--color-surface)] opacity-80'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-[var(--color-primary)]">{plan.name}</h3>
              <span className="text-lg font-bold">₹{plan.base_price}</span>
            </div>
            <p className="text-[var(--color-text-muted)] text-sm mb-4 min-h-[40px]">
              {plan.description}
            </p>
            
            {plan.required_documents?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                <p className="text-xs font-bold uppercase mb-2">Required Documents:</p>
                <ul className="text-sm list-disc pl-4 text-[var(--color-text-muted)]">
                  {plan.required_documents.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Order Summary & Discount */}
      {selectedPlan && (
        <div className="bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--color-border)] shadow-sm mt-8">
          <h3 className="text-xl font-bold mb-4">Order Summary</h3>
          
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-[var(--color-border)]">
            <span>{selectedPlan.name}</span>
            <span>₹{selectedPlan.base_price}</span>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Have a discount code?</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 p-2 border border-[var(--color-border)] rounded bg-transparent uppercase"
              />
              <button 
                onClick={validateDiscount}
                disabled={validating || !discountCode}
                className="bg-[var(--color-text-muted)] text-white px-4 py-2 rounded hover:bg-opacity-90 transition-opacity disabled:opacity-50"
              >
                {validating ? 'Applying...' : 'Apply'}
              </button>
            </div>
            
            {discountError && (
              <p className="text-[var(--color-danger)] text-sm mt-2">{discountError}</p>
            )}
            
            {discountResult && (
              <div className="text-[var(--color-success)] text-sm mt-2 flex justify-between items-center bg-green-50 p-2 rounded">
                <span>Discount applied ({discountCode})</span>
                <span>-₹{discountResult.discount_applied}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-xl font-bold pt-4 border-t border-[var(--color-border)]">
            <span>Total to Pay</span>
            <span className="text-[var(--color-primary)]">₹{getFinalPrice()}</span>
          </div>

          <button 
            onClick={handleProceedToPayment}
            disabled={submitting}
            className="w-full mt-6 bg-[var(--color-primary)] text-white py-3 rounded hover:bg-opacity-90 font-bold text-lg shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {submitting ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>
      )}
    </div>
  )
}
