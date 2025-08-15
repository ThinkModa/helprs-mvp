'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'

export default function CustomersPage() {
  const { user, dbUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !dbUser || dbUser.role !== 'ORG_ADMIN')) {
      router.push('/auth/login')
    }
  }, [user, dbUser, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user || !dbUser || dbUser.role !== 'ORG_ADMIN') {
    return null
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
          Customers
        </h1>
      </div>

      {/* Content */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '60px 40px',
        textAlign: 'center',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#f3f4f6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          color: '#9ca3af'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', margin: '0 0 12px 0' }}>
          Coming Soon
        </h2>
        <p style={{ fontSize: '16px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
          The customers management feature is currently under development.
        </p>
      </div>
    </div>
  )
}
