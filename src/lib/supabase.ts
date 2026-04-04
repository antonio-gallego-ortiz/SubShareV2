import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vjnynuromqiatlopetsl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqbnludXJvbXFpYXRsb3BldHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1ODA5NjQsImV4cCI6MjA4NzE1Njk2NH0.52AtmDaWfD1xkDMIz01imUkp1IdVh7nIR0vAEmC_Gik';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type { Session } from '@supabase/supabase-js';
