import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function validateEnv() {
  if (!supabaseUrl || !supabaseAnonKey) {
    const msg = 'Supabase credentials missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env (root) file.';
    console.error(msg);
    return false;
  }

  // Common mistake: using the REST path as the base URL (e.g. ending with /rest/v1/)
  if (supabaseUrl.endsWith('/rest/v1') || supabaseUrl.includes('/rest/v1/')) {
    console.warn('Your VITE_SUPABASE_URL looks like it contains the `/rest/v1` path. Remove that so the URL is just https://<project>.supabase.co');
  }

  return true;
}

validateEnv();

export const supabase: SupabaseClient = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? ''
);

export default supabase;

export function debugSupabaseInfo() {
  try {
    const host = supabaseUrl ? new URL(supabaseUrl).host : 'missing';
    console.info('Supabase host:', host, 'anon key present:', !!supabaseAnonKey);
  } catch {
    console.info('Supabase config: (unable to parse host)');
  }
}
