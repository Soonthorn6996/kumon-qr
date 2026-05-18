// Optional local helper: creates js/config.js from env vars when they exist.
const { writeFileSync, mkdirSync } = require('fs')

const url =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL

const key =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn('Skipping js/config.js generation: Supabase environment variables are not set')
  process.exit(0)
}

mkdirSync('js', { recursive: true })

writeFileSync('js/config.js', `window.CONFIG = {
  SUPABASE_URL: '${url}',
  SUPABASE_ANON_KEY: '${key}',
}
const CONFIG = window.CONFIG
`)

console.log('js/config.js generated from environment variables')
