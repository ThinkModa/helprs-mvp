'use client'

import { useState, useEffect } from 'react'

interface AppointmentCreationPanelProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date | null
  availableCalendars: any[]
  selectedCalendars: string[]
  onAppointmentCreated?: (appointment: any) => void
}

interface Customer {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string
}

interface AppointmentType {
  id: string
  name: string
  description: string
  base_duration: number
  base_price: number
  minimum_price: number
  assignment_type: 'self_assign' | 'auto_assign' | 'manual_assign'
}

interface Form {
  id: string
  name: string
  description: string
  form_required: boolean
  fields: FormField[]
}

interface FormField {
  id: string
  label: string
  field_type: string
  required: boolean
  options?: string[]
}

export default function AppointmentCreationPanel({
  isOpen,
  onClose,
  selectedDate,
  availableCalendars,
  selectedCalendars,
  onAppointmentCreated
}: AppointmentCreationPanelProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    calendarId: '',
    appointmentTypeId: '',
    customerInfo: {
      firstName: '',
      lastName: '',
      phone: '',
      email: ''
    },
    workerCount: 1,
    assignmentType: 'manual_assign' as 'self_assign' | 'auto_assign' | 'manual_assign',
    scheduledDate: selectedDate,
    scheduledTime: '09:00',
    formResponses: {} as Record<string, any>
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [expandedForms, setExpandedForms] = useState<Record<string, boolean>>({})

  // Mock data - will be replaced with real API calls
  const mockCustomers: Customer[] = [
    { id: '1', first_name: 'John', last_name: 'Smith', phone: '+1234567890', email: 'john@email.com' },
    { id: '2', first_name: 'Jane', last_name: 'Doe', phone: '+1234567891', email: 'jane@email.com' },
    { id: '3', first_name: 'John', last_name: 'Johnson', phone: '+1234567892', email: 'john.j@email.com' }
  ]

  const mockAppointmentTypes: AppointmentType[] = [
    { id: '1', name: 'Cleaning Service', description: 'Standard cleaning service', base_duration: 60, base_price: 75.00, minimum_price: 50.00, assignment_type: 'manual_assign' },
    { id: '2', name: 'Maintenance Check', description: 'Routine maintenance', base_duration: 30, base_price: 45.00, minimum_price: 30.00, assignment_type: 'auto_assign' },
    { id: '3', name: 'Security Patrol', description: 'Security monitoring', base_duration: 120, base_price: 120.00, minimum_price: 80.00, assignment_type: 'self_assign' }
  ]

  const mockForms: Form[] = [
    {
      id: '1',
      name: 'Customer Information Form',
      description: 'Basic customer details',
      form_required: true,
      fields: [
        { id: '1', label: 'Customer Name', field_type: 'textbox', required: true },
        { id: '2', label: 'Phone Number', field_type: 'textbox', required: true },
        { id: '3', label: 'Special Instructions', field_type: 'textbox', required: false }
      ]
    },
    {
      id: '2',
      name: 'Service Requirements',
      description: 'Detailed service specifications',
      form_required: false,
      fields: [
        { id: '4', label: 'Service Type', field_type: 'dropdown', required: true, options: ['Standard', 'Deep Clean', 'Premium'] },
        { id: '5', label: 'Urgent Service', field_type: 'yes_no', required: true }
      ]
    }
  ]

  useEffect(() => {
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        scheduledDate: selectedDate
      }))
    }
  }, [selectedDate])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleCustomerInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        [field]: value
      }
    }))
    
    // Show customer dropdown when typing in first name
    if (field === 'firstName' && value.length > 0) {
      setShowCustomerDropdown(true)
    } else if (field === 'firstName' && value.length === 0) {
      setShowCustomerDropdown(false)
    }
  }

  const handleCustomerSelect = (customer: Customer) => {
    setFormData(prev => ({
      ...prev,
      customerInfo: {
        firstName: customer.first_name,
        lastName: customer.last_name,
        phone: customer.phone,
        email: customer.email
      }
    }))
    setShowCustomerDropdown(false)
  }

  const handleFormResponseChange = (formId: string, fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      formResponses: {
        ...prev.formResponses,
        [formId]: {
          ...prev.formResponses[formId],
          [fieldId]: value
        }
      }
    }))
  }

  const toggleFormExpansion = (formId: string) => {
    setExpandedForms(prev => ({
      ...prev,
      [formId]: !prev[formId]
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.calendarId) {
      newErrors.calendarId = 'Please select a calendar'
    }
    if (!formData.appointmentTypeId) {
      newErrors.appointmentTypeId = 'Please select an appointment type'
    }
    if (!formData.customerInfo.firstName) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.customerInfo.lastName) {
      newErrors.lastName = 'Last name is required'
    }
    if (!formData.customerInfo.phone) {
      newErrors.phone = 'Phone number is required'
    }
    if (!formData.customerInfo.email) {
      newErrors.email = 'Email is required'
    }
    if (formData.workerCount < 1) {
      newErrors.workerCount = 'At least 1 worker is required'
    }

    // Validate required forms
    const selectedAppointmentType = mockAppointmentTypes.find(apt => apt.id === formData.appointmentTypeId)
    if (selectedAppointmentType) {
      // This would normally check which forms are assigned to this appointment type
      mockForms.forEach(form => {
        if (form.form_required) {
          form.fields.forEach(field => {
            if (field.required) {
              const fieldValue = formData.formResponses[form.id]?.[field.id]
              if (!fieldValue || fieldValue === '') {
                newErrors[`form_${form.id}_${field.id}`] = `${field.label} is required`
              }
            }
          })
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveDraft = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Create draft appointment object
      const newAppointment = {
        id: `appointment-${Date.now()}`,
        title: `${formData.customerInfo.firstName} ${formData.customerInfo.lastName} - ${mockAppointmentTypes.find(apt => apt.id === formData.appointmentTypeId)?.name || 'Appointment'} (Draft)`,
        date: formData.scheduledDate ? formData.scheduledDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: formData.scheduledTime,
        duration: mockAppointmentTypes.find(apt => apt.id === formData.appointmentTypeId)?.base_duration || 60,
        calendarId: formData.calendarId,
        customerName: `${formData.customerInfo.firstName} ${formData.customerInfo.lastName}`,
        customerInfo: formData.customerInfo,
        appointmentTypeId: formData.appointmentTypeId,
        workerCount: formData.workerCount,
        assignmentType: formData.assignmentType,
        formResponses: formData.formResponses,
        status: 'draft',
        created_at: new Date().toISOString()
      }

      // Call the callback to add appointment to calendar
      if (onAppointmentCreated) {
        onAppointmentCreated(newAppointment)
      }

      console.log('Saving draft appointment:', newAppointment)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      onClose()
    } catch (error) {
      console.error('Error saving draft:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Create appointment object
      const newAppointment = {
        id: `appointment-${Date.now()}`,
        title: `${formData.customerInfo.firstName} ${formData.customerInfo.lastName} - ${mockAppointmentTypes.find(apt => apt.id === formData.appointmentTypeId)?.name || 'Appointment'}`,
        date: formData.scheduledDate ? formData.scheduledDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: formData.scheduledTime,
        duration: mockAppointmentTypes.find(apt => apt.id === formData.appointmentTypeId)?.base_duration || 60,
        calendarId: formData.calendarId,
        customerName: `${formData.customerInfo.firstName} ${formData.customerInfo.lastName}`,
        customerInfo: formData.customerInfo,
        appointmentTypeId: formData.appointmentTypeId,
        workerCount: formData.workerCount,
        assignmentType: formData.assignmentType,
        formResponses: formData.formResponses,
        status: 'scheduled',
        created_at: new Date().toISOString()
      }

      // Call the callback to add appointment to calendar
      if (onAppointmentCreated) {
        onAppointmentCreated(newAppointment)
      }

      console.log('Saving appointment:', newAppointment)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      onClose()
    } catch (error) {
      console.error('Error saving appointment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.first_name.toLowerCase().includes(formData.customerInfo.firstName.toLowerCase()) ||
    customer.last_name.toLowerCase().includes(formData.customerInfo.firstName.toLowerCase())
  )

  const filteredAppointmentTypes = mockAppointmentTypes.filter(apt => {
    // This would normally filter based on the selected calendar
    return true
  })

  const selectedAppointmentType = mockAppointmentTypes.find(apt => apt.id === formData.appointmentTypeId)

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        width: '50%',
        background: 'white',
        height: '100%',
        overflow: 'auto',
        boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#111827' }}>
            Create Appointment
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Step 1: Calendar Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Calendar *
            </label>
            <select
              value={formData.calendarId}
              onChange={(e) => handleInputChange('calendarId', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: errors.calendarId ? '1px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                background: 'white'
              }}
            >
              <option value="">Select a calendar</option>
              {availableCalendars
                .filter(cal => selectedCalendars.includes(cal.id))
                .map(calendar => (
                  <option key={calendar.id} value={calendar.id}>
                    {calendar.name}
                  </option>
                ))}
            </select>
            {errors.calendarId && (
              <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                {errors.calendarId}
              </div>
            )}
          </div>

          {/* Step 2: Appointment Type Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Appointment Type *
            </label>
            <select
              value={formData.appointmentTypeId}
              onChange={(e) => handleInputChange('appointmentTypeId', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: errors.appointmentTypeId ? '1px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                background: 'white'
              }}
            >
              <option value="">Select an appointment type</option>
              {filteredAppointmentTypes.map(apt => (
                <option key={apt.id} value={apt.id}>
                  {apt.name} - ${apt.base_price}
                </option>
              ))}
            </select>
            {errors.appointmentTypeId && (
              <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                {errors.appointmentTypeId}
              </div>
            )}
          </div>

          {/* Step 3: Customer Information */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              Customer Information
            </h3>
            
            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                First Name *
              </label>
              <input
                type="text"
                value={formData.customerInfo.firstName}
                onChange={(e) => handleCustomerInfoChange('firstName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: errors.firstName ? '1px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                  {errors.firstName}
                </div>
              )}

              {/* Customer Auto-complete Dropdown */}
              {showCustomerDropdown && filteredCustomers.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  zIndex: 10,
                  maxHeight: '200px',
                  overflow: 'auto'
                }}>
                  {filteredCustomers.map(customer => (
                    <div
                      key={customer.id}
                      onClick={() => handleCustomerSelect(customer)}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f3f4f6',
                        fontSize: '14px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#f9fafb'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'white'
                      }}
                    >
                      <div style={{ fontWeight: '500', color: '#111827' }}>
                        {customer.first_name} {customer.last_name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {customer.phone} • {customer.email}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Last Name *
              </label>
              <input
                type="text"
                value={formData.customerInfo.lastName}
                onChange={(e) => handleCustomerInfoChange('lastName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: errors.lastName ? '1px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                  {errors.lastName}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.customerInfo.phone}
                onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: errors.phone ? '1px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                  {errors.phone}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Email *
              </label>
              <input
                type="email"
                value={formData.customerInfo.email}
                onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: errors.email ? '1px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Enter email address"
              />
              {errors.email && (
                <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                  {errors.email}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Date & Time *
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="date"
                  value={formData.scheduledDate ? formData.scheduledDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleInputChange('scheduledDate', new Date(e.target.value))}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Workers Needed *
              </label>
              <input
                type="number"
                min="1"
                value={formData.workerCount || 1}
                onChange={(e) => handleInputChange('workerCount', parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: errors.workerCount ? '1px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              {errors.workerCount && (
                <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                  {errors.workerCount}
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Assignment Type Override */}
          {selectedAppointmentType && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Assignment Type
              </label>
              <select
                value={formData.assignmentType}
                onChange={(e) => handleInputChange('assignmentType', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="auto_assign">Auto Assign</option>
                <option value="self_assign">Self Assign</option>
                <option value="manual_assign">Manual Assign</option>
              </select>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Default: {selectedAppointmentType.assignment_type.replace('_', ' ')}
              </div>
            </div>
          )}

          {/* Step 5: Form Integration */}
          {selectedAppointmentType && mockForms.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Forms
              </h3>
              
              {mockForms.map(form => (
                <div key={form.id} style={{ marginBottom: '16px' }}>
                  <div
                    onClick={() => toggleFormExpansion(form.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      background: '#f9fafb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {form.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {form.description}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {form.form_required ? 'Required' : 'Optional'}
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{
                        transform: expandedForms[form.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                  </div>

                  {expandedForms[form.id] && (
                    <div style={{
                      padding: '16px',
                      border: '1px solid #e5e7eb',
                      borderTop: 'none',
                      borderRadius: '0 0 6px 6px',
                      background: 'white'
                    }}>
                      {form.fields.map(field => (
                        <div key={field.id} style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                            {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                          </label>
                          
                          {field.field_type === 'textbox' && (
                            <input
                              type="text"
                              value={formData.formResponses[form.id]?.[field.id] || ''}
                              onChange={(e) => handleFormResponseChange(form.id, field.id, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: errors[`form_${form.id}_${field.id}`] ? '1px solid #ef4444' : '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px'
                              }}
                            />
                          )}

                          {field.field_type === 'dropdown' && field.options && (
                            <select
                              value={formData.formResponses[form.id]?.[field.id] || ''}
                              onChange={(e) => handleFormResponseChange(form.id, field.id, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: errors[`form_${form.id}_${field.id}`] ? '1px solid #ef4444' : '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                background: 'white'
                              }}
                            >
                              <option value="">Select an option</option>
                              {field.options.map(option => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          )}

                          {field.field_type === 'yes_no' && (
                            <div style={{ display: 'flex', gap: '16px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                  type="radio"
                                  name={`form_${form.id}_${field.id}`}
                                  value="yes"
                                  checked={formData.formResponses[form.id]?.[field.id] === 'yes'}
                                  onChange={(e) => handleFormResponseChange(form.id, field.id, e.target.value)}
                                />
                                <span style={{ fontSize: '14px' }}>Yes</span>
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                  type="radio"
                                  name={`form_${form.id}_${field.id}`}
                                  value="no"
                                  checked={formData.formResponses[form.id]?.[field.id] === 'no'}
                                  onChange={(e) => handleFormResponseChange(form.id, field.id, e.target.value)}
                                />
                                <span style={{ fontSize: '14px' }}>No</span>
                              </label>
                            </div>
                          )}

                          {errors[`form_${form.id}_${field.id}`] && (
                            <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                              {errors[`form_${form.id}_${field.id}`]}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '20px',
            marginTop: '24px'
          }}>
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
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = '#4b5563'
                }
              }}
              onMouseOut={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = '#6b7280'
                }
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = '#2563eb'
                }
              }}
              onMouseOut={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = '#3b82f6'
                }
              }}
            >
              {isSubmitting ? 'Saving...' : 'Create Appointment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
