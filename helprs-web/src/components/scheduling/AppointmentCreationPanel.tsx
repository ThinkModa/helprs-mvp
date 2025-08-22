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
  const initialFormData = {
    calendarId: '',
    appointmentTypeId: '',
    customerInfo: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: ''
    },
    workerCount: 1,
    assignmentType: 'manual_assign' as 'self_assign' | 'auto_assign' | 'manual_assign',
    scheduledDate: selectedDate,
    scheduledTime: '09:00',
    formResponses: {} as Record<string, any>
  }

  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [expandedForms, setExpandedForms] = useState<Record<string, boolean>>({})

  const [customers, setCustomers] = useState<Customer[]>([])
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([])
  const [forms, setForms] = useState<Form[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Load data from APIs
  const loadData = async () => {
    try {
      setLoadingData(true)
      
      // Load customers
      const customersResponse = await fetch('/api/v1/customers?company_id=test-company-1')
      const customersData = await customersResponse.json()
      setCustomers(customersData.customers || [])

      // Load appointment types
      const appointmentTypesResponse = await fetch('/api/v1/appointment-types?company_id=test-company-1')
      const appointmentTypesData = await appointmentTypesResponse.json()
      setAppointmentTypes(appointmentTypesData.appointment_types || [])

      // Load forms
      const formsResponse = await fetch('/api/v1/forms?company_id=test-company-1')
      const formsData = await formsResponse.json()
      setForms(formsData.forms || [])

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  // Load forms for specific appointment type
  const loadFormsForAppointmentType = async (appointmentTypeId: string) => {
    try {
      const response = await fetch(`/api/v1/forms?appointment_type_id=${appointmentTypeId}&company_id=test-company-1`)
      const data = await response.json()
      setForms(data.forms || [])
    } catch (error) {
      console.error('Error loading forms for appointment type:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      ...initialFormData,
      scheduledDate: selectedDate
    })
    setErrors({})
    setCurrentStep(1)
    setShowCustomerDropdown(false)
    setExpandedForms({})
  }

  useEffect(() => {
    loadData()
  }, [])

  // Load forms when appointment type changes
  useEffect(() => {
    if (formData.appointmentTypeId) {
      loadFormsForAppointmentType(formData.appointmentTypeId)
    }
  }, [formData.appointmentTypeId])

  useEffect(() => {
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        scheduledDate: selectedDate
      }))
    }
  }, [selectedDate])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm()
    }
  }, [isOpen])

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
        email: customer.email,
        address: customer.address || ''
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
    if (!formData.customerInfo.address) {
      newErrors.address = 'Address is required'
    }
    if (formData.workerCount < 1) {
      newErrors.workerCount = 'At least 1 worker is required'
    }

    // Validate required forms
    const selectedAppointmentType = appointmentTypes.find(apt => apt.id === formData.appointmentTypeId)
    if (selectedAppointmentType) {
      // This would normally check which forms are assigned to this appointment type
      forms.forEach(form => {
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
        title: `${formData.customerInfo.firstName} ${formData.customerInfo.lastName} - ${appointmentTypes.find(apt => apt.id === formData.appointmentTypeId)?.name || 'Appointment'} (Draft)`,
        date: formData.scheduledDate ? 
          `${formData.scheduledDate.getFullYear()}-${String(formData.scheduledDate.getMonth() + 1).padStart(2, '0')}-${String(formData.scheduledDate.getDate()).padStart(2, '0')}` : 
          new Date().toISOString().split('T')[0],
        time: formData.scheduledTime,
        duration: appointmentTypes.find(apt => apt.id === formData.appointmentTypeId)?.base_duration || 60,
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
      resetForm()
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
      // Get selected appointment type for pricing
      const selectedAppointmentType = appointmentTypes.find(type => type.id === formData.appointmentTypeId)
      const basePrice = selectedAppointmentType?.base_price || 0

      // Create job in database
      const jobData = {
        title: `${formData.customerInfo.firstName} ${formData.customerInfo.lastName} - ${selectedAppointmentType?.name || 'Appointment'}`,
        description: `Appointment for ${formData.customerInfo.firstName} ${formData.customerInfo.lastName}`,
        scheduled_date: formData.scheduledDate ? 
          `${formData.scheduledDate.getFullYear()}-${String(formData.scheduledDate.getMonth() + 1).padStart(2, '0')}-${String(formData.scheduledDate.getDate()).padStart(2, '0')}` : 
          new Date().toISOString().split('T')[0],
        scheduled_time: formData.scheduledTime,
        estimated_duration: selectedAppointmentType?.base_duration || 60,
        base_price: basePrice,
        minimum_price: selectedAppointmentType?.minimum_price || 0,
        location_address: formData.customerInfo.address,
        worker_count: formData.workerCount,
        customer_id: null, // Will create customer if needed
        // Customer information for automatic customer creation
        customer_first_name: formData.customerInfo.firstName,
        customer_last_name: formData.customerInfo.lastName,
        customer_phone: formData.customerInfo.phone,
        customer_email: formData.customerInfo.email,
        customer_address: formData.customerInfo.address,
        appointment_type_id: formData.appointmentTypeId,
        form_id: forms.length > 0 ? forms[0].id : null, // Use first form for now
        company_id: 'test-company-1'
      }

      const response = await fetch('/api/v1/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) {
        throw new Error('Failed to create job')
      }

      const result = await response.json()

      // Create appointment object for local state
      const newAppointment = {
        id: result.job.id,
        title: jobData.title,
        date: jobData.scheduled_date,
        time: jobData.scheduled_time,
        duration: jobData.estimated_duration,
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
      resetForm()
      onClose()
    } catch (error) {
      console.error('Error saving appointment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.first_name.toLowerCase().includes(formData.customerInfo.firstName.toLowerCase()) ||
    customer.last_name.toLowerCase().includes(formData.customerInfo.firstName.toLowerCase())
  )

  const filteredAppointmentTypes = appointmentTypes.filter(apt => {
    // This would normally filter based on the selected calendar
    return true
  })

  const selectedAppointmentType = appointmentTypes.find(apt => apt.id === formData.appointmentTypeId)

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
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#111827' }}>
              Create Appointment
            </h2>
            {formData.scheduledDate && (
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                {formData.scheduledDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            )}
          </div>
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
                Address *
              </label>
              <textarea
                value={formData.customerInfo.address}
                onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: errors.address ? '1px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                placeholder="Enter service address"
              />
              {errors.address && (
                <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                  {errors.address}
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
                <select
                  value={formData.scheduledTime}
                  onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: 'white'
                  }}
                >
                  {Array.from({ length: 96 }, (_, i) => {
                    const hour = Math.floor(i / 4)
                    const minute = (i % 4) * 15
                    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                    const displayTime = (() => {
                      if (hour === 0) return `12:${minute.toString().padStart(2, '0')} AM`
                      if (hour < 12) return `${hour}:${minute.toString().padStart(2, '0')} AM`
                      if (hour === 12) return `12:${minute.toString().padStart(2, '0')} PM`
                      return `${hour - 12}:${minute.toString().padStart(2, '0')} PM`
                    })()
                    return (
                      <option key={timeString} value={timeString}>
                        {displayTime}
                      </option>
                    )
                  })}
                </select>
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
          {selectedAppointmentType && forms.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Forms
              </h3>
              
              {forms.map(form => (
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
