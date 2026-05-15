-- ============================================================
-- ClassScan — Harden student/QR attendance flow
-- Safe to run after 001_initial_schema.sql
-- ============================================================

-- Keep subjects unique so seeding Math/Thai/English can be repeated safely.
with ranked_subjects as (
  select
    id,
    first_value(id) over (partition by lower(name) order by created_at, id) as keep_id,
    row_number() over (partition by lower(name) order by created_at, id) as rn
  from public.subjects
),
duplicate_subjects as (
  select id, keep_id
  from ranked_subjects
  where rn > 1
)
delete from public.student_subjects ss
using duplicate_subjects ds
where ss.subject_id = ds.id
  and exists (
    select 1
    from public.student_subjects existing
    where existing.student_id = ss.student_id
      and existing.subject_id = ds.keep_id
  );

with ranked_subjects as (
  select
    id,
    first_value(id) over (partition by lower(name) order by created_at, id) as keep_id,
    row_number() over (partition by lower(name) order by created_at, id) as rn
  from public.subjects
),
duplicate_subjects as (
  select id, keep_id
  from ranked_subjects
  where rn > 1
)
update public.student_subjects ss
set subject_id = ds.keep_id
from duplicate_subjects ds
where ss.subject_id = ds.id;

with ranked_subjects as (
  select
    id,
    row_number() over (partition by lower(name) order by created_at, id) as rn
  from public.subjects
)
delete from public.subjects s
using ranked_subjects rs
where s.id = rs.id
  and rs.rn > 1;

create unique index if not exists idx_subjects_name_unique
  on public.subjects (lower(name));

insert into public.subjects (name, color) values
  ('Math',    'red'),
  ('Thai',    'green'),
  ('English', 'blue')
on conflict do nothing;

create index if not exists idx_students_active_name
  on public.students(is_active, name);

create index if not exists idx_student_subjects_subject
  on public.student_subjects(subject_id);

create index if not exists idx_att_subject
  on public.attendance_logs(subject_id);

create index if not exists idx_att_created
  on public.attendance_logs(created_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'attendance_duration_nonnegative'
      and conrelid = 'public.attendance_logs'::regclass
  ) then
    alter table public.attendance_logs
      add constraint attendance_duration_nonnegative
      check (duration_minutes is null or duration_minutes >= 0);
  end if;
end $$;
