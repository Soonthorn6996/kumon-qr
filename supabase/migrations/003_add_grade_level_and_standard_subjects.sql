-- ============================================================
-- ClassScan — Grade level + standard subject names
-- Run after 001_initial_schema.sql and 002_harden_student_qr_flow.sql
-- ============================================================

alter table public.students
  add column if not exists grade_level text;

alter table public.students
  drop column if exists line_user_id;

-- Ensure the three canonical subjects exist.
insert into public.subjects (name, color)
select 'MATH', 'red'
where not exists (
  select 1 from public.subjects where lower(name) = 'math'
);

insert into public.subjects (name, color)
select 'THAI', 'green'
where not exists (
  select 1 from public.subjects where lower(name) = 'thai'
);

insert into public.subjects (name, color)
select 'ENG', 'blue'
where not exists (
  select 1 from public.subjects where lower(name) in ('eng', 'english')
);

-- Merge legacy aliases into canonical MATH / THAI / ENG rows without
-- breaking existing student_subjects mappings.
with subject_aliases as (
  select
    id,
    name,
    color,
    created_at,
    case
      when lower(name) = 'math' then 'MATH'
      when lower(name) = 'thai' then 'THAI'
      when lower(name) in ('eng', 'english') then 'ENG'
    end as target_name
  from public.subjects
  where lower(name) in ('math', 'thai', 'eng', 'english')
),
ranked_subjects as (
  select
    id,
    target_name,
    first_value(id) over (
      partition by target_name
      order by (upper(name) = target_name) desc, created_at, id
    ) as keep_id,
    row_number() over (
      partition by target_name
      order by (upper(name) = target_name) desc, created_at, id
    ) as rn
  from subject_aliases
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

with subject_aliases as (
  select
    id,
    name,
    created_at,
    case
      when lower(name) = 'math' then 'MATH'
      when lower(name) = 'thai' then 'THAI'
      when lower(name) in ('eng', 'english') then 'ENG'
    end as target_name
  from public.subjects
  where lower(name) in ('math', 'thai', 'eng', 'english')
),
ranked_subjects as (
  select
    id,
    first_value(id) over (
      partition by target_name
      order by (upper(name) = target_name) desc, created_at, id
    ) as keep_id,
    row_number() over (
      partition by target_name
      order by (upper(name) = target_name) desc, created_at, id
    ) as rn
  from subject_aliases
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

with subject_aliases as (
  select
    id,
    name,
    created_at,
    case
      when lower(name) = 'math' then 'MATH'
      when lower(name) = 'thai' then 'THAI'
      when lower(name) in ('eng', 'english') then 'ENG'
    end as target_name
  from public.subjects
  where lower(name) in ('math', 'thai', 'eng', 'english')
),
ranked_subjects as (
  select
    id,
    row_number() over (
      partition by target_name
      order by (upper(name) = target_name) desc, created_at, id
    ) as rn
  from subject_aliases
)
delete from public.subjects s
using ranked_subjects rs
where s.id = rs.id
  and rs.rn > 1;

update public.subjects
set
  name = 'MATH',
  color = 'red'
where lower(name) = 'math';

update public.subjects
set
  name = 'THAI',
  color = 'green'
where lower(name) = 'thai';

update public.subjects
set
  name = 'ENG',
  color = 'blue'
where lower(name) in ('eng', 'english');

create index if not exists idx_students_grade_level
  on public.students(grade_level);
