import { supabase } from './supabase.js'

// เรียกที่ต้นทุกหน้า (ยกเว้น login.html) — redirect ถ้าไม่ได้ login
export async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    window.location.href = '/login.html'
  }
  return session
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function logout() {
  await supabase.auth.signOut()
  window.location.href = '/login.html'
}
