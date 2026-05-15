-- ============================================================
-- ClassScan — Initial Schema
-- รันใน Supabase Dashboard > SQL Editor
-- ============================================================

create extension if not exists "pgcrypto";

-- ─── Tables ──────────────────────────────────────────────────

create table if not exists public.students (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  nickname    text,
  photo_url   text,
  qr_code     text unique not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.subjects (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  color      text not null default 'blue',
  created_at timestamptz not null default now()
);

create table if not exists public.student_subjects (
  student_id uuid not null references public.students(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  primary key (student_id, subject_id)
);

create table if not exists public.attendance_logs (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid references public.students(id),
  subject_id       uuid references public.subjects(id),
  check_in_at      timestamptz not null default now(),
  check_out_at     timestamptz,
  duration_minutes integer,
  note             text,
  created_at       timestamptz not null default now()
);

-- ─── Seed Subjects ───────────────────────────────────────────

insert into public.subjects (name, color) values
  ('Math',    'red'),
  ('Thai',    'green'),
  ('English', 'blue')
on conflict do nothing;

-- ─── Indexes ─────────────────────────────────────────────────

create index if not exists idx_att_student  on public.attendance_logs(student_id);
create index if not exists idx_att_checkin  on public.attendance_logs(check_in_at);
create index if not exists idx_att_open     on public.attendance_logs(student_id, subject_id)
  where check_out_at is null;

-- ─── Row Level Security ──────────────────────────────────────

alter table public.students        enable row level security;
alter table public.subjects        enable row level security;
alter table public.student_subjects enable row level security;
alter table public.attendance_logs enable row level security;

-- Authenticated users เข้าถึงได้ทุก table (ยังไม่แบ่ง role)
create policy "auth_all" on public.students
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "auth_all" on public.subjects
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "auth_all" on public.student_subjects
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "auth_all" on public.attendance_logs
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
