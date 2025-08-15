'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'

interface Form {
  id: string
  name: string
  description: string
  is_active: boolean
  internal_use_only: boolean
  form_required: boolean
  created_at: string
  assigned_appointment_types: string[]
}

interface FormField {
  id: string
  form_id: string
  field_type: 'textbox' | 'dropdown' | 'checkbox' | 'checkbox_list' | 'yes_no' | 'file_upload' | 'address'
  label: string
  required: boolean
  options?: string[]
  order_index: number
}

export default function FormsPage() {
  const { user, dbUser, loading } = useAuth()
  const router = useRouter()
  const [forms, setForms] = useState<Form[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedForm, setSelectedForm] = useState<Form | null>(null)
  const [loadingForms, setLoadingForms] = useState(true)

  useEffect(() => {
    if (!loading && (!user || !dbUser || dbUser.role !== 'ORG_ADMIN')) {
      router.push('/auth/login')
    }
  }, [user, dbUser, loading, router])

  useEffect(() => {
    if (dbUser?.role === 'ORG_ADMIN') {
      loadForms()
    }
  }, [dbUser])

  const loadForms = () => {
    // Mock data for now - will be replaced with Supabase calls
    const mockForms: Form[] = [
      {
        id: '1',
        name: 'Customer Information Form',
        description: 'Collect basic customer details and preferences',
        is_active: true,
        internal_use_only: false,
        form_required: true,
        created_at: '2024-01-01T00:00:00Z',
        assigned_appointment_types: ['1', '2']
      },
      {
        id: '2',
        name: 'Service Requirements Checklist',
        description: 'Detailed checklist for service specifications',
        is_active: true,
        internal_use_only: true,
        form_required: false,
        created_at: '2024-01-02T00:00:00Z',
        assigned_appointment_types: ['1']
      },
      {
        id: '3',
        name: 'Post-Service Feedback',
        description: 'Collect customer feedback after service completion',
        is_active: false,
        internal_use_only: false,
        form_required: true,
        created_at: '2024-01-03T00:00:00Z',
        assigned_appointment_types: []
      }
    ]
    setForms(mockForms)
    setLoadingForms(false)
  }

  const handleCreateForm = (formData: any) => {
    const newForm: Form = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      is_active: true,
      internal_use_only: formData.internal_use_only,
      form_required: formData.form_required,
      created_at: new Date().toISOString(),
      assigned_appointment_types: formData.assigned_appointment_types || []
    }
    setForms(prev => [...prev, newForm])
    setShowCreateModal(false)
  }

  const handleEditForm = (formData: any) => {
    if (selectedForm) {
      setForms(prev => prev.map(form => 
        form.id === selectedForm.id 
          ? { ...form, ...formData }
          : form
      ))
    }
    setShowEditModal(false)
    setSelectedForm(null)
  }

  const handleToggleFormStatus = (formId: string) => {
    setForms(prev => prev.map(form => 
      form.id === formId 
        ? { ...form, is_active: !form.is_active }
        : form
    ))
  }

  const handleEditClick = (form: Form) => {
    setSelectedForm(form)
    setShowEditModal(true)
  }

  if (loading || loadingForms) {
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
            Forms
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
            Create Form
          </button>
        </div>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Create and manage custom forms for collecting information from customers and workers.
        </p>
      </div>

      {/* Forms Grid */}
      {forms.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1" style={{ margin: '0 auto 20px' }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="9" x2="15" y2="9"></line>
            <line x1="9" y1="13" x2="15" y2="13"></line>
            <line x1="9" y1="17" x2="15" y2="17"></line>
          </svg>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
            No forms yet
          </h3>
          <p style={{ color: '#6b7280', margin: '0 0 20px 0' }}>
            Create your first form to start collecting custom information.
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
            Create Form
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {forms.map((form) => (
            <div key={form.id} style={{
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
                    {form.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: form.is_active ? '#10b981' : '#6b7280'
                    }}></div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {form.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {form.internal_use_only && (
                      <>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>•</span>
                        <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '500' }}>
                          Internal Only
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEditClick(form)}
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
                    onClick={() => handleToggleFormStatus(form.id)}
                    style={{
                      padding: '6px',
                      background: form.is_active ? '#ef4444' : '#10b981',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = form.is_active ? '#dc2626' : '#059669'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = form.is_active ? '#ef4444' : '#10b981'
                    }}
                  >
                    {form.is_active ? (
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
              {form.description && (
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                  {form.description}
                </p>
              )}

              {/* Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Created</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                    {new Date(form.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Appointments</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                    {form.assigned_appointment_types.length} assigned
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleEditClick(form)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '12px',
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
                  Edit Form
                </button>
                <button
                  onClick={() => handleEditClick(form)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#374151',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#e5e7eb'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#f3f4f6'
                  }}
                >
                  View Responses
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateModal && (
        <CreateFormModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateForm}
        />
      )}

      {/* Edit Form Modal */}
      {showEditModal && selectedForm && (
        <EditFormModal
          form={selectedForm}
          onClose={() => {
            setShowEditModal(false)
            setSelectedForm(null)
          }}
          onSave={handleEditForm}
        />
      )}
    </div>
  )
}

// Placeholder components - will be implemented next
function CreateFormModal({ onClose, onCreate }: any) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    internal_use_only: false,
    form_required: false,
    assigned_appointment_types: [] as string[]
  })
  const [fields, setFields] = useState<FormField[]>([])
  const [showFieldConfig, setShowFieldConfig] = useState(false)
  const [selectedField, setSelectedField] = useState<FormField | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Mock appointment types - will be replaced with real data
  const appointmentTypes = [
    { id: '1', name: 'Cleaning Service' },
    { id: '2', name: 'Maintenance Check' },
    { id: '3', name: 'Security Patrol' }
  ]

  const fieldTypes = [
    { value: 'textbox', label: 'Textbox', icon: '📝' },
    { value: 'dropdown', label: 'Dropdown List', icon: '📋' },
    { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { value: 'checkbox_list', label: 'Checkbox List', icon: '📋' },
    { value: 'yes_no', label: 'Yes/No Choice', icon: '❓' },
    { value: 'file_upload', label: 'File Upload', icon: '📎' },
    { value: 'address', label: 'Address', icon: '📍' }
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Form name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onCreate({
        ...formData,
        fields: fields
      })
    }
  }

  const addField = (fieldType: string) => {
    const newField: FormField = {
      id: Date.now().toString(),
      form_id: '',
      field_type: fieldType as any,
      label: '',
      required: false,
      options: fieldType === 'dropdown' || fieldType === 'checkbox_list' ? [] : undefined,
      order_index: fields.length
    }
    setFields(prev => [...prev, newField])
    setSelectedField(newField)
    setShowFieldConfig(true)
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ))
  }

  const removeField = (fieldId: string) => {
    setFields(prev => prev.filter(field => field.id !== fieldId))
    if (selectedField?.id === fieldId) {
      setSelectedField(null)
      setShowFieldConfig(false)
    }
  }

  const toggleAppointmentType = (appointmentTypeId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_appointment_types: prev.assigned_appointment_types.includes(appointmentTypeId)
        ? prev.assigned_appointment_types.filter((id: string) => id !== appointmentTypeId)
        : [...prev.assigned_appointment_types, appointmentTypeId]
    }))
  }

  const moveField = (fromIndex: number, toIndex: number) => {
    const newFields = [...fields]
    const [movedField] = newFields.splice(fromIndex, 1)
    newFields.splice(toIndex, 0, movedField)
    
    // Update order_index for all fields
    const updatedFields = newFields.map((field: FormField, index: number) => ({
      ...field,
      order_index: index
    }))
    
    setFields(updatedFields)
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
        maxWidth: '900px',
        width: '95%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
            Create Form
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Left Side - Form Builder */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 16px 0' }}>
              Form Builder
            </h4>

            {/* Form Details */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Form Name *
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
                  placeholder="Enter form name..."
                />
                {errors.name && (
                  <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                    {errors.name}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
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
                  placeholder="Describe this form..."
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.internal_use_only}
                  onChange={(e) => handleInputChange('internal_use_only', e.target.checked)}
                  style={{ margin: 0 }}
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  Internal use only (customers cannot edit in future)
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.form_required}
                  onChange={(e) => handleInputChange('form_required', e.target.checked)}
                  style={{ margin: 0 }}
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  Form is required for all appointments
                </span>
              </label>
            </div>

            {/* Field Types */}
            <div style={{ marginBottom: '24px' }}>
              <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 12px 0' }}>
                Add Fields
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                {fieldTypes.map((fieldType) => (
                  <button
                    key={fieldType.value}
                    onClick={() => addField(fieldType.value)}
                    style={{
                      padding: '12px 8px',
                      background: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#374151',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
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
                    <span style={{ fontSize: '16px' }}>{fieldType.icon}</span>
                    <span>{fieldType.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields List */}
            <div>
              <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 12px 0' }}>
                Form Fields ({fields.length})
              </h5>
              {fields.length === 0 ? (
                <div style={{
                  padding: '20px',
                  border: '2px dashed #d1d5db',
                  borderRadius: '6px',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    Add fields to your form using the buttons above
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      style={{
                        padding: '12px',
                        background: selectedField?.id === field.id ? '#f0f9ff' : 'white',
                        border: selectedField?.id === field.id ? '1px solid #3b82f6' : '1px solid #d1d5db',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => {
                        setSelectedField(field)
                        setShowFieldConfig(true)
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <span style={{ fontSize: '14px' }}>
                          {fieldTypes.find(ft => ft.value === field.field_type)?.icon}
                        </span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                            {field.label || 'Untitled Field'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {fieldTypes.find(ft => ft.value === field.field_type)?.label}
                            {field.required && ' • Required'}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (index > 0) moveField(index, index - 1)
                          }}
                          style={{
                            padding: '4px',
                            background: 'none',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          disabled={index === 0}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="18,15 12,9 6,15"></polyline>
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (index < fields.length - 1) moveField(index, index + 1)
                          }}
                          style={{
                            padding: '4px',
                            background: 'none',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          disabled={index === fields.length - 1}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6,9 12,15 18,9"></polyline>
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeField(field.id)
                          }}
                          style={{
                            padding: '4px',
                            background: '#ef4444',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Field Configuration & Appointment Types */}
          <div>
            {showFieldConfig && selectedField ? (
              <FieldConfiguration
                field={selectedField}
                onUpdate={(updates: Partial<FormField>) => updateField(selectedField.id, updates)}
                onClose={() => {
                  setShowFieldConfig(false)
                  setSelectedField(null)
                }}
              />
            ) : (
              <AppointmentTypeAssignment
                appointmentTypes={appointmentTypes}
                selectedTypes={formData.assigned_appointment_types}
                onToggle={toggleAppointmentType}
              />
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginTop: '24px' }}>
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
            Create Form
          </button>
        </div>
      </div>
    </div>
  )
}

function EditFormModal({ form, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: form.name,
    description: form.description,
    internal_use_only: form.internal_use_only,
    form_required: form.form_required,
    assigned_appointment_types: form.assigned_appointment_types
  })
  const [fields, setFields] = useState<FormField[]>([])
  const [showFieldConfig, setShowFieldConfig] = useState(false)
  const [selectedField, setSelectedField] = useState<FormField | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load existing fields when editing a form
  useEffect(() => {
    loadExistingFields()
  }, [form.id])

  const loadExistingFields = () => {
    // Mock field data for existing forms - will be replaced with real API calls
    const mockFields: Record<string, FormField[]> = {
      '1': [ // Customer Information Form
        {
          id: 'field-1',
          form_id: '1',
          field_type: 'textbox',
          label: 'Customer Name',
          required: true,
          order_index: 0
        },
        {
          id: 'field-2',
          form_id: '1',
          field_type: 'textbox',
          label: 'Phone Number',
          required: true,
          order_index: 1
        },
        {
          id: 'field-3',
          form_id: '1',
          field_type: 'textbox',
          label: 'Special Instructions',
          required: false,
          order_index: 2
        }
      ],
      '2': [ // Service Requirements Checklist
        {
          id: 'field-4',
          form_id: '2',
          field_type: 'dropdown',
          label: 'Service Type',
          required: true,
          options: ['Standard', 'Deep Clean', 'Premium'],
          order_index: 0
        },
        {
          id: 'field-5',
          form_id: '2',
          field_type: 'yes_no',
          label: 'Urgent Service',
          required: true,
          order_index: 1
        }
      ],
      '3': [ // Post-Service Feedback
        {
          id: 'field-6',
          form_id: '3',
          field_type: 'textbox',
          label: 'Feedback Comments',
          required: false,
          order_index: 0
        }
      ]
    }

    const existingFields = mockFields[form.id] || []
    setFields(existingFields)
  }

  // Mock appointment types - will be replaced with real data
  const appointmentTypes = [
    { id: '1', name: 'Cleaning Service' },
    { id: '2', name: 'Maintenance Check' },
    { id: '3', name: 'Security Patrol' }
  ]

  const fieldTypes = [
    { value: 'textbox', label: 'Textbox', icon: '📝' },
    { value: 'dropdown', label: 'Dropdown List', icon: '📋' },
    { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { value: 'checkbox_list', label: 'Checkbox List', icon: '📋' },
    { value: 'yes_no', label: 'Yes/No Choice', icon: '❓' },
    { value: 'file_upload', label: 'File Upload', icon: '📎' },
    { value: 'address', label: 'Address', icon: '📍' }
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Form name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onSave({
        ...formData,
        fields: fields
      })
    }
  }

  const addField = (fieldType: string) => {
    const newField: FormField = {
      id: Date.now().toString(),
      form_id: form.id,
      field_type: fieldType as any,
      label: '',
      required: false,
      options: fieldType === 'dropdown' || fieldType === 'checkbox_list' ? [] : undefined,
      order_index: fields.length
    }
    setFields(prev => [...prev, newField])
    setSelectedField(newField)
    setShowFieldConfig(true)
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ))
  }

  const removeField = (fieldId: string) => {
    setFields(prev => prev.filter(field => field.id !== fieldId))
    if (selectedField?.id === fieldId) {
      setSelectedField(null)
      setShowFieldConfig(false)
    }
  }

  const toggleAppointmentType = (appointmentTypeId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_appointment_types: prev.assigned_appointment_types.includes(appointmentTypeId)
        ? prev.assigned_appointment_types.filter(id => id !== appointmentTypeId)
        : [...prev.assigned_appointment_types, appointmentTypeId]
    }))
  }

  const moveField = (fromIndex: number, toIndex: number) => {
    const newFields = [...fields]
    const [movedField] = newFields.splice(fromIndex, 1)
    newFields.splice(toIndex, 0, movedField)
    
    // Update order_index for all fields
    const updatedFields = newFields.map((field, index) => ({
      ...field,
      order_index: index
    }))
    
    setFields(updatedFields)
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
        maxWidth: '900px',
        width: '95%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
            Edit Form
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Left Side - Form Builder */}
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 16px 0' }}>
              Form Builder
            </h4>

            {/* Form Details */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Form Name *
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
                  placeholder="Enter form name..."
                />
                {errors.name && (
                  <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                    {errors.name}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
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
                  placeholder="Describe this form..."
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.internal_use_only}
                  onChange={(e) => handleInputChange('internal_use_only', e.target.checked)}
                  style={{ margin: 0 }}
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  Internal use only (customers cannot edit in future)
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.form_required}
                  onChange={(e) => handleInputChange('form_required', e.target.checked)}
                  style={{ margin: 0 }}
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  Form is required for all appointments
                </span>
              </label>
            </div>

            {/* Field Types */}
            <div style={{ marginBottom: '24px' }}>
              <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 12px 0' }}>
                Add Fields
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                {fieldTypes.map((fieldType) => (
                  <button
                    key={fieldType.value}
                    onClick={() => addField(fieldType.value)}
                    style={{
                      padding: '12px 8px',
                      background: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#374151',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
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
                    <span style={{ fontSize: '16px' }}>{fieldType.icon}</span>
                    <span>{fieldType.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields List */}
            <div>
              <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 12px 0' }}>
                Form Fields ({fields.length})
              </h5>
              {fields.length === 0 ? (
                <div style={{
                  padding: '20px',
                  border: '2px dashed #d1d5db',
                  borderRadius: '6px',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    Add fields to your form using the buttons above
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      style={{
                        padding: '12px',
                        background: selectedField?.id === field.id ? '#f0f9ff' : 'white',
                        border: selectedField?.id === field.id ? '1px solid #3b82f6' : '1px solid #d1d5db',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => {
                        setSelectedField(field)
                        setShowFieldConfig(true)
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <span style={{ fontSize: '14px' }}>
                          {fieldTypes.find(ft => ft.value === field.field_type)?.icon}
                        </span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                            {field.label || 'Untitled Field'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {fieldTypes.find(ft => ft.value === field.field_type)?.label}
                            {field.required && ' • Required'}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (index > 0) moveField(index, index - 1)
                          }}
                          style={{
                            padding: '4px',
                            background: 'none',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          disabled={index === 0}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="18,15 12,9 6,15"></polyline>
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (index < fields.length - 1) moveField(index, index + 1)
                          }}
                          style={{
                            padding: '4px',
                            background: 'none',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          disabled={index === fields.length - 1}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6,9 12,15 18,9"></polyline>
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeField(field.id)
                          }}
                          style={{
                            padding: '4px',
                            background: '#ef4444',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Field Configuration & Appointment Types */}
          <div>
            {showFieldConfig && selectedField ? (
              <FieldConfiguration
                field={selectedField}
                onUpdate={(updates: Partial<FormField>) => updateField(selectedField.id, updates)}
                onClose={() => {
                  setShowFieldConfig(false)
                  setSelectedField(null)
                }}
              />
            ) : (
              <AppointmentTypeAssignment
                appointmentTypes={appointmentTypes}
                selectedTypes={formData.assigned_appointment_types}
                onToggle={toggleAppointmentType}
              />
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginTop: '24px' }}>
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

// Helper Components
function FieldConfiguration({ field, onUpdate, onClose }: any) {
  const [fieldData, setFieldData] = useState({
    label: field.label,
    required: field.required,
    options: field.options || []
  })
  const [newOption, setNewOption] = useState('')

  const handleInputChange = (key: string, value: any) => {
    setFieldData(prev => ({ ...prev, [key]: value }))
  }

  const addOption = () => {
    if (newOption.trim()) {
      setFieldData(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()]
      }))
      setNewOption('')
    }
  }

  const removeOption = (index: number) => {
    setFieldData(prev => ({
      ...prev,
      options: prev.options.filter((_: string, i: number) => i !== index)
    }))
  }

  const handleSave = () => {
    onUpdate({
      label: fieldData.label,
      required: fieldData.required,
      options: fieldData.options
    })
    onClose()
  }

  const fieldTypes = [
    { value: 'textbox', label: 'Textbox', icon: '📝' },
    { value: 'dropdown', label: 'Dropdown List', icon: '📋' },
    { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { value: 'checkbox_list', label: 'Checkbox List', icon: '📋' },
    { value: 'yes_no', label: 'Yes/No Choice', icon: '❓' },
    { value: 'file_upload', label: 'File Upload', icon: '📎' },
    { value: 'address', label: 'Address', icon: '📍' }
  ]

  const currentFieldType = fieldTypes.find(ft => ft.value === field.field_type)

  return (
    <div>
      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 16px 0' }}>
        Field Configuration
      </h4>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '16px' }}>{currentFieldType?.icon}</span>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            {currentFieldType?.label}
          </span>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
            Field Label
          </label>
          <input
            type="text"
            value={fieldData.label}
            onChange={(e) => handleInputChange('label', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none'
            }}
            placeholder="Enter field label..."
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px' }}>
          <input
            type="checkbox"
            checked={fieldData.required}
            onChange={(e) => handleInputChange('required', e.target.checked)}
            style={{ margin: 0 }}
          />
          <span style={{ fontSize: '14px', color: '#374151' }}>
            Required field
          </span>
        </label>

        {(field.field_type === 'dropdown' || field.field_type === 'checkbox_list') && (
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Options
            </label>
                         <div style={{ marginBottom: '8px' }}>
               {fieldData.options.map((option: string, index: number) => (
                 <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                   <span style={{ fontSize: '14px', color: '#374151', flex: 1 }}>{option}</span>
                   <button
                     onClick={() => removeOption(index)}
                     style={{
                       padding: '2px 6px',
                       background: '#ef4444',
                       border: 'none',
                       borderRadius: '4px',
                       color: 'white',
                       fontSize: '12px',
                       cursor: 'pointer'
                     }}
                   >
                     Remove
                   </button>
                 </div>
               ))}
             </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addOption()}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                placeholder="Add new option..."
              />
              <button
                onClick={addOption}
                style={{
                  padding: '6px 12px',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
          </div>
        )}

        {field.field_type === 'file_upload' && (
          <div style={{ padding: '12px', background: '#f3f4f6', borderRadius: '6px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              File upload functionality coming soon
            </p>
          </div>
        )}

        {field.field_type === 'address' && (
          <div style={{ padding: '12px', background: '#f0f9ff', borderRadius: '6px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#0369a1' }}>
              This field will use Google Cloud Address lookup for address validation
            </p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleSave}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: '#3b82f6',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Save Field
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '8px 12px',
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function AppointmentTypeAssignment({ appointmentTypes, selectedTypes, onToggle }: any) {
  return (
    <div>
      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 16px 0' }}>
        Assign to Appointment Types
      </h4>
      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0' }}>
        Select which appointment types this form should be attached to.
      </p>
      
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
         {appointmentTypes.map((appointmentType: { id: string; name: string }) => (
           <label key={appointmentType.id} style={{
             display: 'flex',
             alignItems: 'center',
             gap: '8px',
             padding: '8px 12px',
             border: '1px solid #d1d5db',
             borderRadius: '6px',
             cursor: 'pointer',
             background: selectedTypes.includes(appointmentType.id) ? '#f0f9ff' : 'white'
           }}>
             <input
               type="checkbox"
               checked={selectedTypes.includes(appointmentType.id)}
               onChange={() => onToggle(appointmentType.id)}
               style={{ margin: 0 }}
             />
             <span style={{ fontSize: '14px', color: '#374151' }}>{appointmentType.name}</span>
           </label>
         ))}
       </div>
      
      {appointmentTypes.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            No appointment types available. Create appointment types first.
          </p>
        </div>
      )}
    </div>
  )
}
