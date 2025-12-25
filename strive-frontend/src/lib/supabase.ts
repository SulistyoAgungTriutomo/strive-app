// strive-frontend/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Pastikan env variable ini ada di file .env frontend Anda
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);