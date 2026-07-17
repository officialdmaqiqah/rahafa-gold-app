import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key'

// We use service role key for custom auth (to read hashed pin) or we can just use anon key if RLS allows reading.
// For MVP, we will use a server-only client if we do server-side auth.
export const supabase = createClient(supabaseUrl, supabaseKey)
