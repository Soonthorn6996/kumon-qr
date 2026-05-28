import { supabase } from '/js/supabase.js'

const STORE_KEY = 'classscan_notifs'

export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  return await Notification.requestPermission()
}

export function getPermission() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export async function registerSW() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    return reg
  } catch {
    return null
  }
}

export async function browserNotif(title, body, tag) {
  if (Notification.permission !== 'granted') return
  const reg = await navigator.serviceWorker.ready.catch(() => null)
  if (reg) {
    reg.active?.postMessage({ type: 'SHOW_NOTIFICATION', title, body, tag })
  } else {
    new Notification(title, { body, icon: '/LOGO.jpg' })
  }
}

// Watched student IDs stored in localStorage as a JSON array
export function getLocalWatches() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]') } catch { return [] }
}

function setLocalWatches(ids) {
  localStorage.setItem(STORE_KEY, JSON.stringify(ids))
}

export async function loadWatches(userId) {
  const { data } = await supabase
    .from('user_student_watches')
    .select('student_id')
    .eq('user_id', userId)
  const ids = (data || []).map(r => r.student_id)
  setLocalWatches(ids)
  return ids
}

export async function toggleWatch(userId, studentId, watch) {
  if (watch) {
    await supabase.from('user_student_watches').upsert(
      { user_id: userId, student_id: studentId },
      { onConflict: 'user_id,student_id' }
    )
  } else {
    await supabase.from('user_student_watches')
      .delete()
      .eq('user_id', userId)
      .eq('student_id', studentId)
  }
  const ids = getLocalWatches()
  const next = watch ? [...new Set([...ids, studentId])] : ids.filter(id => id !== studentId)
  setLocalWatches(next)
  return next
}
