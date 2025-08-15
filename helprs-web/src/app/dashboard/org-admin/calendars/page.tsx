'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useCalendars } from '@/contexts/calendar-context'
import { useRouter } from 'next/navigation'
import CreateCalendarModal from '@/components/calendars/CreateCalendarModal'
import EditCalendarModal from '@/components/calendars/EditCalendarModal'

interface Calendar {
  id: string
  name: string
  description: string
  color: string
  is_active: boolean
  availability_hours: any
  time_slot_duration: number
  created_at: string
}

export default function CalendarsPage() {
  const { user, dbUser, loading } = useAuth()
  const { calendars, loadingCalendars, createCalendar, updateCalendar, toggleCalendarStatus } = useCalendars()
  const router = useRouter()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCalendar, setSelectedCalendar] = useState<Calendar | null>(null)

  useEffect(() => {
    if (!loading && (!user || !dbUser || dbUser.role !== 'ORG_ADMIN')) {
      router.push('/auth/login')
    }
  }, [user, dbUser, loading, router])

  const handleCreateCalendar = (calendarData: any) => {
    createCalendar(calendarData)
    setShowCreateModal(false)
  }

  const handleEditCalendar = (calendarData: any) => {
    if (selectedCalendar) {
      updateCalendar(selectedCalendar.id, calendarData)
    }
    setShowEditModal(false)
    setSelectedCalendar(null)
  }

  const handleToggleCalendarStatus = (calendarId: string) => {
    toggleCalendarStatus(calendarId)
  }

  const handleEditClick = (calendar: Calendar) => {
    setSelectedCalendar(calendar)
    setShowEditModal(true)
  }

  if (loading || loadingCalendars) {
    return <div>Loading...</div>
  }

  if (!user || !dbUser || dbUser.role !== 'ORG_ADMIN') {
    return null
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            Calendars
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#2563eb'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#3b82f6'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Calendar
          </button>
        </div>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Manage your calendars and their availability settings.
        </p>
      </div>

      {/* Calendars Grid */}
      {calendars.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1" style={{ margin: '0 auto 20px' }}>
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
            No calendars yet
          </h3>
          <p style={{ color: '#6b7280', margin: '0 0 20px 0' }}>
            Create your first calendar to start scheduling appointments.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#2563eb'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#3b82f6'
            }}
          >
            Create Calendar
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {calendars.map((calendar) => (
            <div key={calendar.id} style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              {/* Calendar Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    background: calendar.color,
                    flexShrink: 0
                  }}></div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                      {calendar.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: calendar.is_active ? '#10b981' : '#6b7280'
                      }}></div>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        {calendar.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEditClick(calendar)}
                    style={{
                      padding: '6px',
                      background: 'none',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#f3f4f6'
                      e.currentTarget.style.borderColor = '#9ca3af'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'none'
                      e.currentTarget.style.borderColor = '#d1d5db'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => handleToggleCalendarStatus(calendar.id)}
                    style={{
                      padding: '6px',
                      background: calendar.is_active ? '#ef4444' : '#10b981',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = calendar.is_active ? '#dc2626' : '#059669'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = calendar.is_active ? '#ef4444' : '#10b981'
                    }}
                  >
                    {calendar.is_active ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Calendar Description */}
              {calendar.description && (
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                  {calendar.description}
                </p>
              )}

              {/* Calendar Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Time Slots</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                    {calendar.time_slot_duration} minutes
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Created</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                    {new Date(calendar.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Availability Preview */}
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Availability</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                    const dayKey = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][index]
                    const isAvailable = calendar.availability_hours[dayKey]?.enabled !== false
                    return (
                      <div key={day} style={{
                        padding: '4px',
                        textAlign: 'center',
                        fontSize: '10px',
                        fontWeight: '500',
                        color: isAvailable ? '#10b981' : '#6b7280',
                        background: isAvailable ? '#d1fae5' : '#f3f4f6',
                        borderRadius: '4px'
                      }}>
                        {day}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Calendar Modal */}
      {showCreateModal && (
        <CreateCalendarModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateCalendar}
        />
      )}

      {/* Edit Calendar Modal */}
      {showEditModal && selectedCalendar && (
        <EditCalendarModal
          calendar={selectedCalendar}
          onClose={() => {
            setShowEditModal(false)
            setSelectedCalendar(null)
          }}
          onSave={handleEditCalendar}
        />
      )}
    </div>
  )
}
