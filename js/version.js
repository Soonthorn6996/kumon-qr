(function () {
  const APP_VERSION = '1.3.0'
  const BUILD_LABEL = '2026-05-28'

  window.CLASS_SCAN_VERSION = APP_VERSION

  function mountVersionBadge() {
    if (document.getElementById('appVersionBadge')) return

    const style = document.createElement('style')
    style.textContent = `
      .app-version-badge {
        position: fixed;
        right: 10px;
        bottom: 10px;
        z-index: 9999;
        padding: 5px 9px;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, .45);
        background: rgba(15, 23, 42, .78);
        color: #fff;
        font: 600 11px/1.2 'Segoe UI', Tahoma, sans-serif;
        letter-spacing: 0;
        box-shadow: 0 4px 12px rgba(15, 23, 42, .18);
        backdrop-filter: blur(6px);
        user-select: none;
      }

      @media print {
        .app-version-badge { display: none; }
      }

      @media (max-width: 480px) {
        .app-version-badge {
          right: 8px;
          bottom: 8px;
          font-size: 10px;
          padding: 4px 7px;
        }
      }
    `

    const badge = document.createElement('div')
    badge.id = 'appVersionBadge'
    badge.className = 'app-version-badge'
    badge.textContent = `ClassScan v${APP_VERSION}`
    badge.title = `ClassScan version ${APP_VERSION} (${BUILD_LABEL})`

    document.head.appendChild(style)
    document.body.appendChild(badge)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountVersionBadge)
  } else {
    mountVersionBadge()
  }
})()
