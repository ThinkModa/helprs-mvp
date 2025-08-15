'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './auth-context'

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

interface CalendarContextType {
  calendars: Calendar[]
  loadingCalendars: boolean
  loadCalendars: () => void
  createCalendar: (calendarData: any) => void
  updateCalendar: (calendarId: string, calendarData: any) => void
  toggleCalendarStatus: (calendarId: string) => void
  getActiveCalendars: () => Calendar[]
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

export function CalendarProvider({ children }: { children: ReactNode }) {
  const { dbUser } = useAuth()
  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [loadingCalendars, setLoadingCalendars] = useState(true)

  const loadCalendars = () => {
    // Mock data for now - will be replaced with Supabase calls
    const mockCalendars: Calendar[] = [
      {
        id: '1',
        name: 'General Services',
        description: 'Default calendar for general services',
        color: '#3b82f6',
        is_active: true,
        availability_hours: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: { start: '10:00', end: '15:00' },
          sunday: { start: '10:00', end: '15:00' }
        },
        time_slot_duration: 15,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Cleaning Services',
        description: 'Specialized calendar for cleaning appointments',
        color: '#10b981',
        is_active: true,
        availability_hours: {
          monday: { start: '08:00', end: '18:00' },
          tuesday: { start: '08:00', end: '18:00' },
          wednesday: { start: '08:00', end: '18:00' },
          thursday: { start: '08:00', end: '18:00' },
          friday: { start: '08:00', end: '18:00' },
          saturday: { start: '09:00', end: '16:00' },
          sunday: { start: '09:00', end: '16:00' }
        },
        time_slot_duration: 30,
        created_at: '2024-01-02T00:00:00Z'
      },
      {
        id: '3',
        name: 'Maintenance',
        description: 'Calendar for maintenance and repair services',
        color: '#f59e0b',
        is_active: false,
        availability_hours: {
          monday: { start: '07:00', end: '19:00' },
          tuesday: { start: '07:00', end: '19:00' },
          wednesday: { start: '07:00', end: '19:00' },
          thursday: { start: '07:00', end: '19:00' },
          friday: { start: '07:00', end: '19:00' },
          saturday: { start: '08:00', end: '17:00' },
          sunday: { start: '08:00', end: '17:00' }
        },
        time_slot_duration: 60,
        created_at: '2024-01-03T00:00:00Z'
      }
    ]
    setCalendars(mockCalendars)
    setLoadingCalendars(false)
  }

  const createCalendar = (calendarData: any) => {
    const newCalendar: Calendar = {
      id: Date.now().toString(),
      name: calendarData.name,
      description: calendarData.description,
      color: calendarData.color,
      is_active: true,
      availability_hours: calendarData.availability_hours,
      time_slot_duration: calendarData.time_slot_duration,
      created_at: new Date().toISOString()
    }
    setCalendars(prev => [...prev, newCalendar])
  }

  const updateCalendar = (calendarId: string, calendarData: any) => {
    setCalendars(prev => prev.map(cal => 
      cal.id === calendarId 
        ? { ...cal, ...calendarData }
        : cal
    ))
  }

  const toggleCalendarStatus = (calendarId: string) => {
    setCalendars(prev => prev.map(cal => 
      cal.id === calendarId 
        ? { ...cal, is_active: !cal.is_active }
        : cal
    ))
  }

  const getActiveCalendars = () => {
    return calendars.filter(calendar => calendar.is_active)
  }

  useEffect(() => {
    if (dbUser?.role === 'ORG_ADMIN') {
      loadCalendars()
    }
  }, [dbUser])

  const value = {
    calendars,
    loadingCalendars,
    loadCalendars,
    createCalendar,
    updateCalendar,
    toggleCalendarStatus,
    getActiveCalendars
  }

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendars() {
  const context = useContext(CalendarContext)
  if (context === undefined) {
    throw new Error('useCalendars must be used within a CalendarProvider')
  }
  return context
}
