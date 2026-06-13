import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Connects the logged-in parent's LINE account to their profile.
// The caller proves identity with their Supabase access token; we then
// exchange the LINE authorization code and store the LINE userId on the
// parent's profiles row (account-level, covers all watched students).
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const { code, redirect_uri, access_token } = await req.json()
    if (!code || !redirect_uri || !access_token) {
      return json({ error: 'Missing required fields' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // 1. Identify the parent from their Supabase session token
    const { data: { user }, error: userErr } = await supabase.auth.getUser(access_token)
    if (userErr || !user) return json({ error: 'Unauthorized' }, 401)

    // 2. Exchange LINE authorization code for a LINE access token
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

    const { access_token: lineToken } = await tokenRes.json()

    // 3. Get the LINE user profile
    const profileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${lineToken}` },
    })
    if (!profileRes.ok) return json({ error: 'Failed to get LINE profile' }, 502)

    const { userId, displayName, pictureUrl } = await profileRes.json()

    // 4. Store the LINE identity on the parent's profile (service role bypasses RLS)
    const { error } = await supabase
      .from('profiles')
      .update({
        line_user_id:      userId,
        line_display_name: displayName,
        line_picture_url:  pictureUrl ?? null,
      })
      .eq('id', user.id)

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
