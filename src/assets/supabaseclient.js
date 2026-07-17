import { createClient } from '@supabase/supabase-js'

// Retrieve environment variables depending on your bundler (Vite, Next.js, Node, etc.)
const supabaseUrl = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

// Fail fast if the required configuration is missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables.')
}

// Initialize the single, shared Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
