module.exports = function handler(req, res) {
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ''

  const key =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''

  // LINE Login Channel ID — used by line-connect.html for guardian OAuth
  const lineLoginChannelId = process.env.LINE_LOGIN_CHANNEL_ID || ''

  const body = `window.CONFIG = {
  SUPABASE_URL: ${JSON.stringify(url)},
  SUPABASE_ANON_KEY: ${JSON.stringify(key)},
  LINE_LOGIN_CHANNEL_ID: ${JSON.stringify(lineLoginChannelId)},
};
const CONFIG = window.CONFIG;

if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables on Vercel');
}
`

  res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.status(200).send(body)
}
