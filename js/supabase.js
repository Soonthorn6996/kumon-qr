import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const runtimeConfig = window.CONFIG || CONFIG

export const supabase = createClient(runtimeConfig.SUPABASE_URL, runtimeConfig.SUPABASE_ANON_KEY)
