import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnneoykgqmsdsjamhxmw.supabase.co';
const supabaseAnonKey = 'sb_publishable_SOx0_zsb2SSBFrwBHvZrhw_MANaEZAN';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);