import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnneoykgqmsdsjamhxmw.supabase.co';
const supabasePublishableKey = 'sb_publishable_SOx0_zsb2SSBFrwBHvZrhw_MANaEZAN';

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