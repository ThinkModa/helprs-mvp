'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, dbUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !dbUser)) {
      router.push('/auth/login')
      return
    }

    if (!loading && dbUser) {
      if (dbUser.role === 'ORG_ADMIN') {
        router.push('/dashboard/org-admin/schedule')
      } else if (dbUser.role === 'SUPER_ADMIN') {
        router.push('/dashboard/super-admin')
      }
    }
  }, [user, dbUser, loading, router])

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f9fafb',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ fontSize: '16px', color: '#6b7280' }}>Loading...</div>
      </div>
    )
  }

  if (!user || !dbUser) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f9fafb',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ fontSize: '16px', color: '#6b7280' }}>Redirecting to login...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{ fontSize: '16px', color: '#6b7280', textAlign: 'center', padding: '20px' }}>
        Redirecting...
      </div>
    </div>
  )
}

