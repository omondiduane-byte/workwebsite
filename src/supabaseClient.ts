import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hctnlobegwmnoyjikkit.supabase.co';
const supabaseAnonKey =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdG5sb2JlZ3dtbm95amlra2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxOTU3MzksImV4cCI6MjA5OTc3MTczOX0.89whbsdcM8aFHSGrVdySYqPeXpI9V9zX-V88GbkYWnw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);