'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useCalendars } from '@/contexts/calendar-context'
import { useRouter } from 'next/navigation'

interface AppointmentType {
  id: string
  name: string
  description: string
  base_duration: number
  minimum_price: number
  base_price: number
  assignment_type: 'self_assign' | 'auto_assign' | 'manual_assign'
  is_active: boolean
  created_at: string
  assigned_calendars: string[]
  assigned_forms: string[]
}

interface Calendar {
  id: string
  name: string
  color: string
}

export default function AppointmentsPage() {
  const { user, dbUser, loading } = useAuth()
  const { calendars } = useCalendars()
  const router = useRouter()
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAppointmentType, setSelectedAppointmentType] = useState<AppointmentType | null>(null)
  const [loadingAppointmentTypes, setLoadingAppointmentTypes] = useState(true)

  useEffect(() => {
    if (!loading && (!user || !dbUser || dbUser.role !== 'ORG_ADMIN')) {
      router.push('/auth/login')
    }
  }, [user, dbUser, loading, router])

  useEffect(() => {
    if (dbUser?.role === 'ORG_ADMIN') {
      loadAppointmentTypes()
    }
  }, [dbUser])

  const loadAppointmentTypes = () => {
    // Mock data for now - will be replaced with Supabase calls
    const mockAppointmentTypes: AppointmentType[] = [
      {
        id: '1',
        name: 'Cleaning Service',
        description: 'Standard cleaning service for residential properties',
        base_duration: 60,
        minimum_price: 50.00,
        base_price: 75.00,
        assignment_type: 'manual_assign',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        assigned_calendars: ['1', '2'],
        assigned_forms: []
      },
      {
        id: '2',
        name: 'Maintenance Check',
        description: 'Routine maintenance and inspection service',
        base_duration: 30,
        minimum_price: 30.00,
        base_price: 45.00,
        assignment_type: 'auto_assign',
        is_active: true,
        created_at: '2024-01-02T00:00:00Z',
        assigned_calendars: ['1'],
        assigned_forms: ['1']
      },
      {
        id: '3',
        name: 'Security Patrol',
        description: 'Security patrol and monitoring service',
        base_duration: 120,
        minimum_price: 80.00,
        base_price: 120.00,
        assignment_type: 'self_assign',
        is_active: false,
        created_at: '2024-01-03T00:00:00Z',
        assigned_calendars: ['3'],
        assigned_forms: []
      }
    ]
    setAppointmentTypes(mockAppointmentTypes)
    setLoadingAppointmentTypes(false)
  }

  const handleCreateAppointmentType = (appointmentTypeData: any) => {
    const newAppointmentType: AppointmentType = {
      id: Date.now().toString(),
      name: appointmentTypeData.name,
      description: appointmentTypeData.description,
      base_duration: appointmentTypeData.base_duration,
      minimum_price: appointmentTypeData.minimum_price,
      base_price: appointmentTypeData.base_price,
      assignment_type: appointmentTypeData.assignment_type,
      is_active: true,
      created_at: new Date().toISOString(),
      assigned_calendars: appointmentTypeData.assigned_calendars || [],
      assigned_forms: appointmentTypeData.assigned_forms || []
    }
    setAppointmentTypes(prev => [...prev, newAppointmentType])
    setShowCreateModal(false)
  }

  const handleEditAppointmentType = (appointmentTypeData: any) => {
    if (selectedAppointmentType) {
      setAppointmentTypes(prev => prev.map(apt => 
        apt.id === selectedAppointmentType.id 
          ? { ...apt, ...appointmentTypeData }
          : apt
      ))
    }
    setShowEditModal(false)
    setSelectedAppointmentType(null)
  }

  const handleToggleAppointmentTypeStatus = (appointmentTypeId: string) => {
    setAppointmentTypes(prev => prev.map(apt => 
      apt.id === appointmentTypeId 
        ? { ...apt, is_active: !apt.is_active }
        : apt
    ))
  }

  const handleEditClick = (appointmentType: AppointmentType) => {
    setSelectedAppointmentType(appointmentType)
    setShowEditModal(true)
  }

  const getAssignmentTypeLabel = (type: string) => {
    switch (type) {
      case 'self_assign': return 'Self Assign'
      case 'auto_assign': return 'Auto Assign'
      case 'manual_assign': return 'Manual Assign'
      default: return type
    }
  }

  const getAssignmentTypeColor = (type: string) => {
    switch (type) {
      case 'self_assign': return '#10b981'
      case 'auto_assign': return '#3b82f6'
      case 'manual_assign': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  if (loading || loadingAppointmentTypes) {
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
            Appointment Types
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
            Create Appointment Type
          </button>
        </div>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Create and manage appointment type templates that can be assigned to calendars.
        </p>
      </div>

      {/* Appointment Types Grid */}
      {appointmentTypes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1" style={{ margin: '0 auto 20px' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12,6 12,12 16,14"></polyline>
          </svg>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
            No appointment types yet
          </h3>
          <p style={{ color: '#6b7280', margin: '0 0 20px 0' }}>
            Create your first appointment type to start building your service catalog.
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
            Create Appointment Type
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {appointmentTypes.map((appointmentType) => (
            <div key={appointmentType.id} style={{
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
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                    {appointmentType.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: appointmentType.is_active ? '#10b981' : '#6b7280'
                    }}></div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {appointmentType.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEditClick(appointmentType)}
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
                    onClick={() => handleToggleAppointmentTypeStatus(appointmentType.id)}
                    style={{
                      padding: '6px',
                      background: appointmentType.is_active ? '#ef4444' : '#10b981',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = appointmentType.is_active ? '#dc2626' : '#059669'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = appointmentType.is_active ? '#ef4444' : '#10b981'
                    }}
                  >
                    {appointmentType.is_active ? (
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

              {/* Description */}
              {appointmentType.description && (
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                  {appointmentType.description}
                </p>
              )}

              {/* Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Duration</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                    {appointmentType.base_duration} minutes
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Base Price</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                    ${appointmentType.base_price}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Min Price</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                    ${appointmentType.minimum_price}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Assignment</div>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: 'white',
                    background: getAssignmentTypeColor(appointmentType.assignment_type),
                    padding: '2px 8px',
                    borderRadius: '12px',
                    display: 'inline-block'
                  }}>
                    {getAssignmentTypeLabel(appointmentType.assignment_type)}
                  </div>
                </div>
              </div>

              {/* Calendar Assignments */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Assigned Calendars</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {appointmentType.assigned_calendars.length > 0 ? (
                    appointmentType.assigned_calendars.map(calendarId => {
                      const calendar = calendars.find(cal => cal.id === calendarId)
                      return calendar ? (
                        <div key={calendarId} style={{
                          fontSize: '11px',
                          color: '#374151',
                          background: '#f3f4f6',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '2px',
                            background: calendar.color,
                            flexShrink: 0
                          }}></div>
                          {calendar.name}
                        </div>
                      ) : null
                    })
                  ) : (
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>No calendars assigned</span>
                  )}
                </div>
              </div>

              {/* Form Assignments */}
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Assigned Forms</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {appointmentType.assigned_forms.length > 0 ? (
                    appointmentType.assigned_forms.map(formId => (
                      <div key={formId} style={{
                        fontSize: '11px',
                        color: '#374151',
                        background: '#f3f4f6',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        Form #{formId}
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>No forms assigned</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Appointment Type Modal */}
      {showCreateModal && (
        <CreateAppointmentTypeModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateAppointmentType}
          calendars={calendars}
        />
      )}

      {/* Edit Appointment Type Modal */}
      {showEditModal && selectedAppointmentType && (
        <EditAppointmentTypeModal
          appointmentType={selectedAppointmentType}
          onClose={() => {
            setShowEditModal(false)
            setSelectedAppointmentType(null)
          }}
          onSave={handleEditAppointmentType}
          calendars={calendars}
        />
      )}
    </div>
  )
}

// Mock forms data - will be replaced with real data from forms context
const mockForms = [
  { id: '1', name: 'Customer Information Form', description: 'Collect basic customer details' },
  { id: '2', name: 'Service Requirements Checklist', description: 'Detailed checklist for service specifications' },
  { id: '3', name: 'Post-Service Feedback', description: 'Collect customer feedback after service completion' }
]

function CreateAppointmentTypeModal({ onClose, onCreate, calendars }: any) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_duration: 60,
    minimum_price: 0,
    base_price: 0,
    assignment_type: 'manual_assign' as 'self_assign' | 'auto_assign' | 'manual_assign',
    assigned_calendars: [] as string[],
    assigned_forms: [] as string[]
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (formData.base_duration <= 0) {
      newErrors.base_duration = 'Duration must be greater than 0'
    }
    if (formData.minimum_price < 0) {
      newErrors.minimum_price = 'Minimum price cannot be negative'
    }
    if (formData.base_price < 0) {
      newErrors.base_price = 'Base price cannot be negative'
    }
    if (formData.base_price < formData.minimum_price) {
      newErrors.base_price = 'Base price must be greater than or equal to minimum price'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onCreate(formData)
    }
  }

  const toggleCalendar = (calendarId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_calendars: prev.assigned_calendars.includes(calendarId)
        ? prev.assigned_calendars.filter((id: any) => id !== calendarId)
        : [...prev.assigned_calendars, calendarId]
    }))
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '700px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
            Create Appointment Type
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f3f4f6'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'none'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Basic Information */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: errors.name ? '1px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.name ? '#ef4444' : '#d1d5db'
              }}
            />
            {errors.name && (
              <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                {errors.name}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Assignment Type
            </label>
            <select
              value={formData.assignment_type}
              onChange={(e) => handleInputChange('assignment_type', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                background: 'white'
              }}
            >
              <option value="manual_assign">Manual Assign</option>
              <option value="auto_assign">Auto Assign</option>
              <option value="self_assign">Self Assign</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              resize: 'vertical'
            }}
            placeholder="Describe this appointment type..."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Base Duration (minutes) *
            </label>
            <input
              type="number"
              value={formData.base_duration}
              onChange={(e) => handleInputChange('base_duration', parseInt(e.target.value) || 0)}
              min="1"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: errors.base_duration ? '1px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            {errors.base_duration && (
              <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                {errors.base_duration}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Minimum Price ($)
            </label>
            <input
              type="number"
              value={formData.minimum_price}
              onChange={(e) => handleInputChange('minimum_price', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: errors.minimum_price ? '1px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            {errors.minimum_price && (
              <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                {errors.minimum_price}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Base Price ($)
            </label>
            <input
              type="number"
              value={formData.base_price}
              onChange={(e) => handleInputChange('base_price', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: errors.base_price ? '1px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            {errors.base_price && (
              <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                {errors.base_price}
              </div>
            )}
          </div>
        </div>

        {/* Calendar Assignments */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>
            Assign to Calendars
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
            {calendars.map((calendar) => (
              <label key={calendar.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                background: formData.assigned_calendars.includes(calendar.id) ? '#f0f9ff' : 'white'
              }}>
                <input
                  type="checkbox"
                  checked={formData.assigned_calendars.includes(calendar.id)}
                  onChange={() => toggleCalendar(calendar.id)}
                  style={{ margin: 0 }}
                />
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  background: calendar.color,
                  flexShrink: 0
                }}></div>
                <span style={{ fontSize: '14px', color: '#374151' }}>{calendar.name}</span>
              </label>
            ))}
          </div>
          {calendars.length === 0 && (
            <div style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
              No calendars available. Create calendars first.
            </div>
          )}
        </div>

        {/* Form Assignments */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>
            Assign to Forms
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
            {mockForms.map((form) => (
              <label key={form.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                background: formData.assigned_forms.includes(form.id) ? '#f0f9ff' : 'white'
              }}>
                <input
                  type="checkbox"
                  checked={formData.assigned_forms.includes(form.id)}
                  onChange={() => toggleForm(form.id)}
                  style={{ margin: 0 }}
                />
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  background: '#3b82f6',
                  flexShrink: 0
                }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{form.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{form.description}</div>
                </div>
              </label>
            ))}
          </div>
          {mockForms.length === 0 && (
            <div style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
              No forms available. Create forms first.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f9fafb'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
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
            Create Appointment Type
          </button>
        </div>
      </div>
    </div>
  )
}

function EditAppointmentTypeModal({ appointmentType, onClose, onSave, calendars }: any) {
  const [formData, setFormData] = useState({
    name: appointmentType.name,
    description: appointmentType.description,
    base_duration: appointmentType.base_duration,
    minimum_price: appointmentType.minimum_price,
    base_price: appointmentType.base_price,
    assignment_type: appointmentType.assignment_type,
    assigned_calendars: appointmentType.assigned_calendars,
    assigned_forms: appointmentType.assigned_forms
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (formData.base_duration <= 0) {
      newErrors.base_duration = 'Duration must be greater than 0'
    }
    if (formData.minimum_price < 0) {
      newErrors.minimum_price = 'Minimum price cannot be negative'
    }
    if (formData.base_price < 0) {
      newErrors.base_price = 'Base price cannot be negative'
    }
    if (formData.base_price < formData.minimum_price) {
      newErrors.base_price = 'Base price must be greater than or equal to minimum price'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData)
    }
  }

  const toggleCalendar = (calendarId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_calendars: prev.assigned_calendars.includes(calendarId)
        ? prev.assigned_calendars.filter((id: string) => id !== calendarId)
        : [...prev.assigned_calendars, calendarId]
    }))
  }

  const toggleForm = (formId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_forms: prev.assigned_forms.includes(formId)
        ? prev.assigned_forms.filter((id: string) => id !== formId)
        : [...prev.assigned_forms, formId]
    }))
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '700px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
            Edit Appointment Type
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f3f4f6'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'none'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Basic Information */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: errors.name ? '1px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.name ? '#ef4444' : '#d1d5db'
              }}
            />
            {errors.name && (
              <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                {errors.name}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Assignment Type
            </label>
            <select
              value={formData.assignment_type}
              onChange={(e) => handleInputChange('assignment_type', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                background: 'white'
              }}
            >
              <option value="manual_assign">Manual Assign</option>
              <option value="auto_assign">Auto Assign</option>
              <option value="self_assign">Self Assign</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              resize: 'vertical'
            }}
            placeholder="Describe this appointment type..."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Base Duration (minutes) *
            </label>
            <input
              type="number"
              value={formData.base_duration}
              onChange={(e) => handleInputChange('base_duration', parseInt(e.target.value) || 0)}
              min="1"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: errors.base_duration ? '1px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            {errors.base_duration && (
              <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                {errors.base_duration}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Minimum Price ($)
            </label>
            <input
              type="number"
              value={formData.minimum_price}
              onChange={(e) => handleInputChange('minimum_price', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: errors.minimum_price ? '1px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            {errors.minimum_price && (
              <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                {errors.minimum_price}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Base Price ($)
            </label>
            <input
              type="number"
              value={formData.base_price}
              onChange={(e) => handleInputChange('base_price', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: errors.base_price ? '1px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            {errors.base_price && (
              <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                {errors.base_price}
              </div>
            )}
          </div>
        </div>

        {/* Calendar Assignments */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>
            Assign to Calendars
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
            {calendars.map((calendar) => (
              <label key={calendar.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                background: formData.assigned_calendars.includes(calendar.id) ? '#f0f9ff' : 'white'
              }}>
                <input
                  type="checkbox"
                  checked={formData.assigned_calendars.includes(calendar.id)}
                  onChange={() => toggleCalendar(calendar.id)}
                  style={{ margin: 0 }}
                />
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  background: calendar.color,
                  flexShrink: 0
                }}></div>
                <span style={{ fontSize: '14px', color: '#374151' }}>{calendar.name}</span>
              </label>
            ))}
          </div>
          {calendars.length === 0 && (
            <div style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
              No calendars available. Create calendars first.
            </div>
          )}
        </div>

        {/* Form Assignments */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>
            Assign to Forms
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
            {mockForms.map((form) => (
              <label key={form.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                background: formData.assigned_forms.includes(form.id) ? '#f0f9ff' : 'white'
              }}>
                <input
                  type="checkbox"
                  checked={formData.assigned_forms.includes(form.id)}
                  onChange={() => toggleForm(form.id)}
                  style={{ margin: 0 }}
                />
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  background: '#3b82f6',
                  flexShrink: 0
                }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{form.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{form.description}</div>
                </div>
              </label>
            ))}
          </div>
          {mockForms.length === 0 && (
            <div style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
              No forms available. Create forms first.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f9fafb'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
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
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
