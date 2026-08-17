import { createClient } from '@supabase/supabase-js';

// Prefer environment variables for keys. In Vite use VITE_* prefix.
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://hctnlobegwmnoyjikkit.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdG5sb2JlZ3dtbm95amlra2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxOTU3MzksImV4cCI6MjA5OTc3MTczOX0.89whbsdcM8aFHSGrVdySYqPeXpI9V9zX-V88GbkYWnw';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
	// Warn so devs running locally know to set env vars or rotate keys.
	// Do NOT log secrets in production.
	// eslint-disable-next-line no-console
	console.warn('Using fallback/hardcoded Supabase URL/ANON key. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to avoid this.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);