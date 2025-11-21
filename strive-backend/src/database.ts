// strive-backend/src/database.ts

const dotenv = require('dotenv');
import { createClient } from '@supabase/supabase-js';

dotenv.config(); 

const supabaseUrl: string = process.env.SUPABASE_URL || '';
// GANTI: Kita gunakan Service Role Key agar Backend punya akses Admin (Bypass RLS)
const supabaseServiceKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in .env');
}

// Inisialisasi Klien Supabase dengan hak akses penuh
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log("Supabase Admin Client Initialized.");