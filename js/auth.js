import { supabase } from './supabase.js'

// เรียกที่ต้นทุกหน้า (ยกเว้น login.html) — redirect ถ้าไม่ได้ login
export async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    window.location.replace('/login.html')
  }
  return session
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

function clearStoredAuth() {
  for (const storage of [localStorage, sessionStorage]) {
    Object.keys(storage).forEach(key => {
      if (
        key === 'supabase.auth.token' ||
        key.includes('supabase.auth.token') ||
        /^sb-.+-auth-token$/.test(key)
      ) {
        storage.removeItem(key)
      }
    })
  }
}

export async function logout(event) {
  event?.preventDefault?.()
  event?.currentTarget?.setAttribute?.('disabled', 'true')

  try {
    await Promise.race([
      supabase.auth.signOut(),
      new Promise(resolve => setTimeout(resolve, 2500)),
    ])
  } catch (err) {
    console.warn('Logout fallback:', err)
  } finally {
    clearStoredAuth()
    window.location.replace('/login.html')
  }
}
