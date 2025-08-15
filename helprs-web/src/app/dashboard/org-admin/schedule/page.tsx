'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useCalendars } from '@/contexts/calendar-context'
import { useRouter } from 'next/navigation'
import AppointmentCreationPanel from '@/components/scheduling/AppointmentCreationPanel'

export default function SchedulePage() {
  const { user, dbUser, loading } = useAuth()
  const { getActiveCalendars, loadingCalendars } = useCalendars()
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showCalendarFilter, setShowCalendarFilter] = useState(false)
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([])
  const [tempSelectedCalendars, setTempSelectedCalendars] = useState<string[]>([])
  const [appointments, setAppointments] = useState<any[]>([])

  // Memoize available calendars to prevent infinite re-renders
  const availableCalendars = useMemo(() => getActiveCalendars(), [getActiveCalendars])

  useEffect(() => {
    if (!loading && (!user || !dbUser || dbUser.role !== 'ORG_ADMIN')) {
      router.push('/auth/login')
    }
  }, [user, dbUser, loading, router])

  // Load appointments from localStorage
  useEffect(() => {
    if (dbUser?.id) {
      const savedAppointments = localStorage.getItem(`helprs_appointments_${dbUser.id}`)
      if (savedAppointments) {
        try {
          const parsedAppointments = JSON.parse(savedAppointments)
          setAppointments(parsedAppointments)
        } catch (error) {
          console.error('Error parsing saved appointments:', error)
        }
      }
    }
  }, [dbUser])

  // Save appointments to localStorage whenever they change
  useEffect(() => {
    if (dbUser?.id && appointments.length > 0) {
      localStorage.setItem(`helprs_appointments_${dbUser.id}`, JSON.stringify(appointments))
    }
  }, [appointments, dbUser])

  useEffect(() => {
    if (dbUser?.role === 'ORG_ADMIN' && !loadingCalendars && availableCalendars.length > 0) {
      // Load saved calendar preferences
      const savedPreferences = localStorage.getItem(`helprs_calendar_filter_${dbUser.id}`)
      if (savedPreferences) {
        const savedIds = JSON.parse(savedPreferences)
        // Only include calendars that still exist and are active
        const validIds = savedIds.filter((id: string) => 
          availableCalendars.some(cal => cal.id === id)
        )
        setSelectedCalendars(validIds)
        setTempSelectedCalendars(validIds)
      } else {
        // Default to all active calendars
        const allCalendarIds = availableCalendars.map(cal => cal.id)
        setSelectedCalendars(allCalendarIds)
        setTempSelectedCalendars(allCalendarIds)
      }
    }
  }, [dbUser, availableCalendars, loadingCalendars])

  const saveCalendarPreferences = () => {
    if (dbUser?.id) {
      localStorage.setItem(`helprs_calendar_filter_${dbUser.id}`, JSON.stringify(selectedCalendars))
    }
  }

  const handleCalendarToggle = (calendarId: string) => {
    setTempSelectedCalendars(prev => 
      prev.includes(calendarId) 
        ? prev.filter(id => id !== calendarId)
        : [...prev, calendarId]
    )
  }

  const resetToAllCalendars = () => {
    setTempSelectedCalendars(availableCalendars.map(cal => cal.id))
  }

  const applyCalendarFilter = () => {
    setSelectedCalendars(tempSelectedCalendars)
    saveCalendarPreferences()
    setShowCalendarFilter(false)
  }

  const cancelCalendarFilter = () => {
    setTempSelectedCalendars(selectedCalendars)
    setShowCalendarFilter(false)
  }

  const getCalendarCounterText = () => {
    return `${selectedCalendars.length} out of ${availableCalendars.length}`
  }

  // Calendar logic functions
  const getWeekDates = (date: Date) => {
    const start = new Date(date)
    start.setDate(start.getDate() - start.getDay())
    const dates = []
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(start)
      newDate.setDate(start.getDate() + i)
      dates.push(newDate)
    }
    return dates
  }

  const getMonthDates = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    
    // Get first day of month
    const firstDay = new Date(year, month, 1)
    // Get last day of month
    const lastDay = new Date(year, month + 1, 0)
    
    // Get start date (previous month days to fill first week)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const dates = []
    const currentDate = new Date(startDate)
    
    // Generate 42 dates (6 weeks * 7 days)
    for (let i = 0; i < 42; i++) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return dates
  }

  const currentDay = new Date()
  const weekDates = getWeekDates(currentDate)
  const monthDates = getMonthDates(currentDate)

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  const getDisplayTitle = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    } else if (viewMode === 'week') {
      const start = weekDates[0]
      const end = weekDates[6]
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    } else {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    }
  }

  const goToPrevious = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (viewMode === 'month') {
        newDate.setMonth(prev.getMonth() - 1)
      } else if (viewMode === 'week') {
        newDate.setDate(prev.getDate() - 7)
      } else {
        newDate.setDate(prev.getDate() - 1)
      }
      return newDate
    })
  }

  const goToNext = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (viewMode === 'month') {
        newDate.setMonth(prev.getMonth() + 1)
      } else if (viewMode === 'week') {
        newDate.setDate(prev.getDate() + 7)
      } else {
        newDate.setDate(prev.getDate() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleTimeSlotClick = (date: Date, time: string) => {
    setSelectedDate(date)
    setShowCreateModal(true)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowCreateModal(true)
  }

  const handleAppointmentCreated = (newAppointment: any) => {
    setAppointments(prev => [...prev, newAppointment])
  }

  // Mock appointments data - now combined with real appointments
  const mockAppointments = [
    {
      id: '1',
      title: 'Cleaning Service',
      date: '2024-01-15',
      time: '09:00',
      duration: 60,
      calendarId: '2',
      customerName: 'John Smith'
    },
    {
      id: '2',
      title: 'General Maintenance',
      date: '2024-01-15',
      time: '14:00',
      duration: 120,
      calendarId: '1',
      customerName: 'Jane Doe'
    },
    {
      id: '3',
      title: 'Security Check',
      date: '2024-01-16',
      time: '10:00',
      duration: 30,
      calendarId: '1',
      customerName: 'Mike Johnson'
    },
    {
      id: '4',
      title: 'Deep Cleaning',
      date: '2024-01-20',
      time: '11:00',
      duration: 180,
      calendarId: '2',
      customerName: 'Sarah Wilson'
    }
  ]

  // Combine mock appointments with real appointments
  const allAppointments = [...mockAppointments, ...appointments]

  const getAppointmentsForDate = (date: Date) => {
    return allAppointments.filter(apt => {
      const aptDate = new Date(apt.date)
      return aptDate.toDateString() === date.toDateString() &&
             selectedCalendars.includes(apt.calendarId)
    })
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() && 
           date.getFullYear() === currentDate.getFullYear()
  }

  const isToday = (date: Date) => {
    return date.toDateString() === currentDay.toDateString()
  }

  if (loading || loadingCalendars) {
    return <div>Loading...</div>
  }

  if (!user || !dbUser || dbUser.role !== 'ORG_ADMIN') {
    return null
  }

  return (
    <div>
      {/* Calendar Controls */}
      <div style={{ marginBottom: '30px' }}>
        {/* Page Title */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            Schedule
          </h1>
        </div>

        {/* View Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={goToPrevious}
              style={{
                padding: '8px 12px',
                background: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f9fafb'
                e.currentTarget.style.borderColor = '#9ca3af'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.borderColor = '#d1d5db'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
            </button>
            
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 16px' }}>
              {getDisplayTitle()}
            </h2>
            
            <button
              onClick={goToNext}
              style={{
                padding: '8px 12px',
                background: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f9fafb'
                e.currentTarget.style.borderColor = '#9ca3af'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.borderColor = '#d1d5db'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
            </button>
            
            <button
              onClick={goToToday}
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                marginLeft: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#2563eb'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#3b82f6'
              }}
            >
              Today
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '16px' }}>
              <button
                onClick={() => setViewMode('month')}
                style={{
                  padding: '8px 16px',
                  background: viewMode === 'month' ? '#3b82f6' : 'white',
                  color: viewMode === 'month' ? 'white' : '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px 0 0 6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (viewMode !== 'month') {
                    e.currentTarget.style.background = '#f9fafb'
                  }
                }}
                onMouseOut={(e) => {
                  if (viewMode !== 'month') {
                    e.currentTarget.style.background = 'white'
                  }
                }}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                style={{
                  padding: '8px 16px',
                  background: viewMode === 'week' ? '#3b82f6' : 'white',
                  color: viewMode === 'week' ? 'white' : '#374151',
                  border: '1px solid #d1d5db',
                  borderLeft: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (viewMode !== 'week') {
                    e.currentTarget.style.background = '#f9fafb'
                  }
                }}
                onMouseOut={(e) => {
                  if (viewMode !== 'week') {
                    e.currentTarget.style.background = 'white'
                  }
                }}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                style={{
                  padding: '8px 16px',
                  background: viewMode === 'day' ? '#3b82f6' : 'white',
                  color: viewMode === 'day' ? 'white' : '#374151',
                  border: '1px solid #d1d5db',
                  borderLeft: 'none',
                  borderRadius: '0 6px 6px 0',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (viewMode !== 'day') {
                    e.currentTarget.style.background = '#f9fafb'
                  }
                }}
                onMouseOut={(e) => {
                  if (viewMode !== 'day') {
                    e.currentTarget.style.background = 'white'
                  }
                }}
              >
                Day
              </button>
            </div>

            {/* Calendar Filter - Moved to left side */}
            <div style={{ position: 'relative', marginLeft: '16px' }}>
              <button
                onClick={() => setShowCalendarFilter(!showCalendarFilter)}
                style={{
                  padding: '10px 16px',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#9ca3af'
                  e.currentTarget.style.background = '#f9fafb'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db'
                  e.currentTarget.style.background = 'white'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Calendars
              </button>

              {/* Calendar Counter Text */}
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                textAlign: 'center',
                marginTop: '4px'
              }}>
                {getCalendarCounterText()}
              </div>

              {showCalendarFilter && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '16px',
                  minWidth: '280px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  zIndex: 1000
                }}>
                  {availableCalendars.length === 0 ? (
                    <div style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                      No calendars available. Create a calendar first.
                    </div>
                  ) : (
                    <>
                      {/* Calendar List */}
                      <div style={{ marginBottom: '16px' }}>
                        {availableCalendars.map(calendar => (
                          <div key={calendar.id} style={{ marginBottom: '8px' }}>
                            <label style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              color: '#374151'
                            }}>
                              <input
                                type="checkbox"
                                checked={tempSelectedCalendars.includes(calendar.id)}
                                onChange={() => handleCalendarToggle(calendar.id)}
                                style={{ margin: 0 }}
                              />
                              <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '2px',
                                background: calendar.color,
                                flexShrink: 0
                              }}></div>
                              {calendar.name}
                            </label>
                          </div>
                        ))}
                      </div>

                      {/* Counter */}
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        textAlign: 'center',
                        marginBottom: '16px',
                        padding: '8px',
                        background: '#f9fafb',
                        borderRadius: '6px'
                      }}>
                        {tempSelectedCalendars.length} out of {availableCalendars.length} calendars selected
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                        <button
                          onClick={resetToAllCalendars}
                          style={{
                            padding: '8px 12px',
                            background: 'none',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#6b7280',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            flex: 1
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
                          Reset
                        </button>
                        <button
                          onClick={cancelCalendarFilter}
                          style={{
                            padding: '8px 12px',
                            background: 'white',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#374151',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            flex: 1
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#f9fafb'
                            e.currentTarget.style.borderColor = '#9ca3af'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'white'
                            e.currentTarget.style.borderColor = '#d1d5db'
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={applyCalendarFilter}
                          style={{
                            padding: '8px 12px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            flex: 1
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#2563eb'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = '#3b82f6'
                          }}
                        >
                          Apply
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Create New Appointment Button - Moved to right side */}
          <button
            onClick={() => {
              setSelectedDate(new Date())
              setShowCreateModal(true)
            }}
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
            Create New Appointment
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {viewMode === 'month' ? (
          <div>
            {/* Month View Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e5e7eb' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div key={index} style={{
                  padding: '12px',
                  textAlign: 'center',
                  background: '#f9fafb',
                  borderRight: index < 6 ? '1px solid #e5e7eb' : 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Month View Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {monthDates.map((date, index) => {
                const appointments = getAppointmentsForDate(date)
                const isCurrentMonthDate = isCurrentMonth(date)
                const isTodayDate = isToday(date)
                
                return (
                  <div
                    key={index}
                    onClick={() => handleDateClick(date)}
                    style={{
                      minHeight: '120px',
                      padding: '8px',
                      borderRight: (index + 1) % 7 !== 0 ? '1px solid #e5e7eb' : 'none',
                      borderBottom: index < 35 ? '1px solid #e5e7eb' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: isTodayDate ? '#eff6ff' : 'white',
                      position: 'relative'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = isTodayDate ? '#dbeafe' : '#f3f4f6'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = isTodayDate ? '#eff6ff' : 'white'
                    }}
                  >
                    {/* Date Number */}
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: isCurrentMonthDate ? (isTodayDate ? '#3b82f6' : '#111827') : '#9ca3af',
                      marginBottom: '4px'
                    }}>
                      {date.getDate()}
                    </div>

                    {/* Appointments */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {appointments.slice(0, 3).map(apt => (
                        <div key={apt.id} style={{
                          background: availableCalendars.find(cal => cal.id === apt.calendarId)?.color || '#3b82f6',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '11px',
                          fontWeight: '500',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {apt.time} {apt.customerName}
                        </div>
                      ))}
                      {appointments.length > 3 && (
                        <div style={{
                          fontSize: '11px',
                          color: '#6b7280',
                          fontStyle: 'italic'
                        }}>
                          +{appointments.length - 3} more
                        </div>
                      )}
                    </div>

                    {/* Appointment Count Badge */}
                    {appointments.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: '#3b82f6',
                        color: 'white',
                        borderRadius: '10px',
                        padding: '2px 6px',
                        fontSize: '10px',
                        fontWeight: '600',
                        minWidth: '16px',
                        textAlign: 'center'
                      }}>
                        {appointments.length}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : viewMode === 'week' ? (
          <div>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ padding: '12px', background: '#f9fafb', borderRight: '1px solid #e5e7eb' }}></div>
              {weekDates.map((date, index) => (
                <div key={index} style={{
                  padding: '12px',
                  textAlign: 'center',
                  background: '#f9fafb',
                  borderRight: index < 6 ? '1px solid #e5e7eb' : 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: date.toDateString() === currentDay.toDateString() ? '#3b82f6' : '#111827'
                  }}>
                    {date.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            {timeSlots.map((time, timeIndex) => (
              <div key={timeIndex} style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{
                  padding: '8px 12px',
                  background: '#f9fafb',
                  borderRight: '1px solid #e5e7eb',
                  fontSize: '12px',
                  color: '#6b7280',
                  textAlign: 'right'
                }}>
                  {time}
                </div>
                {weekDates.map((date, dateIndex) => (
                  <div
                    key={dateIndex}
                    onClick={() => handleTimeSlotClick(date, time)}
                    style={{
                      padding: '8px',
                      borderRight: dateIndex < 6 ? '1px solid #e5e7eb' : 'none',
                      minHeight: '40px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#f3f4f6'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'white'
                    }}
                  >
                    {/* Check for appointments in this time slot */}
                    {allAppointments
                      .filter(apt => {
                        const aptDate = new Date(apt.date)
                        return aptDate.toDateString() === date.toDateString() && 
                               apt.time === time &&
                               selectedCalendars.includes(apt.calendarId)
                      })
                      .map(apt => (
                        <div key={apt.id} style={{
                          background: availableCalendars.find(cal => cal.id === apt.calendarId)?.color || '#3b82f6',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          marginBottom: '4px'
                        }}>
                          {apt.title}
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div>
            {/* Day View Header */}
            <div style={{ padding: '16px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
            </div>

            {/* Day View Time Slots */}
            {timeSlots.map((time, timeIndex) => (
              <div key={timeIndex} style={{
                display: 'flex',
                borderBottom: '1px solid #e5e7eb',
                minHeight: '60px'
              }}>
                <div style={{
                  width: '80px',
                  padding: '12px',
                  background: '#f9fafb',
                  borderRight: '1px solid #e5e7eb',
                  fontSize: '12px',
                  color: '#6b7280',
                  textAlign: 'right',
                  flexShrink: 0
                }}>
                  {time}
                </div>
                <div
                  onClick={() => handleTimeSlotClick(currentDate, time)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#f3f4f6'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'white'
                  }}
                >
                  {/* Check for appointments in this time slot */}
                  {allAppointments
                    .filter(apt => {
                      const aptDate = new Date(apt.date)
                      return aptDate.toDateString() === currentDate.toDateString() && 
                             apt.time === time &&
                             selectedCalendars.includes(apt.calendarId)
                    })
                    .map(apt => (
                      <div key={apt.id} style={{
                        background: availableCalendars.find(cal => cal.id === apt.calendarId)?.color || '#3b82f6',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        marginBottom: '8px'
                      }}>
                        {apt.title}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointment Creation Panel */}
      <AppointmentCreationPanel
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        selectedDate={selectedDate}
        availableCalendars={availableCalendars}
        selectedCalendars={selectedCalendars}
        onAppointmentCreated={handleAppointmentCreated}
      />
    </div>
  )
}
