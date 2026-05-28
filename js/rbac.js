import { supabase } from './supabase.js'

export const ROLE = { ADMIN: 'admin', TEACHER: 'teacher', VIEW: 'view' }

// Pages each role may access
const ACCESS = {
  admin:   ['dashboard', 'scan', 'admin_panel', 'settings'],
  teacher: ['dashboard', 'scan', 'admin_panel'],
  view:    ['dashboard'],
}

const LABELS = {
  th: { admin: 'ผู้ดูแลระบบ', teacher: 'ครูผู้ช่วย', view: 'ดูอย่างเดียว' },
  en: { admin: 'Admin',       teacher: 'Teacher',     view: 'View Only'   },
}

const BADGE_CLASS = { admin: 'badge-admin', teacher: 'badge-teacher', view: 'badge-view' }

let _cache = null

export async function getProfile() {
  if (_cache) return _cache
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  const { data } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('id', session.user.id)
    .maybeSingle()
  // Graceful fallback: if profiles table/column not yet migrated, treat as admin
  _cache = data ?? { id: session.user.id, email: session.user.email, role: 'admin' }
  return _cache
}

export function clearProfileCache() { _cache = null }

export function canAccess(profile, page) {
  const role = profile?.role || 'view'
  return (ACCESS[role] || []).includes(page)
}

// Call at the top of every protected page instead of requireAuth()
// Returns { session, profile } or null (and redirects on failure)
export async function requirePage(page) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) { window.location.replace('/login.html'); return null }

  const profile = await getProfile()
  if (!canAccess(profile, page)) {
    window.location.replace('/dashboard.html')
    return null
  }
  return { session, profile }
}

export function roleLabel(role, lang = 'th') {
  return LABELS[lang]?.[role] ?? role
}

export function roleBadge(role, lang = 'th') {
  return `<span class="role-badge ${BADGE_CLASS[role] || ''}">${roleLabel(role, lang)}</span>`
}
