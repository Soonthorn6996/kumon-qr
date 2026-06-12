import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Format an ISO timestamp as HH:MM in Bangkok time
function fmtTime(iso: string): string {
  return new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok',
  }).format(new Date(iso))
}

// In-memory cache for the channel access token (per warm instance)
let _tokenCache: { token: string; expiresAt: number } | null = null

// Resolve the LINE channel access token.
//  • If LINE_CHANNEL_ACCESS_TOKEN is set → use it (long-lived, from dashboard).
//  • Else mint a short-lived one from LINE_CHANNEL_ID + LINE_CHANNEL_SECRET
//    via client_credentials, and cache it until shortly before expiry.
async function getLineToken(): Promise<string | null> {
  const staticToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')
  if (staticToken) return staticToken

  const id = Deno.env.get('LINE_CHANNEL_ID')
  const secret = Deno.env.get('LINE_CHANNEL_SECRET')
  if (!id || !secret) return null

  if (_tokenCache && _tokenCache.expiresAt > Date.now()) return _tokenCache.token

  const res = await fetch('https://api.line.me/v2/oauth/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: id,
      client_secret: secret,
    }),
  })
  if (!res.ok) {
    console.error('LINE token mint failed:', res.status, await res.text())
    return null
  }
  const { access_token, expires_in } = await res.json()
  // Refresh 1 day before the real expiry to be safe
  _tokenCache = { token: access_token, expiresAt: Date.now() + (expires_in - 86400) * 1000 }
  return access_token
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    // Two modes:
    //  • attendance: { student_id, action: 'in'|'out', log_id }      → text message
    //  • photo:      { student_id, photo_url, caption? }             → caption + image
    const { student_id, action, log_id, photo_url, caption } = await req.json()
    if (!student_id) return json({ error: 'Missing student_id' }, 400)

    const isPhoto = Boolean(photo_url)
    if (!isPhoto && (!log_id || !['in', 'out'].includes(action))) {
      return json({ error: 'Missing or invalid fields' }, 400)
    }

    const token = await getLineToken()
    if (!token) return json({ error: 'LINE credentials not configured' }, 500)

    // Service role bypasses RLS — read guardian + log + subject server-side
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // 1. Student + guardian LINE id
    const { data: student, error: sErr } = await supabase
      .from('students')
      .select('id, name, nickname, guardian_line_id')
      .eq('id', student_id)
      .maybeSingle()

    if (sErr) return json({ error: 'DB error (student): ' + sErr.message }, 500)
    if (!student) return json({ error: 'Student not found' }, 404)

    // No guardian connected → nothing to send (not an error)
    if (!student.guardian_line_id) return json({ ok: true, skipped: 'no_guardian' })

    // 2. Build the LINE messages array
    const messages: unknown[] = []

    if (isPhoto) {
      // Photo mode — optional caption text, then the image
      if (caption) messages.push({ type: 'text', text: String(caption) })
      messages.push({
        type: 'image',
        originalContentUrl: photo_url,
        previewImageUrl: photo_url,
      })
    } else {
      // Attendance mode — verify the log belongs to this student
      const { data: log, error: lErr } = await supabase
        .from('attendance_logs')
        .select('id, student_id, check_in_at, check_out_at, duration_minutes, subjects ( name )')
        .eq('id', log_id)
        .maybeSingle()

      if (lErr) return json({ error: 'DB error (log): ' + lErr.message }, 500)
      if (!log || log.student_id !== student_id) return json({ error: 'Log mismatch' }, 400)

      const who = student.nickname || student.name
      const subject = (log as any).subjects?.name || ''
      const subjPart = subject ? `วิชา ${subject} ` : ''

      let text: string
      if (action === 'in') {
        text = `🔔 ${who} เข้าเรียน ${subjPart}แล้ว\nเวลา ${fmtTime(log.check_in_at)} น.`
      } else {
        const dur = log.duration_minutes ? `\nรวมเวลาเรียน ${log.duration_minutes} นาที` : ''
        const out = log.check_out_at ? fmtTime(log.check_out_at) : fmtTime(new Date().toISOString())
        text = `🔔 ${who} เลิกเรียน ${subjPart}แล้ว\nเวลา ${out} น.${dur}`
      }
      messages.push({ type: 'text', text })
    }

    // 3. Push to LINE Messaging API
    const lineRes = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ to: student.guardian_line_id, messages }),
    })

    if (!lineRes.ok) {
      const err = await lineRes.text()
      console.error('LINE push error:', lineRes.status, err)
      return json({ error: 'LINE push failed', detail: err }, 502)
    }

    return json({ ok: true, sent: true })

  } catch (e) {
    console.error('notify-guardian error:', e)
    return json({ error: String(e) }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
