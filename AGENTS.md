# AGENTS.md

Guidance for Codex and other coding agents working in this repository.

## Project

**ClassScan** is a QR-code attendance system for KUMON Phonphisai. Staff manage students, assign one subject, generate QR codes, and scan students in/out from the web app.

Stack:
- Static HTML + Vanilla JS ES modules
- Supabase PostgreSQL + Auth
- Vercel hosting
- No frontend framework

## Local Development

Serve the repository over HTTP. Do not open pages directly with `file://`.

```bash
python -m http.server 8000
```

Open:

```text
http://localhost:8000/login.html
```

There is no normal bundler. Browser code runs directly from the checked-in HTML/JS files.

## Runtime Config

Local development uses `js/config.js`, which is gitignored. Copy `js/config.example.js` to `js/config.js` and fill in real Supabase values.

```js
window.CONFIG = {
  SUPABASE_URL: '...',
  SUPABASE_ANON_KEY: '...',
}
const CONFIG = window.CONFIG
```

Vercel uses `api/config.js`. `vercel.json` rewrites `/js/config.js` to `/api/config`, which returns JavaScript that defines `window.CONFIG`.

Required Vercel environment variables:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
```

`scripts/build-config.js` is only a helper. It must not make Vercel deploy fail if env vars are absent.

## Page Pattern

Protected pages load config first, then use ES modules:

```html
<script src="/js/config.js"></script>
<script type="module">
  import { requireAuth, logout } from '/js/auth.js'
  import { supabase } from '/js/supabase.js'
</script>
```

`requireAuth()` redirects unauthenticated users to `/login.html`.

`logout()` signs out with a timeout fallback, clears Supabase auth tokens from storage, then redirects with `window.location.replace('/login.html')`.

## Main Files

- `login.html`: staff login
- `index.html`: main menu
- `admin.html`: manage students, grade level, subject, and QR codes
- `scan.html`: mobile/webcam scan page for assistant teachers
- `js/auth.js`: auth helpers
- `js/supabase.js`: Supabase client
- `api/config.js`: Vercel runtime config endpoint
- `supabase/migrations/`: SQL migrations run manually in Supabase Dashboard

## QR Payload

QR codes encode exactly:

```text
{student.qr_code}:{subject.id}
```

`scan.html` rejects QR payloads with more or fewer than two colon-separated parts.

## Subjects

Canonical subject display names are:

```text
MATH
THAI
ENG
```

Keep matching case-insensitive. Use the local `cls()` and `subjectLabel()` helpers instead of hard-coding UI color logic in new places.

The admin form uses a subject dropdown. If subjects are missing, `admin.html` attempts to create the defaults in Supabase.

## Grade Levels

Student grade level is stored in `students.grade_level`.

Admin dropdown options:

```text
อ.1, อ.2, อ.3,
ป.1, ป.2, ป.3, ป.4, ป.5, ป.6,
ม.1, ม.2, ม.3, ม.4, ม.5, ม.6
```

Do not reintroduce `line_user_id` or LINE notification fields. This app logs attendance in the web UI only.

## Database

Migrations are run manually in Supabase Dashboard SQL Editor, in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_harden_student_qr_flow.sql`
3. `supabase/migrations/003_add_grade_level_and_standard_subjects.sql`

Current tables:

```text
students          id, name, nickname, photo_url, qr_code, grade_level, is_active, created_at
subjects          id, name, color, created_at
student_subjects  student_id, subject_id
attendance_logs   id, student_id, subject_id, check_in_at, check_out_at, duration_minutes, note, created_at
```

Open attendance session:

```sql
check_out_at is null
```

`line_user_id` is removed by migration 003. New code must not select, insert, update, or display it.

## RLS

Current RLS is simple: authenticated users can access all app tables. Do not assume role-based authorization until a new migration explicitly adds it.

## Scan Flow

`scan.html`:

1. Reads QR from camera or manual input
2. Parses `{qrCode}:{subjectId}`
3. Finds active student by `students.qr_code`
4. Verifies the selected subject is registered for the student
5. If an open log exists, checks out and writes `duration_minutes`
6. Otherwise, inserts a new check-in log
7. Debounces the same QR payload for 8 seconds

## Coding Rules

- Keep the app static and simple. Do not introduce Vite, React, Next.js, or a bundler.
- Keep secrets out of committed files.
- Do not commit `js/config.js`, `.env.local`, or `.claude/`.
- Use UTF-8 and preserve Thai text.
- Prefer small, direct HTML/CSS/JS changes over abstractions.
- After editing page scripts, check syntax by extracting the module script or using a simple browser/local server smoke test.

## Deployment

Push to `main` to trigger Vercel deploy:

```bash
git push origin main
```

If Vercel deploy fails, first check:
- `vercel.json`
- `api/config.js`
- whether `SUPABASE_URL` and `SUPABASE_ANON_KEY` exist in Vercel
- whether `npm run build` exits successfully

