'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CalendarProps {
  companyId: string
}

interface Appointment {
  id: string
  title: string
  customer: string
  service: string
  day: string
  date: string
  time: string
  status: 'confirmed' | 'pending' | 'cancelled'
  startTime: string
  endTime: string
  workers: string[]
  customerId: string
  appointmentTypeId: string
}

interface TimeSlot {
  time: string
  appointments: Appointment[]
}

interface DayColumn {
  date: Date
  dayName: string
  dayNumber: string
  timeSlots: TimeSlot[]
}

export default function Calendar({ companyId }: CalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  // Generate time slots from 8am to 6pm in 15-minute increments
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

  // Get week dates
  const getWeekDates = () => {
    const start = new Date(currentWeek)
    start.setDate(start.getDate() - start.getDay())
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const weekDates = getWeekDates()

  // Generate calendar data structure
  const generateCalendarData = (): DayColumn[] => {
    return weekDates.map(date => ({
      date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timeSlots: timeSlots.map(time => ({
        time,
        appointments: appointments.filter(apt => {
          const aptDate = new Date(apt.date)
          return aptDate.toDateString() === date.toDateString() && apt.startTime === time
        })
      }))
    }))
  }

  const calendarData = generateCalendarData()

  // Load appointments from database
  useEffect(() => {
    loadAppointments()
  }, [currentWeek, companyId])

  const loadAppointments = async () => {
    setLoading(true)
    try {
      // Temporarily use mock data due to database type issues
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          title: 'Moving Service',
          customer: 'John Smith',
          service: '2 Man Crew',
          day: 'Monday',
          date: '2024-08-19',
          time: '09:00 - 11:00',
          status: 'confirmed',
          startTime: '09:00',
          endTime: '11:00',
          workers: ['Mike Johnson', 'Sarah Wilson'],
          customerId: 'customer_1',
          appointmentTypeId: 'appt_1'
        },
        {
          id: '2',
          title: 'Cleaning Service',
          customer: 'Jane Doe',
          service: 'Deep Clean',
          day: 'Tuesday',
          date: '2024-08-20',
          time: '14:00 - 16:00',
          status: 'pending',
          startTime: '14:00',
          endTime: '16:00',
          workers: ['Alex Brown'],
          customerId: 'customer_2',
          appointmentTypeId: 'appt_2'
        }
      ]

      setAppointments(mockAppointments)
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + duration
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
  }

  // Navigation functions
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeek(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeek(newDate)
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  // Handle time slot click (create new appointment)
  const handleTimeSlotClick = (dayIndex: number, timeSlot: string) => {
    const selectedDate = weekDates[dayIndex]
    setShowCreateModal(true)
    // You can pass the selected date and time to the create modal
  }

  // Handle appointment click (open details)
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
  }

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, appointment: Appointment) => {
    setDraggedAppointment(appointment)
    e.dataTransfer.effectAllowed = 'move'
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  // Handle drop (reschedule appointment)
  const handleDrop = async (e: React.DragEvent, dayIndex: number, timeSlot: string) => {
    e.preventDefault()
    if (!draggedAppointment) return

    const newDate = weekDates[dayIndex]
    const newDateTime = `${newDate.toISOString().split('T')[0]} ${timeSlot}:00`

    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          scheduled_date: newDate.toISOString().split('T')[0],
          scheduled_time: timeSlot
        })
        .eq('id', draggedAppointment.id)

      if (error) throw error

      // Reload appointments
      await loadAppointments()
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
    } finally {
      setDraggedAppointment(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPreviousWeek}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Today
            </button>
            
            <button
              onClick={goToNextWeek}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900">
            {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
          
          <div className="flex items-center space-x-2">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Week View</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All calendars</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-gray-200">
            <div className="p-4 border-r border-gray-200"></div>
            {calendarData.map((day, index) => (
              <div key={index} className="p-4 border-r border-gray-200 text-center">
                <div className="text-sm font-medium text-gray-900">{day.dayName}</div>
                <div className="text-lg font-semibold text-gray-700">{day.dayNumber}</div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="grid grid-cols-8">
            {/* Time Labels */}
            <div className="border-r border-gray-200">
              {timeSlots.map((time, index) => (
                <div key={index} className="h-16 border-b border-gray-100 flex items-center justify-end pr-4">
                  <span className="text-xs text-gray-500 font-medium">
                    {time}
                  </span>
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {calendarData.map((day, dayIndex) => (
              <div key={dayIndex} className="border-r border-gray-200">
                {day.timeSlots.map((timeSlot, timeIndex) => (
                  <div
                    key={timeIndex}
                    className="h-16 border-b border-gray-100 relative hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleTimeSlotClick(dayIndex, timeSlot.time)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, dayIndex, timeSlot.time)}
                  >
                    {timeSlot.appointments.map((appointment, aptIndex) => (
                      <div
                        key={aptIndex}
                        className="absolute inset-1 bg-blue-100 border border-blue-200 rounded-md p-1 cursor-pointer hover:bg-blue-200 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAppointmentClick(appointment)
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, appointment)}
                      >
                        <div className="text-xs font-medium text-blue-900 truncate">
                          {appointment.title}
                        </div>
                        <div className="text-xs text-blue-700 truncate">
                          {appointment.customer}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment Details Sidebar */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
          <div className="bg-white w-1/2 h-full shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Appointment Details</h3>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <p className="text-gray-900">{selectedAppointment.title}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Customer</label>
                  <p className="text-gray-900">{selectedAppointment.customer}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Service</label>
                  <p className="text-gray-900">{selectedAppointment.service}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Date & Time</label>
                  <p className="text-gray-900">{selectedAppointment.day}, {selectedAppointment.date} at {selectedAppointment.time}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    selectedAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    selectedAppointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedAppointment.status}
                  </span>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Assigned Workers</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedAppointment.workers.map((worker, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                        {worker}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Edit Appointment
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
