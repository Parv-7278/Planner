import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string)?.trim() || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string)?.trim() || '';

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-key')
);

let client: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    console.info('⚡ [DAYLY Supabase] Successfully connected to cloud database:', supabaseUrl);
  } catch (err) {
    console.error('⚠️ [DAYLY Supabase] Failed to initialize Supabase client:', err);
  }
} else {
  console.info(
    'ℹ️ [DAYLY Supabase] Running in local offline/in-memory mode. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to enable cloud synchronization.'
  );
}

export const supabase = client;
