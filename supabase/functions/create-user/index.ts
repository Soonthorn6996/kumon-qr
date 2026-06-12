import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    // Verify caller is an authenticated admin
    const authHeader = req.headers.get('Authorization') ?? ''
    const callerToken = authHeader.replace('Bearer ', '')
    if (!callerToken) return json({ error: 'Unauthorized' }, 401)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: { user: caller }, error: callerErr } = await supabaseAdmin.auth.getUser(callerToken)
    if (callerErr || !caller) return json({ error: 'Unauthorized' }, 401)

    // Only admin role can create users
    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .maybeSingle()

    if (callerProfile?.role !== 'admin') return json({ error: 'Forbidden: admin only' }, 403)

    // Parse request body
    const { email, password } = await req.json()
    if (!email || !password) return json({ error: 'email and password are required' }, 400)
    if (password.length < 6) return json({ error: 'Password must be at least 6 characters' }, 400)

    // Create user with email pre-confirmed — ready to login immediately
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) return json({ error: error.message }, 400)

    // Upsert profile row (trigger handles it, this is a safety net)
    if (data.user) {
      await supabaseAdmin.from('profiles').upsert({
        id:         data.user.id,
        email:      data.user.email,
        role:       'view',
        created_at: new Date().toISOString(),
      })
    }

    return json({ ok: true, userId: data.user?.id })

  } catch (e) {
    console.error('create-user error:', e)
    return json({ error: String(e) }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
