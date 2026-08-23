import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnneoykgqmsdsjamhxmw.supabase.co';
const supabaseKey = 'sb_publishable_SOx0_zsb2SSBFrwBHvZrhw_MANaEZAN';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // Kluczowe dla przechwycenia sesji po powrocie z Google
  },
});