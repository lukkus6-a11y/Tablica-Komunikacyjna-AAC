import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fnneoykgqmsdsjamhxmw.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_SOx0_zsb2SSBFrwBHvZrhw_MANaEZAN';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      apikey: supabasePublishableKey,
    },
  },
});