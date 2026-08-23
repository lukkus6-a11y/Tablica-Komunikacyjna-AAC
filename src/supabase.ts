import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://fnneoykgqmsdsjamhxmw.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_SOx0_zsb2SSBFrwBHvZrhw_MANaEZAN';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
