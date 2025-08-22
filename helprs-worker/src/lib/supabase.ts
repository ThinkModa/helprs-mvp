import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

// Environment variable validation
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

console.log('🔧 Supabase Client Initialization:');
console.log('  - EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('  - EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
console.log('  - Full URL:', supabaseUrl);

// Validate environment variables
if (!supabaseUrl) {
  console.error('❌ EXPO_PUBLIC_SUPABASE_URL is not defined!');
  throw new Error('EXPO_PUBLIC_SUPABASE_URL is not defined. Please check your environment configuration.')
}

if (!supabaseAnonKey) {
  console.error('❌ EXPO_PUBLIC_SUPABASE_ANON_KEY is not defined!');
  throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY is not defined. Please check your environment configuration.')
}

console.log('✅ Supabase connection initialized successfully')

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'helprs-worker-mobile'
    }
  }
})

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase
      .from('jobs')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error)
      return false
    }
    
    console.log('✅ Supabase connection test successful')
    return true
  } catch (err) {
    console.error('❌ Supabase connection test error:', err)
    return false
  }
}



