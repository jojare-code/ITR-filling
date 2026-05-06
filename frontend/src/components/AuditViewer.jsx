import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AuditViewer({ entityId = null }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    checkUserRoleAndFetchLogs()
  }, [entityId])

  const checkUserRoleAndFetchLogs = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      
      const response = await fetch('http://localhost:8000/api/users/profile/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setUserRole(data.user.role)
        if (data.user.role === 'owner') {
          fetchLogs(token)
        } else {
          setLoading(false)
        }
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const fetchLogs = async (token) => {
    try {
      const url = entityId 
        ? `http://localhost:8000/api/audit/logs/?entity_id=${entityId}`
        : 'http://localhost:8000/api/audit/logs/'
        
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error('Failed to load audit logs')
      
      const data = await response.json()
      setLogs(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading audit logs...</div>
  if (userRole !== 'owner') return null // Only render for owners

  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-lg shadow-sm border border-[var(--color-border)] mt-8 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold font-heading text-[var(--color-primary)]">System Audit Log</h2>
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">Owner Only</span>
      </div>
      
      {error && (
        <div className="bg-red-50 text-[var(--color-danger)] p-4 rounded mb-6 border-l-4 border-[var(--color-danger)]">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-50 border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Actor Role</th>
              <th className="px-4 py-3">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-4 text-center text-[var(--color-text-muted)]">No audit logs found.</td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-[var(--color-border)] hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    log.action === 'CREATED' ? 'bg-green-100 text-green-800' :
                    log.action === 'UPDATED' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">{log.entity_type}</td>
                <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-muted)]">...{log.entity_id.substring(log.entity_id.length - 8)}</td>
                <td className="px-4 py-3">
                  <span className="capitalize">{log.actor_role}</span>
                  {log.actor_email && <div className="text-xs text-[var(--color-text-muted)]">{log.actor_email}</div>}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{log.ip_address || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
