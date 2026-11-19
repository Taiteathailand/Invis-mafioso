import { createClient } from '@supabase/supabase-js'

// Filled in at build time from GitHub repo variables (see README).
// If they are missing, the Social page runs in local-only mode.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && key ? createClient(url, key) : null
