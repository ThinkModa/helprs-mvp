'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface DatabaseUser {
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

interface AuthContextType {
  user: User | null
  session: Session | null
  dbUser: DatabaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, userData: Partial<DatabaseUser>) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [dbUser, setDbUser] = useState<DatabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for test user first - this should happen before any Supabase auth
    const testUser = localStorage.getItem('helprs_test_user')
    if (testUser) {
      const parsedUser = JSON.parse(testUser)
      setDbUser(parsedUser)
      setUser({ id: parsedUser.id, email: parsedUser.email } as User)
      setLoading(false)
      return // Don't proceed with Supabase auth if we have a test user
    }

    // Get initial session only if no test user
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchDbUser(session.user.id)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchDbUser(session.user.id)
      } else {
        setDbUser(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchDbUser = async (userId: string) => {
    try {
      // Temporarily disabled due to database type issues
      // const { data, error } = await supabase
      //   .from('users')
      //   .select('*')
      //   .eq('id', userId)
      //   .single()

      // if (error) {
      //   console.error('Error fetching user:', error)
      //   return
      // }

      // setDbUser(data)
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      // For testing purposes, handle test credentials
      if (email === 'admin@helprs.com' && password === 'admin123') {
        // Mock Super Admin user
        const mockUser: DatabaseUser = {
          id: 'admin_123',
          email: 'admin@helprs.com',
          first_name: 'Super',
          last_name: 'Admin',
          role: 'SUPER_ADMIN',
          company_id: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setDbUser(mockUser)
        setUser({ id: 'admin_123', email: 'admin@helprs.com' } as User)
        // Store in localStorage for persistence
        localStorage.setItem('helprs_test_user', JSON.stringify(mockUser))
        return {}
      }

      if (email === 'org@helprs.com' && password === 'org123') {
        // Mock Org Admin user
        const mockUser: DatabaseUser = {
          id: 'org_123',
          email: 'org@helprs.com',
          first_name: 'Organization',
          last_name: 'Admin',
          role: 'ORG_ADMIN',
          company_id: 'company_123',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setDbUser(mockUser)
        setUser({ id: 'org_123', email: 'org@helprs.com' } as User)
        // Store in localStorage for persistence
        localStorage.setItem('helprs_test_user', JSON.stringify(mockUser))
        // Redirect to schedule page for Org Admins
        window.location.href = '/dashboard/org-admin/schedule'
        return {}
      }

      // Real Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        await fetchDbUser(data.user.id)
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<DatabaseUser>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        // Temporarily disabled due to database type issues
        // Create user record in our database
        // const { error: dbError } = await supabase
        //   .from('users')
        //   .insert([
        //     {
        //       id: data.user.id,
        //       email: data.user.email,
        //       ...userData,
        //     },
        //   ])

        // if (dbError) {
        //   return { error: dbError.message }
        // }

        // await fetchDbUser(data.user.id)
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setDbUser(null)
      // Clear localStorage
      localStorage.removeItem('helprs_test_user')
      
      // Clear calendar preferences for all users
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('helprs_calendar_filter_')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) {
        return { error: error.message }
      }
      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }



  const value = {
    user,
    session,
    dbUser,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

