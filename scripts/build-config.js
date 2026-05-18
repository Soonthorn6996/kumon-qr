// รันโดย Vercel ก่อน deploy — สร้าง js/config.js จาก env vars
const { writeFileSync, mkdirSync } = require('fs')

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required')
  process.exit(1)
}

mkdirSync('js', { recursive: true })

writeFileSync('js/config.js', `const CONFIG = {
  SUPABASE_URL: '${url}',
  SUPABASE_ANON_KEY: '${key}',
}
`)

console.log('js/config.js generated from environment variables')
