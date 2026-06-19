-- ─────────────────────────────────────────────────────────────────────────────
-- Plateforme jiha.tech — schéma initial (PLATFORM-SPEC §4).
-- La BDD stocke UNIQUEMENT comptes + progression. La structure des guides reste
-- pilotée par guides.json (aucune table `guides`). guide_id = id STABLE du manifeste.
-- À exécuter dans Supabase (SQL Editor) ou via `supabase db push`.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── profiles : 1-1 avec auth.users ──────────────────────────────────────────
create table if not exists public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  preferred_locale text not null default 'fr' check (preferred_locale in ('fr', 'en')),
  consent_at      timestamptz,                 -- consentement RGPD à l'inscription (§3.1)
  created_at      timestamptz not null default now()
);

comment on table public.profiles is 'Profil minimal lié à auth.users (langue préférée, consentement RGPD).';

-- ── progress : progression par utilisateur, granularité par étape ────────────
-- step_id NULL = ligne « niveau guide » ; sinon 'step-xx'.
create table if not exists public.progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  guide_id     text not null,                  -- id stable du manifeste, jamais de FK
  step_id      text,                           -- 'step-03' | NULL (niveau guide)
  status       text not null check (status in ('in_progress', 'completed')),
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  updated_at   timestamptz not null default now()
);

comment on table public.progress is 'Progression par (user, guide, step). guide_id = id manifeste (source de vérité = guides.json).';

-- Unicité : une seule ligne niveau guide (step_id NULL) et une par étape.
-- (NULL distinct en SQL → on sépare via deux index partiels.)
create unique index if not exists progress_guide_level_uidx
  on public.progress (user_id, guide_id) where step_id is null;
create unique index if not exists progress_step_level_uidx
  on public.progress (user_id, guide_id, step_id) where step_id is not null;

create index if not exists progress_user_idx on public.progress (user_id);

-- updated_at auto
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists progress_touch_updated_at on public.progress;
create trigger progress_touch_updated_at
  before update on public.progress
  for each row execute function public.touch_updated_at();

-- ── Création automatique du profil à l'inscription ───────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, preferred_locale, consent_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'preferred_locale', 'fr'),
    case when (new.raw_user_meta_data ->> 'consent') = 'true' then now() else null end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Fonction TRIGGER : ne doit pas être appelable en RPC (les triggers s'exécutent
-- sans privilège EXECUTE de l'appelant). Évite l'exposition via /rest/v1/rpc.
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- ── Row Level Security : chacun ne voit/écrit que SES données ────────────────
alter table public.profiles enable row level security;
alter table public.progress enable row level security;

drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_self_upsert" on public.profiles;
create policy "profiles_self_upsert" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "progress_self_all" on public.progress;
create policy "progress_self_all" on public.progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── RGPD : suppression de compte + données (§3.1) ────────────────────────────
-- Appelée côté serveur via la clé service_role. La cascade ON DELETE supprime
-- profiles + progress quand l'utilisateur auth est supprimé.
create or replace function public.delete_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

-- RGPD : réservé aux utilisateurs connectés (jamais anon). SECURITY DEFINER
-- intentionnel — ne supprime que le compte de auth.uid() (l'appelant lui-même).
revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;

-- ── Upsert de progression (gère les index uniques partiels, que PostgREST ne
-- sait pas cibler directement). security invoker → la RLS s'applique. ───────────
create or replace function public.set_progress(
  p_guide_id text, p_step_id text, p_status text
) returns void language plpgsql security invoker set search_path = public as $$
begin
  if p_status not in ('in_progress', 'completed') then
    raise exception 'invalid status: %', p_status;
  end if;

  if p_step_id is null then
    insert into public.progress (user_id, guide_id, step_id, status, completed_at)
    values (auth.uid(), p_guide_id, null, p_status,
            case when p_status = 'completed' then now() end)
    on conflict (user_id, guide_id) where step_id is null
    do update set status = excluded.status,
                  completed_at = case when excluded.status = 'completed' then now() else null end;
  else
    insert into public.progress (user_id, guide_id, step_id, status, completed_at)
    values (auth.uid(), p_guide_id, p_step_id, p_status,
            case when p_status = 'completed' then now() end)
    on conflict (user_id, guide_id, step_id) where step_id is not null
    do update set status = excluded.status,
                  completed_at = case when excluded.status = 'completed' then now() else null end;
  end if;
end;
$$;

grant execute on function public.set_progress(text, text, text) to authenticated;

-- Annule une progression (retour à « non commencé » = absence de ligne).
create or replace function public.unset_progress(
  p_guide_id text, p_step_id text
) returns void language plpgsql security invoker set search_path = public as $$
begin
  if p_step_id is null then
    delete from public.progress
      where user_id = auth.uid() and guide_id = p_guide_id and step_id is null;
  else
    delete from public.progress
      where user_id = auth.uid() and guide_id = p_guide_id and step_id = p_step_id;
  end if;
end;
$$;

grant execute on function public.unset_progress(text, text) to authenticated;
