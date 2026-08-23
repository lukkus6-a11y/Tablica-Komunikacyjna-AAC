import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnneoykgqmsdsjamhxmw.supabase.co';
const supabaseKey = 'sb_publishable_4qT9ZRRr-Xyz8XUDHGHmbw_cUJcuCcP';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});