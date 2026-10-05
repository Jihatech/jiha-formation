-- 0003_cohort_pilot_layer.sql
-- Couche « cohorte pilote » (Phase 2). Tables additives, RLS par utilisateur.
-- cohorts/cohort_days : lecture pour tout utilisateur connecté (écriture : service_role/dashboard).
-- enrollments/tasks/weekly_checkins/doc_submissions : CRUD limité à SA propre ligne (auth.uid()).

-- 1) Cohortes
create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_fr text not null,
  title_en text not null,
  start_date date,
  duration_days integer not null default 45,
  discord_invite_url text,
  status text not null default 'draft' check (status in ('draft','open','running','archived')),
  created_at timestamptz not null default now()
);
comment on table public.cohorts is 'Cohortes du pilote « DevOps en local » (Phase 2).';

-- 2) Plan jour-par-jour
create table if not exists public.cohort_days (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  day_index integer not null,
  title_fr text not null,
  title_en text not null,
  body_fr text,
  body_en text,
  guide_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (cohort_id, day_index)
);
create index if not exists cohort_days_cohort_idx on public.cohort_days (cohort_id, day_index);

-- 3) Inscriptions
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('member','coach')),
  joined_at timestamptz not null default now(),
  unique (cohort_id, user_id)
);
create index if not exists enrollments_user_idx on public.enrollments (user_id);

-- 4) Tâches (Kanban)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cohort_id uuid references public.cohorts(id) on delete set null,
  title text not null,
  status text not null default 'todo' check (status in ('todo','doing','done')),
  day_index integer,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tasks_user_idx on public.tasks (user_id, status, sort);

-- 5) Check-ins hebdo
create table if not exists public.weekly_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  week_index integer not null,
  done text,
  blockers text,
  next_step text,
  created_at timestamptz not null default now(),
  unique (cohort_id, user_id, week_index)
);

-- 6) Documents (façon Confluence)
create table if not exists public.doc_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cohort_id uuid references public.cohorts(id) on delete set null,
  title text not null,
  body_md text not null default '',
  status text not null default 'draft' check (status in ('draft','submitted','reviewed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists doc_submissions_user_idx on public.doc_submissions (user_id, updated_at desc);

-- RLS
alter table public.cohorts enable row level security;
alter table public.cohort_days enable row level security;
alter table public.enrollments enable row level security;
alter table public.tasks enable row level security;
alter table public.weekly_checkins enable row level security;
alter table public.doc_submissions enable row level security;

create policy "cohorts_select_auth" on public.cohorts
  for select to authenticated using (true);

create policy "cohort_days_select_auth" on public.cohort_days
  for select to authenticated using (true);

create policy "enrollments_select_own" on public.enrollments
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "enrollments_insert_own" on public.enrollments
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "enrollments_delete_own" on public.enrollments
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "tasks_select_own" on public.tasks
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "tasks_insert_own" on public.tasks
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "tasks_update_own" on public.tasks
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "tasks_delete_own" on public.tasks
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "weekly_select_own" on public.weekly_checkins
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "weekly_insert_own" on public.weekly_checkins
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "weekly_update_own" on public.weekly_checkins
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "docs_select_own" on public.doc_submissions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "docs_insert_own" on public.doc_submissions
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "docs_update_own" on public.doc_submissions
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "docs_delete_own" on public.doc_submissions
  for delete to authenticated using ((select auth.uid()) = user_id);
