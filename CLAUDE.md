# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**ClassScan** — QR-code attendance system for KUMON Phonphisai tutoring centre. Students scan in/out per subject; staff manage students and generate QR codes via a web admin panel.

Stack: static HTML + Vanilla JS (ES modules, no build step) · Supabase (PostgreSQL, Auth, Realtime) · Vercel hosting.

---

## Local Development

```bash
# Serve the app (must be served, not opened as file://)
npx serve .
# or
python3 -m http.server 3000
```

Open `http://localhost:3000/login.html`.

There is no build, lint, or test command. All JS runs directly in the browser.

**Required before first run:** copy `js/config.example.js` → `js/config.js` and fill in real values. `js/config.js` is gitignored and must not be committed.

---

## Config / Environment Variables

`js/config.js` exports a global `CONFIG` object loaded as a plain `<script>` tag *before* any `<script type="module">` on every page:

```js
const CONFIG = {
  SUPABASE_URL: '...',
  SUPABASE_ANON_KEY: '...',
}
```

`js/supabase.js` reads `CONFIG` (a browser global, not `process.env`) to create the Supabase client. Never use `import.meta.env` or `process.env` — this is not a Node/Vite project.

---

## Architecture

### Page → Module wiring

Every protected page follows this pattern:

```html
<script src="/js/config.js"></script>           <!-- sets window.CONFIG -->
<script type="module">
  import { requireAuth, logout } from '/js/auth.js'
  import { supabase }            from '/js/supabase.js'
  // page logic
</script>
```

`requireAuth()` checks `supabase.auth.getSession()` and calls `window.location.replace('/login.html')` if there is no session. It returns the session on success.

`logout()` races `supabase.auth.signOut()` against a 2.5 s timeout, then manually clears `localStorage`/`sessionStorage` auth keys, then redirects to `/login.html`.

### QR payload format

QR codes encode exactly `{student.qr_code}:{subject.id}` — two UUID-like parts joined by `:`. `parsePayload()` in `scan.html` splits on `:` and rejects anything with more or fewer parts.

### Subject name convention

After migration 003, the three canonical subject names are **`MATH`**, **`THAI`**, **`ENG`** (upper-case). The `cls()` helper (present in `scan.html` and `admin.html`) maps a subject name to a CSS theme class using case-insensitive substring matching:

```js
function cls(name = '') {
  const n = name.toLowerCase()
  if (n === 'math')      return 'math'
  if (n === 'thai')      return 'thai'
  if (n.includes('eng')) return 'english'
  return 'default'
}
```

Always match subjects case-insensitively; never hard-code the display name.

### Database migrations

Migrations live in `supabase/migrations/` and are run **manually** in the Supabase Dashboard → SQL Editor in order:

| File | Purpose |
|------|---------|
| `001_initial_schema.sql` | Core tables + open RLS (`auth_all`) |
| `002_harden_student_qr_flow.sql` | Dedup subjects, extra indexes, non-negative duration constraint |
| `003_add_grade_level_and_standard_subjects.sql` | Adds `grade_level` column, drops `line_user_id`, canonicalises subject names to MATH/THAI/ENG |

There is no Supabase CLI migration runner configured — always run SQL directly in the dashboard.

### Current schema (post-003)

```
students          id, name, nickname, photo_url, qr_code (unique), grade_level, is_active
subjects          id, name (unique case-insensitive), color
student_subjects  student_id, subject_id  (PK composite)
attendance_logs   id, student_id, subject_id, check_in_at, check_out_at, duration_minutes, note
```

`line_user_id` was removed in migration 003; do not reference it.

Open session = `attendance_logs` row where `check_out_at IS NULL`. The partial index `idx_att_open` covers this lookup.

### RLS

Currently a single `auth_all` policy (any authenticated user can do everything) on all tables. A role-based split (admin vs. parent) is in progress — see the conversation history. Do not add features that assume fine-grained RLS until migration 004 is written.

### Scan flow (`scan.html`)

1. Decode QR → `parsePayload()` → `{qrCode, subjectId}`
2. `saveAttendance()` → look up student by `qr_code`, verify enrollment in `subjectId`
3. If open log exists → check-out (UPDATE with `check_out_at` + `duration_minutes`)
4. Otherwise → check-in (INSERT)
5. 8-second debounce on the same payload to prevent double-scans

### Deployment

- **Frontend**: push to `main` → Vercel auto-deploys from `https://github.com/Soonthorn6996/kumon-qr`
- **Supabase keys for Vercel**: set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Vercel Dashboard (they are injected via `window.ENV` or the `%%VAR%%` Vercel replacement — check `vercel.json` if adding this)
- Edge Functions (LINE notify) are not currently used; ignore `supabase/functions/` references in `dev.MD`.
