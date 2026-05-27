import { supabase } from './supabase.js'

const LOGIN_PATH = '/login.html'
const LOGOUT_TIMEOUT_MS = 3000

let isLoggingOut = false

export async function requireAuth() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) console.warn('Auth session check failed:', error)
  if (!session) redirectToLogin()
  return session
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

function clearStoredAuth() {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      Object.keys(storage).forEach(key => {
        if (
          key === 'supabase.auth.token' ||
          key.startsWith('supabase.auth.') ||
          key.includes('supabase.auth.token') ||
          /^sb-.+-auth-token/.test(key)
        ) {
          storage.removeItem(key)
        }
      })
    } catch (err) {
      console.warn('Unable to clear stored auth:', err)
    }
  }
}

function redirectToLogin() {
  if (window.location.pathname === LOGIN_PATH) return

  const url = new URL(LOGIN_PATH, window.location.origin)
  url.searchParams.set('logged_out', '1')
  window.location.replace(url.pathname + url.search)
}

export async function logout(event) {
  event?.preventDefault?.()
  if (isLoggingOut) return
  isLoggingOut = true

  const button = event?.currentTarget
  button?.setAttribute?.('disabled', 'true')
  if (button) button.textContent = 'กำลังออก...'

  try {
    await Promise.race([
      supabase.auth.signOut({ scope: 'global' }),
      new Promise(resolve => setTimeout(resolve, LOGOUT_TIMEOUT_MS)),
    ])
  } catch (err) {
    console.warn('Logout fallback:', err)
  } finally {
    clearStoredAuth()
    redirectToLogin()
  }
}

supabase.auth.onAuthStateChange(event => {
  if (event === 'SIGNED_OUT') {
    clearStoredAuth()
    redirectToLogin()
  }
})
