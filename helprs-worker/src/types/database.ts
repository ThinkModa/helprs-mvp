// Database Types for React Native Worker App
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'WORKER'
          company_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'WORKER'
          company_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'WORKER'
          company_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      workers: {
        Row: {
          id: string
          user_id: string
          company_id: string
          phone: string | null
          profile_picture_url: string | null
          is_lead: boolean
          points: number
          background_check_status: 'pending' | 'clear' | 'failed'
          stripe_connect_account_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          phone?: string | null
          profile_picture_url?: string | null
          is_lead?: boolean
          points?: number
          background_check_status?: 'pending' | 'clear' | 'failed'
          stripe_connect_account_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          phone?: string | null
          profile_picture_url?: string | null
          is_lead?: boolean
          points?: number
          background_check_status?: 'pending' | 'clear' | 'failed'
          stripe_connect_account_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          company_id: string
          customer_id: string
          calendar_id: string
          appointment_type_id: string
          title: string
          description: string | null
          status: 'open' | 'scheduling' | 'scheduled' | 'in_progress' | 'completed' | 'paid'
          scheduled_date: string | null
          scheduled_time: string | null
          estimated_duration: number | null
          base_price: number | null
          minimum_price: number | null
          location_address: string | null
          location_coordinates: string | null
          form_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          customer_id: string
          calendar_id: string
          appointment_type_id: string
          title: string
          description?: string | null
          status?: 'open' | 'scheduling' | 'scheduled' | 'in_progress' | 'completed' | 'paid'
          scheduled_date?: string | null
          scheduled_time?: string | null
          estimated_duration?: number | null
          base_price?: number | null
          minimum_price?: number | null
          location_address?: string | null
          location_coordinates?: string | null
          form_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          customer_id?: string
          calendar_id?: string
          appointment_type_id?: string
          title?: string
          description?: string | null
          status?: 'open' | 'scheduling' | 'scheduled' | 'in_progress' | 'completed' | 'paid'
          scheduled_date?: string | null
          scheduled_time?: string | null
          estimated_duration?: number | null
          base_price?: number | null
          minimum_price?: number | null
          location_address?: string | null
          location_coordinates?: string | null
          form_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      job_workers: {
        Row: {
          id: string
          job_id: string
          worker_id: string
          is_lead: boolean
          hourly_rate: number | null
          assigned_at: string
        }
        Insert: {
          id?: string
          job_id: string
          worker_id: string
          is_lead?: boolean
          hourly_rate?: number | null
          assigned_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          worker_id?: string
          is_lead?: boolean
          hourly_rate?: number | null
          assigned_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          job_id: string
          worker_id: string
          clock_in: string | null
          clock_out: string | null
          hours_worked: number | null
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          worker_id: string
          clock_in?: string | null
          clock_out?: string | null
          hours_worked?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          worker_id?: string
          clock_in?: string | null
          clock_out?: string | null
          hours_worked?: number | null
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          company_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          worker_id: string
          type: 'job_assigned' | 'job_reminder' | 'chat_message' | 'payment_received' | 'job_cancelled' | 'schedule_change'
          title: string
          message: string
          related_job_id: string | null
          related_user_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          worker_id: string
          type: 'job_assigned' | 'job_reminder' | 'chat_message' | 'payment_received' | 'job_cancelled' | 'schedule_change'
          title: string
          message: string
          related_job_id?: string | null
          related_user_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          worker_id?: string
          type?: 'job_assigned' | 'job_reminder' | 'chat_message' | 'payment_received' | 'job_cancelled' | 'schedule_change'
          title?: string
          message?: string
          related_job_id?: string | null
          related_user_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          job_id: string
          from_worker_id: string
          to_worker_id: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          from_worker_id: string
          to_worker_id: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          from_worker_id?: string
          to_worker_id?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'WORKER'
      job_status: 'open' | 'scheduling' | 'scheduled' | 'in_progress' | 'completed' | 'paid'
      background_check_status: 'pending' | 'clear' | 'failed'
      notification_type: 'job_assigned' | 'job_reminder' | 'chat_message' | 'payment_received' | 'job_cancelled' | 'schedule_change'
    }
  }
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Common types
export type User = Tables<'users'>
export type Worker = Tables<'workers'>
export type Job = Tables<'jobs'>
export type JobWorker = Tables<'job_workers'>
export type TimeEntry = Tables<'time_entries'>
export type Customer = Tables<'customers'>
export type Notification = Tables<'notifications'>
export type Message = Tables<'messages'>

// Auth types
export type UserRole = Database['public']['Enums']['user_role']
export type JobStatus = Database['public']['Enums']['job_status']
export type BackgroundCheckStatus = Database['public']['Enums']['background_check_status']
export type NotificationType = Database['public']['Enums']['notification_type']

