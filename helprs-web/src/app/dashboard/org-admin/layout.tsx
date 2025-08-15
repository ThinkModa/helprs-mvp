'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { CalendarProvider } from '@/contexts/calendar-context'

export default function OrgAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, dbUser, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

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

  const isActiveRoute = (route: string) => {
    return pathname === route
  }

  return (
    <CalendarProvider>
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
        {/* Left Sidebar */}
        <div style={{
          width: sidebarOpen ? '240px' : '0px',
          background: '#1f2937',
          color: 'white',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          zIndex: 1000
        }}>
          {/* Logo */}
          <div style={{ padding: '20px', borderBottom: '1px solid #374151' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Helprs</h2>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1, overflowY: 'auto', padding: '20px 0' }}>
            {/* SCHEDULING Section */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', padding: '0 20px', marginBottom: '15px', textTransform: 'uppercase' }}>
                Scheduling
              </h3>
              <div style={{ padding: '0 20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: isActiveRoute('/dashboard/org-admin/schedule') ? '#374151' : 'transparent',
                  color: isActiveRoute('/dashboard/org-admin/schedule') ? 'white' : '#d1d5db',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => router.push('/dashboard/org-admin/schedule')}
                onMouseOver={(e) => {
                  if (!isActiveRoute('/dashboard/org-admin/schedule')) {
                    e.currentTarget.style.background = '#374151'
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActiveRoute('/dashboard/org-admin/schedule')) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#d1d5db'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }
                }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  Schedule
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: isActiveRoute('/dashboard/org-admin/calendars') ? '#374151' : 'transparent',
                  color: isActiveRoute('/dashboard/org-admin/calendars') ? 'white' : '#d1d5db',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginTop: '4px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => router.push('/dashboard/org-admin/calendars')}
                onMouseOver={(e) => {
                  if (!isActiveRoute('/dashboard/org-admin/calendars')) {
                    e.currentTarget.style.background = '#374151'
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActiveRoute('/dashboard/org-admin/calendars')) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#d1d5db'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }
                }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  Calendars
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: isActiveRoute('/dashboard/org-admin/appointments') ? '#374151' : 'transparent',
                  color: isActiveRoute('/dashboard/org-admin/appointments') ? 'white' : '#d1d5db',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginTop: '4px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => router.push('/dashboard/org-admin/appointments')}
                onMouseOver={(e) => {
                  if (!isActiveRoute('/dashboard/org-admin/appointments')) {
                    e.currentTarget.style.background = '#374151'
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActiveRoute('/dashboard/org-admin/appointments')) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#d1d5db'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }
                }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12,6 12,12 16,14"></polyline>
                  </svg>
                  Appointments
                </div>
              </div>
            </div>

            {/* OPERATIONS Section */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', padding: '0 20px', marginBottom: '15px', textTransform: 'uppercase' }}>
                Operations
              </h3>
              <div style={{ padding: '0 20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: isActiveRoute('/dashboard/org-admin/forms') ? '#374151' : 'transparent',
                  color: isActiveRoute('/dashboard/org-admin/forms') ? 'white' : '#d1d5db',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => router.push('/dashboard/org-admin/forms')}
                onMouseOver={(e) => {
                  if (!isActiveRoute('/dashboard/org-admin/forms')) {
                    e.currentTarget.style.background = '#374151'
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActiveRoute('/dashboard/org-admin/forms')) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#d1d5db'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }
                }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                  </svg>
                  Forms
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: isActiveRoute('/dashboard/org-admin/payments') ? '#374151' : 'transparent',
                  color: isActiveRoute('/dashboard/org-admin/payments') ? 'white' : '#d1d5db',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginTop: '4px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => router.push('/dashboard/org-admin/payments')}
                onMouseOver={(e) => {
                  if (!isActiveRoute('/dashboard/org-admin/payments')) {
                    e.currentTarget.style.background = '#374151'
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActiveRoute('/dashboard/org-admin/payments')) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#d1d5db'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }
                }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  Payments
                </div>
              </div>
            </div>

            {/* PEOPLE Section */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', padding: '0 20px', marginBottom: '15px', textTransform: 'uppercase' }}>
                People
              </h3>
              <div style={{ padding: '0 20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: isActiveRoute('/dashboard/org-admin/workers') ? '#374151' : 'transparent',
                  color: isActiveRoute('/dashboard/org-admin/workers') ? 'white' : '#d1d5db',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => router.push('/dashboard/org-admin/workers')}
                onMouseOver={(e) => {
                  if (!isActiveRoute('/dashboard/org-admin/workers')) {
                    e.currentTarget.style.background = '#374151'
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActiveRoute('/dashboard/org-admin/workers')) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#d1d5db'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }
                }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  Workers
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: isActiveRoute('/dashboard/org-admin/customers') ? '#374151' : 'transparent',
                  color: isActiveRoute('/dashboard/org-admin/customers') ? 'white' : '#d1d5db',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginTop: '4px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => router.push('/dashboard/org-admin/customers')}
                onMouseOver={(e) => {
                  if (!isActiveRoute('/dashboard/org-admin/customers')) {
                    e.currentTarget.style.background = '#374151'
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActiveRoute('/dashboard/org-admin/customers')) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#d1d5db'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }
                }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Customers
                </div>
              </div>
            </div>

            {/* ANALYTICS Section */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', padding: '0 20px', marginBottom: '15px', textTransform: 'uppercase' }}>
                Analytics
              </h3>
              <div style={{ padding: '0 20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: isActiveRoute('/dashboard/org-admin/reports') ? '#374151' : 'transparent',
                  color: isActiveRoute('/dashboard/org-admin/reports') ? 'white' : '#d1d5db',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => router.push('/dashboard/org-admin/reports')}
                onMouseOver={(e) => {
                  if (!isActiveRoute('/dashboard/org-admin/reports')) {
                    e.currentTarget.style.background = '#374151'
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActiveRoute('/dashboard/org-admin/reports')) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#d1d5db'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }
                }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                  Reports
                </div>
              </div>
            </div>

            {/* ADMIN Section */}
            <div>
              <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', padding: '0 20px', marginBottom: '15px', textTransform: 'uppercase' }}>
                Admin
              </h3>
              <div style={{ padding: '0 20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: isActiveRoute('/dashboard/org-admin/settings') ? '#374151' : 'transparent',
                  color: isActiveRoute('/dashboard/org-admin/settings') ? 'white' : '#d1d5db',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => router.push('/dashboard/org-admin/settings')}
                onMouseOver={(e) => {
                  if (!isActiveRoute('/dashboard/org-admin/settings')) {
                    e.currentTarget.style.background = '#374151'
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActiveRoute('/dashboard/org-admin/settings')) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#d1d5db'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }
                }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  Settings
                </div>
              </div>
            </div>
          </nav>

          {/* Sign Out */}
          <div style={{ padding: '20px', borderTop: '1px solid #374151', flexShrink: 0 }}>
            <button
              onClick={signOut}
              style={{
                width: '80%',
                margin: '0 auto',
                display: 'block',
                padding: '10px 16px',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#b91c1c'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#dc2626'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ 
          marginLeft: sidebarOpen ? '240px' : '0px', 
          flex: 1, 
          background: '#f9fafb',
          transition: 'margin-left 0.3s ease'
        }}>
          {/* Header */}
          <header style={{
            background: 'white',
            padding: '20px 30px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  padding: '8px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f3f4f6'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            </div>
          </header>

          {/* Page Content */}
          <div style={{ padding: '30px' }}>
            {children}
          </div>
        </div>
      </div>
    </CalendarProvider>
  )
}
