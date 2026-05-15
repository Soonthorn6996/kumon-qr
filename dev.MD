# PROJECT_DOCS.md — ClassScan (ระบบลงเวลาเรียน)

> รวม README · AGENTS · ARCHITECTURE · API · DATABASE · TESTING · DEPLOYMENT · SECURITY ไว้ในไฟล์เดียว สำหรับใช้กับ Claude Code

---

# README

## ClassScan

> ระบบลงเวลาเรียนสำหรับโรงเรียนกวดวิชา — สแกน QR Code เข้า-ออกห้องเรียน แจ้งเตือน LINE ผู้ปกครอง และดู Dashboard แบบ Real-time

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML + Vanilla JS (Static, hosted on Vercel) |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| QR Scanning | HTML5 QR Code library (jsQR / html5-qrcode) หรือ Webcam |
| Notification | LINE Messaging API / LINE Notify |
| Hosting | Vercel (Frontend), Supabase Cloud (Backend) |
| CI/CD | GitHub → Vercel auto-deploy |

### Quick Start

```bash
# Clone repo
git clone https://github.com/your-org/classscan.git
cd classscan

# ไม่มี build step — เปิด index.html ใน browser ได้เลย
# หรือ serve local:
npx serve .
```

### Environment Variables

สร้างไฟล์ `.env` หรือใส่ใน Vercel Dashboard:

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
LINE_NOTIFY_TOKEN=xxx          # หรือ LINE Messaging API credentials
LINE_CHANNEL_ACCESS_TOKEN=xxx
LINE_CHANNEL_SECRET=xxx
```

### Common Commands

```bash
npx serve .                    # Run local dev server
# Deploy: push to main branch → Vercel auto-deploy
```

---

# AGENTS.md — AI Agent Guide

## Project Snapshot

| Field | Value |
|-------|-------|
| Name | ClassScan |
| Type | Static Web App + Supabase Backend |
| Frontend | HTML + Vanilla JS |
| Backend | Supabase (PostgreSQL, Realtime, Edge Functions) |
| Notifications | LINE Messaging API |
| Hosting | Vercel (web) + Supabase Cloud |

## Most Important Files

| File / Directory | What it does |
|-----------------|-------------|
| `index.html` | หน้าหลัก — แยก view ตาม URL hash หรือ query param |
| `scan.html` | หน้าสแกน QR (หน้าจอที่เคาน์เตอร์) |
| `dashboard.html` | Admin Dashboard — แสดงสถานะนักเรียน Real-time |
| `admin.html` | จัดการข้อมูลนักเรียน / วิชา |
| `js/supabase.js` | Supabase client singleton |
| `js/scanner.js` | Logic สแกน QR + บันทึก check-in/out |
| `js/dashboard.js` | Realtime subscription + color-coded status |
| `js/lineNotify.js` | ส่ง LINE notification ผ่าน Edge Function |
| `supabase/functions/notify/` | Supabase Edge Function สำหรับส่ง LINE (ไม่ expose token ฝั่ง client) |
| `supabase/migrations/` | SQL migration files |

## Coding Conventions

### Frontend (HTML + JS)
- ไม่มี framework — ใช้ vanilla JS ES modules
- Import Supabase จาก CDN: `import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'`
- LINE token **ห้าม** อยู่ใน client-side JS — ต้องผ่าน Supabase Edge Function เท่านั้น
- QR scanning ใช้ webcam ผ่าน `html5-qrcode` library
- Status color logic: เขียน (<60 min) → เหลือง (60–90 min) → แดง (>90 min)

### Supabase
- ใช้ `supabase.from('table').select/insert/update` — ไม่ใช้ raw SQL ใน client
- Realtime: subscribe ผ่าน `supabase.channel()` สำหรับ dashboard
- Edge Functions: ใช้ Deno runtime, เขียนใน `supabase/functions/<name>/index.ts`
- Row Level Security (RLS) ต้องเปิดทุก table

### ห้ามทำ
- ห้ามใส่ `LINE_CHANNEL_ACCESS_TOKEN` หรือ secret ใดๆ ใน client JS
- ห้าม disable RLS บน Supabase
- ห้ามเก็บ session นักเรียนค้างไว้โดยไม่มี timeout logic

## Adding a New Feature (Checklist)

- [ ] ถ้ามี schema ใหม่ → เขียน migration SQL ใน `supabase/migrations/`
- [ ] ถ้า expose secret → ใช้ Edge Function
- [ ] อัปเดต RLS policy ให้ครอบคลุม table ใหม่
- [ ] เพิ่ม LINE notification template ใน `js/lineNotify.js` ถ้ามี event ใหม่
- [ ] ทดสอบ QR flow ด้วย mock QR ก่อน deploy

---

# ARCHITECTURE.md

## System Summary

ClassScan เป็น Static Web App ที่ไม่มี custom backend server — ใช้ **Supabase** เป็น Backend-as-a-Service ครบวงจร (Database, Auth, Realtime, Edge Functions) และ **Vercel** host ไฟล์ HTML/JS

## High-Level Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                     │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  scan.html   │  │dashboard.html│  │  admin.html  │  │
│  │  (QR Scan)   │  │(Realtime UI) │  │ (Management) │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         └─────────────────┼──────────────────┘          │
│                    Supabase JS SDK                       │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────┐
│                      Supabase Cloud                     │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │  Realtime    │  │Edge Functions│  │
│  │  (Database)  │  │  (WebSocket) │  │(LINE Notify) │  │
│  └──────────────┘  └──────────────┘  └──────┬───────┘  │
└──────────────────────────────────────────────┼──────────┘
                                               │ HTTPS POST
                                    ┌──────────▼──────────┐
                                    │   LINE Messaging API │
                                    │   (แจ้งเตือนผู้ปกครอง) │
                                    └─────────────────────┘
```

## Key Data Flows

### 1. Check-in (สแกนเข้า)
```
นักเรียนยื่น QR Code → Webcam อ่าน QR (student_id + subject_id)
  → ตรวจสอบว่ามี session เปิดอยู่ไหม (ป้องกัน double check-in)
  → INSERT attendance_logs (student_id, subject_id, check_in_at)
  → เรียก Edge Function notify → LINE แจ้งผู้ปกครอง
  → แสดงชื่อ + วิชา + เวลาบนหน้าจอ + เสียงสัญญาณ
```

### 2. Check-out (สแกนออก)
```
นักเรียนสแกน QR อีกครั้ง
  → UPDATE attendance_logs SET check_out_at = now() WHERE session ยังเปิดอยู่
  → คำนวณ duration_minutes
  → เรียก Edge Function notify → LINE แจ้ง + บอกระยะเวลา
```

### 3. Dashboard Realtime
```
dashboard.html เปิด → supabase.channel('attendance').on('INSERT'/'UPDATE')
  → รับ event แบบ WebSocket
  → อัปเดต UI + คำนวณสี (เขียว/เหลือง/แดง) จาก elapsed time
  → setInterval ทุก 1 นาที เพื่อ re-evaluate สีทุก card
```

### 4. Multi-subject (เรียน 2 วิชา)
```
วิชา 1: QR สีแดง (Math) → IN → OUT → session ปิด
วิชา 2: QR สีฟ้า (English) → เปิด session ใหม่อิสระ
(แต่ละ session ผูกกับ subject_id ต่างกัน ไม่รวมกัน)
```

## Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| No custom server | Supabase BaaS | ลดความซับซ้อน ไม่ต้องดูแล server |
| LINE Notify via Edge Function | Supabase Edge Function | ซ่อน token จาก client |
| Static frontend | HTML + Vanilla JS | ง่าย deploy บน Vercel, ไม่มี build step |
| Realtime | Supabase Realtime | WebSocket built-in, ไม่ต้อง polling |

---

# DATABASE.md

## Overview

ใช้ **PostgreSQL บน Supabase Cloud** เข้าถึงผ่าน Supabase JS SDK และ REST API อัตโนมัติ

## Connection

```js
// js/supabase.js — singleton client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

export const supabase = createClient(
  import.meta.env?.VITE_SUPABASE_URL ?? window.ENV.SUPABASE_URL,
  import.meta.env?.VITE_SUPABASE_ANON_KEY ?? window.ENV.SUPABASE_ANON_KEY
)
```

## Schema

### students
```sql
CREATE TABLE students (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,           -- ชื่อจริง
  nickname    TEXT,                    -- ชื่อเล่น (แสดงบน dashboard)
  photo_url   TEXT,                    -- รูปภาพ (optional)
  line_user_id TEXT,                   -- LINE User ID ของผู้ปกครอง
  qr_code     TEXT UNIQUE NOT NULL,    -- ค่าที่เข้ารหัสใน QR Code
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### subjects
```sql
CREATE TABLE subjects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,           -- เช่น "Math", "English"
  color       TEXT DEFAULT 'blue',     -- สี QR / badge
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### student_subjects (นักเรียน-วิชาที่ลงทะเบียน)
```sql
CREATE TABLE student_subjects (
  student_id  UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id  UUID REFERENCES subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (student_id, subject_id)
);
```

### attendance_logs
```sql
CREATE TABLE attendance_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID REFERENCES students(id),
  subject_id       UUID REFERENCES subjects(id),
  check_in_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_out_at     TIMESTAMPTZ,                        -- NULL = ยังอยู่ในห้อง
  duration_minutes INTEGER,                            -- คำนวณตอน check-out
  note             TEXT,                               -- บันทึกของครู (ลับ)
  created_at       TIMESTAMPTZ DEFAULT now()
);
```

### indexes
```sql
CREATE INDEX idx_attendance_student ON attendance_logs(student_id);
CREATE INDEX idx_attendance_checkin ON attendance_logs(check_in_at);
CREATE INDEX idx_attendance_open_session ON attendance_logs(student_id, subject_id)
  WHERE check_out_at IS NULL;   -- หา open session ได้เร็ว
```

## Row Level Security (RLS)

```sql
-- เปิด RLS ทุก table
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

-- Allow anon read สำหรับ scan page (ถ้าต้องการ lock down ให้ใช้ service_role key ใน Edge Function แทน)
CREATE POLICY "allow_read" ON students FOR SELECT USING (true);
CREATE POLICY "allow_insert_attendance" ON attendance_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_update_attendance" ON attendance_logs FOR UPDATE USING (true);
```

## Migrations

Migration files เก็บที่ `supabase/migrations/<timestamp>_<name>.sql`

```bash
# Apply migration ด้วย Supabase CLI
supabase db push

# หรือรัน SQL ตรงใน Supabase Dashboard > SQL Editor
```

## Supabase Client Usage

```js
// Check-in
await supabase.from('attendance_logs').insert({
  student_id: student.id,
  subject_id: subject.id,
  check_in_at: new Date().toISOString()
})

// Check-out + คำนวณ duration
const { data: session } = await supabase
  .from('attendance_logs')
  .select('*')
  .eq('student_id', studentId)
  .eq('subject_id', subjectId)
  .is('check_out_at', null)
  .single()

const duration = Math.round((Date.now() - new Date(session.check_in_at)) / 60000)

await supabase.from('attendance_logs').update({
  check_out_at: new Date().toISOString(),
  duration_minutes: duration
}).eq('id', session.id)
```

---

# API.md

## Overview

ClassScan ไม่มี custom REST API server — ใช้ **Supabase Auto-generated REST API** และ **Supabase Edge Functions** สำหรับ action ที่ต้องการ secret

## Supabase REST (Auto-generated)

Base URL: `https://<project-ref>.supabase.co/rest/v1/`

ทุก request ต้องใส่ header:
```
apikey: <SUPABASE_ANON_KEY>
Authorization: Bearer <SUPABASE_ANON_KEY>
```

### Endpoints ที่ใช้หลัก

| Method | Path | Description |
|--------|------|-------------|
| GET | `/students?qr_code=eq.<value>` | Lookup นักเรียนจาก QR |
| POST | `/attendance_logs` | บันทึก check-in |
| PATCH | `/attendance_logs?id=eq.<id>` | บันทึก check-out |
| GET | `/attendance_logs?check_out_at=is.null` | ดึง open sessions ทั้งหมด |
| GET | `/students` | รายชื่อนักเรียนทั้งหมด (admin) |
| POST | `/students` | เพิ่มนักเรียน |
| PATCH | `/students?id=eq.<id>` | แก้ไขข้อมูลนักเรียน |

## Supabase Edge Functions

### `POST /functions/v1/notify`

ส่ง LINE notification — **ต้องเรียกจาก client แทนที่จะ call LINE API โดยตรง** เพื่อซ่อน token

**Body:**
```json
{
  "event": "check_in",
  "student_name": "น้องมิ้น",
  "subject_name": "Math",
  "time": "09:30",
  "line_user_id": "Uxxxxxxx"
}
```

**Response 200:**
```json
{ "ok": true }
```

Event types: `check_in` | `check_out`

สำหรับ `check_out` ให้เพิ่ม field:
```json
{
  "event": "check_out",
  "duration_minutes": 65
}
```

### Edge Function Location

```
supabase/functions/notify/index.ts
```

```typescript
// supabase/functions/notify/index.ts
import { serve } from "https://deno.land/std/http/server.ts"

serve(async (req) => {
  const { event, student_name, subject_name, time, line_user_id, duration_minutes } = await req.json()

  const message = event === 'check_in'
    ? `น้อง${student_name} เริ่มเรียนวิชา${subject_name} แล้วเวลา ${time} น.`
    : `น้อง${student_name} เรียนวิชา${subject_name} เสร็จแล้วเวลา ${time} น. ใช้เวลารวม ${duration_minutes} นาที`

  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: line_user_id,
      messages: [{ type: 'text', text: message }]
    })
  })

  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
})
```

---

# TESTING.md

## Test Approach

โปรเจกต์นี้เป็น static HTML — ไม่มี unit test framework แบบ Jest/Vitest แต่ใช้แนวทางต่อไปนี้

## Manual Test Checklist

### QR Scan Flow
- [ ] สแกน QR ที่ valid → แสดงชื่อ + วิชา + เสียงสัญญาณ
- [ ] สแกน QR ซ้ำ (ยังไม่ได้ check-out) → ระบบ check-out ให้อัตโนมัติ หรือ block พร้อม warning
- [ ] สแกน QR ที่ไม่มีในระบบ → แสดง error message
- [ ] เรียน 2 วิชาต่อเนื่อง → session แยกกัน ไม่รวมเวลา

### LINE Notification
- [ ] Check-in → ผู้ปกครองได้รับข้อความภายใน 5 วินาที
- [ ] Check-out → ผู้ปกครองได้รับข้อความพร้อมระยะเวลา
- [ ] กรณีไม่มี `line_user_id` → ไม่ error, แค่ skip

### Dashboard
- [ ] เปิด dashboard → เห็นนักเรียนที่กำลังเรียนทั้งหมด
- [ ] เปลี่ยนสีอัตโนมัติ: เขียว (< 60 min), เหลือง (60–90 min), แดง (> 90 min)
- [ ] Realtime: เมื่อมี check-in ใหม่ → card ปรากฏโดยไม่ต้อง refresh
- [ ] บันทึก Note → บันทึกใน DB, ไม่แสดงให้ผู้ปกครองเห็น

### Admin Panel
- [ ] เพิ่มนักเรียนใหม่ → ปรากฏในรายชื่อ
- [ ] แก้ไขข้อมูล → บันทึกสำเร็จ
- [ ] ดูรายงานรายเดือน → แสดงเวลาสุทธิถูกต้อง

## Local Testing

```bash
# Serve local
npx serve .

# ทดสอบ Edge Function local
supabase functions serve notify --env-file .env.local
```

## Supabase Edge Function Test

```bash
curl -X POST http://localhost:54321/functions/v1/notify \
  -H "Content-Type: application/json" \
  -d '{"event":"check_in","student_name":"มิ้น","subject_name":"Math","time":"09:30","line_user_id":"TEST"}'
```

---

# DEPLOYMENT.md

## Infrastructure Overview

| Component | Platform | Notes |
|-----------|---------|-------|
| Frontend HTML/JS | Vercel | Auto-deploy จาก `main` branch |
| Database + Realtime | Supabase Cloud | Free tier รองรับได้ |
| Edge Functions | Supabase Cloud | Deploy ด้วย Supabase CLI |
| LINE Notification | LINE Messaging API | ผ่าน Edge Function |

## Environments

| Environment | Branch | URL |
|-------------|--------|-----|
| Development | local | `http://localhost:3000` |
| Production | `main` | `https://classscan.vercel.app` |

## Local Development

```bash
# 1. Clone
git clone https://github.com/your-org/classscan.git
cd classscan

# 2. ติดตั้ง Supabase CLI
npm install -g supabase

# 3. สร้าง .env.local
cp .env.example .env.local
# ใส่ SUPABASE_URL, SUPABASE_ANON_KEY จาก Supabase Dashboard

# 4. Run local
npx serve .
# หรือ
python3 -m http.server 3000

# 5. Run Edge Functions local
supabase functions serve notify --env-file .env.local
```

## Deploy Frontend (Vercel)

```bash
# ครั้งแรก
npm install -g vercel
vercel login
vercel --prod

# หลังจากนั้น push to main → auto-deploy
git push origin main
```

ตั้งค่า Environment Variables ใน Vercel Dashboard:
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

**หมายเหตุ:** เนื่องจากเป็น static HTML (ไม่ใช่ Next.js) ให้ inject ตัวแปรผ่าน `window.ENV` หรือ fetch จาก endpoint แทน `process.env`

```html
<!-- index.html -->
<script>
  window.ENV = {
    SUPABASE_URL: "%%SUPABASE_URL%%",    // Vercel จะ replace ตอน build
    SUPABASE_ANON_KEY: "%%SUPABASE_ANON_KEY%%"
  }
</script>
```

หรือใช้ Vercel Edge Config / Environment injection ผ่าน `vercel.json`:

```json
{
  "env": {
    "SUPABASE_URL": "@supabase_url",
    "SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

## Deploy Edge Functions (Supabase)

```bash
# Deploy notify function
supabase functions deploy notify --project-ref <your-project-ref>

# ตั้งค่า secret
supabase secrets set LINE_CHANNEL_ACCESS_TOKEN=xxx --project-ref <ref>
supabase secrets set LINE_CHANNEL_SECRET=xxx --project-ref <ref>
```

## Database Migrations

```bash
# Apply migrations
supabase db push --project-ref <ref>

# หรือ รัน SQL ใน Supabase Dashboard > SQL Editor
```

## CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-functions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase functions deploy notify --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
  # Vercel deploy ทำงานอัตโนมัติเมื่อ push to main อยู่แล้ว
```

## Rollback

- **Frontend:** Vercel Dashboard → Deployments → เลือก deployment ก่อนหน้า → Promote to Production
- **Edge Function:** `supabase functions deploy notify` พร้อม commit เก่า
- **Database:** ไม่มี auto down-migration — เขียน SQL rollback แล้วรันใน SQL Editor

---

# SECURITY.md

## Authentication

ระบบนี้ไม่มี user login สำหรับผู้ใช้ทั่วไป — ใช้ **Supabase Anon Key** สำหรับ scan page และ **Supabase Service Role Key** (เฉพาะ Edge Functions เท่านั้น)

| Key | ใช้ที่ไหน | เก็บที่ไหน |
|-----|----------|----------|
| `SUPABASE_ANON_KEY` | Client JS (scan, dashboard) | Public (ปลอดภัยเพราะ RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | ห้ามใช้ใน client เด็ดขาด | Supabase Edge Function secrets เท่านั้น |
| `LINE_CHANNEL_ACCESS_TOKEN` | ส่ง LINE message | Supabase Edge Function secrets เท่านั้น |

## Row Level Security (RLS)

**ต้องเปิด RLS ทุก table** — นี่คือ security layer หลักของระบบ

```sql
-- ตรวจสอบว่า RLS เปิดอยู่
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

Policy ขั้นต่ำที่แนะนำ:
- `students`: SELECT open, INSERT/UPDATE/DELETE ต้องการ auth หรือ service_role
- `attendance_logs`: INSERT open (scan page ต้องบันทึกได้), UPDATE/DELETE ต้องการ auth

## Secrets Management

**ห้ามโดยเด็ดขาด:**
- ห้ามใส่ `LINE_CHANNEL_ACCESS_TOKEN` ใน HTML หรือ JS ที่ส่งไป browser
- ห้าม commit `.env` หรือ `.env.local` ลง Git

```bash
# .gitignore
.env
.env.local
.env.*.local
```

**วิธีที่ถูกต้อง:**
```bash
# ตั้งค่า secret ใน Supabase (ไม่เคย commit)
supabase secrets set LINE_CHANNEL_ACCESS_TOKEN=xxx

# ตั้งค่าใน Vercel (สำหรับ SUPABASE_URL, ANON_KEY ที่ต้องใช้ใน client)
vercel env add SUPABASE_URL
```

## QR Code Security

- QR Code ควรเป็น UUID หรือ random token (ไม่ใช่ student ID ตรงๆ)
- ถ้า QR หาย → Admin reset `qr_code` ใน student record ได้
- พิจารณาเพิ่ม rate limiting: ป้องกันสแกน QR เดียวกันซ้ำหลายรอบใน 1 นาที

## Admin Page Security

- `admin.html` ควรป้องกันด้วย Supabase Auth (email/password) หรืออย่างน้อย HTTP Basic Auth ผ่าน Vercel
- ไม่ควร expose admin page ใน URL สาธารณะโดยไม่มี auth

```js
// ตรวจสอบ session ก่อนแสดง admin content
const { data: { session } } = await supabase.auth.getSession()
if (!session) window.location.href = '/login.html'
```

## Data Privacy

- ข้อมูลที่เก็บ: ชื่อนักเรียน, ชื่อเล่น, รูปภาพ, LINE User ID ของผู้ปกครอง, เวลาเข้า-ออก
- Note ของครู → เก็บใน `attendance_logs.note` → ไม่ส่งให้ผู้ปกครองผ่าน LINE
- ไม่เก็บข้อมูลบัตรเครดิต / ข้อมูลสุขภาพ

## Security Checklist for New Features

- [ ] ไม่มี secret ใน client-side JS
- [ ] RLS policy ครอบคลุม table ใหม่
- [ ] Edge Function ใหม่ใช้ `Deno.env.get()` ไม่ใช่ hardcode
- [ ] QR Code ใหม่ใช้ random token ไม่ใช่ sequential ID
- [ ] Admin feature มี auth guard

---

*Generated by Claude Code · ClassScan Project Docs · May 2026*