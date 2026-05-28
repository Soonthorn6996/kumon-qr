// ClassScan Service Worker — push notifications
self.addEventListener('message', event => {
  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag } = event.data
    self.registration.showNotification(title, {
      body,
      tag: tag || 'classscan',
      icon: '/LOGO.jpg',
      badge: '/LOGO.jpg',
      renotify: true,
    })
  }
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes('/dashboard.html') && 'focus' in c) return c.focus()
      }
      if (clients.openWindow) return clients.openWindow('/dashboard.html')
    })
  )
})
