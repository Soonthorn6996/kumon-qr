import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: cors })
  }

  try {
    const { code, redirect_uri, student_token } = await req.json()

    if (!code || !redirect_uri || !student_token) {
      return json({ error: 'Missing required fields' }, 400)
    }

    // 1. Exchange authorization code for LINE access token
    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        client_id: Deno.env.get('LINE_LOGIN_CHANNEL_ID')!,
        client_secret: Deno.env.get('LINE_LOGIN_CHANNEL_SECRET')!,
      }),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.error('LINE token error:', err)
      return json({ error: 'LINE token exchange failed' }, 502)
    }

    const { access_token } = await tokenRes.json()

    // 2. Get LINE user profile (userId, displayName, pictureUrl)
    const profileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    if (!profileRes.ok) return json({ error: 'Failed to get LINE profile' }, 502)

    const { userId, displayName, pictureUrl } = await profileRes.json()

    // 3. Store guardian LINE info on the student row (service role bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { error } = await supabase
      .from('students')
      .update({
        guardian_line_id: userId,
        guardian_line_name: displayName,
        guardian_line_picture: pictureUrl ?? null,
      })
      .eq('qr_code', student_token)

    if (error) {
      console.error('DB update error:', error)
      return json({ error: 'Database update failed' }, 500)
    }

    return json({ ok: true, displayName })

  } catch (e) {
    console.error('Unhandled error:', e)
    return json({ error: String(e) }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
