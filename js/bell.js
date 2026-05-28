import { supabase }    from '/js/supabase.js'
import { getLocalWatches, loadWatches, browserNotif, registerSW } from '/js/notifications.js'

const BELL_CSS = `
.bell-btn {
  position: relative;
  background: transparent;
  border: 1px solid #3a6a90;
  color: #a0c4dd;
  width: 34px;
  height: 34px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  text-decoration: none;
}
.bell-btn:hover { background: #3a6a90; color: white; }
.bell-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #f97316;
  color: white;
  font-size: .6rem;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  pointer-events: none;
}
`

let _channel = null
let _unreadCount = 0

function injectCSS() {
  if (document.getElementById('bell-style')) return
  const s = document.createElement('style')
  s.id = 'bell-style'
  s.textContent = BELL_CSS
  document.head.appendChild(s)
}

function injectBell(navRight) {
  if (document.getElementById('bellBtn')) return
  const a = document.createElement('a')
  a.id = 'bellBtn'
  a.href = '/notify.html'
  a.className = 'bell-btn'
  a.title = 'การแจ้งเตือน'
  a.innerHTML = '🔔'
  navRight.prepend(a)
}

function updateBadge(count) {
  _unreadCount = count
  const btn = document.getElementById('bellBtn')
  if (!btn) return
  let badge = btn.querySelector('.bell-badge')
  if (count <= 0) {
    badge?.remove()
    return
  }
  if (!badge) {
    badge = document.createElement('span')
    badge.className = 'bell-badge'
    btn.appendChild(badge)
  }
  badge.textContent = count > 9 ? '9+' : count
}

function subscribeRealtime(watchedIds) {
  if (_channel) supabase.removeChannel(_channel)
  if (!watchedIds.length) return

  _channel = supabase
    .channel('bell-attendance')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'attendance_logs',
    }, payload => {
      const row = payload.new
      if (!watchedIds.includes(row.student_id)) return
      updateBadge(_unreadCount + 1)
      browserNotif('นักเรียนเข้าเรียน', `check-in บันทึกแล้ว`, `att-${row.id}`)
    })
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'attendance_logs',
    }, payload => {
      const row = payload.new
      if (!watchedIds.includes(row.student_id)) return
      if (!row.check_out_at) return
      updateBadge(_unreadCount + 1)
      browserNotif('นักเรียนออกจากห้อง', `check-out บันทึกแล้ว`, `att-${row.id}`)
    })
    .subscribe()
}

export async function initBell(session) {
  injectCSS()
  const navRight = document.querySelector('.nav-right')
  if (!navRight) return
  injectBell(navRight)

  await registerSW()
  const watched = await loadWatches(session.user.id)
  subscribeRealtime(watched)

  // Listen for watch changes from other tabs via storage event
  window.addEventListener('storage', e => {
    if (e.key !== 'classscan_notifs') return
    const ids = getLocalWatches()
    subscribeRealtime(ids)
  })
}
