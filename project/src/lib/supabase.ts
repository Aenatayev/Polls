import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Authentication and database access will not work.');
}

// Create Supabase client with optimized configuration
export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: false, // Disable debug logging
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-client-info': 'pollmaster@1.0.0',
    },
  },
  db: {
    schema: 'public',
  },
});

// Add error handling for failed requests
supabase.handleFailedRequest = (error: Error) => {
  console.error('Supabase request failed:', error);
  // You can add additional error handling here
};

// Export a type-safe hook for database access
export function useSupabaseClient() {
  return supabase;
}