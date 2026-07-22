-- ─────────────────────────────────────────────────────────────────────────────
-- Vague 2 — Freemium : abonnement premium (Stripe).
-- La BDD ne stocke QUE l'état d'accès (jamais le contenu ni les prix : ceux-ci
-- vivent dans Stripe). guide.access ('free'|'premium') reste piloté par guides.json.
-- À exécuter dans Supabase (SQL Editor) ou via `supabase db push`.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── subscriptions : 1-1 avec auth.users ──────────────────────────────────────
-- Une ligne par utilisateur ayant amorcé un paiement. Écrite UNIQUEMENT par le
-- webhook Stripe (clé service_role, contourne la RLS). L'utilisateur la lit seul.
create table if not exists public.subscriptions (
  user_id                uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  status                 text,                 -- statut Stripe : active, trialing, past_due, canceled, …
  price_id               text,                 -- id du prix Stripe en cours
  current_period_end     timestamptz,          -- fin de période payée (NULL = accès à vie / paiement unique)
  cancel_at_period_end   boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

comment on table public.subscriptions is 'État d''abonnement premium par utilisateur. Écrite par le webhook Stripe (service_role). Le prix vit dans Stripe.';

-- updated_at auto (réutilise le trigger défini en 0001).
drop trigger if exists subscriptions_touch_updated_at on public.subscriptions;
create trigger subscriptions_touch_updated_at
  before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- ── Row Level Security ───────────────────────────────────────────────────────
-- Lecture : chacun voit SA ligne. Aucune policy d'écriture pour authenticated →
-- seuls les writes service_role (webhook) passent. On ne fait jamais confiance
-- au client pour accorder un accès.
alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_self_select" on public.subscriptions;
create policy "subscriptions_self_select" on public.subscriptions
  for select using (auth.uid() = user_id);

-- ── Helper : l'utilisateur courant a-t-il un accès premium actif ? ────────────
-- security invoker → s'exécute sous la RLS de l'appelant (ne lit que sa ligne).
-- Utilisable côté app ET dans de futures policies RLS sur du contenu premium.
create or replace function public.has_premium_access()
returns boolean language sql stable security invoker set search_path = public as $$
  select exists (
    select 1 from public.subscriptions s
    where s.user_id = auth.uid()
      and s.status in ('active', 'trialing')
      and (s.current_period_end is null or s.current_period_end > now())
  );
$$;

grant execute on function public.has_premium_access() to authenticated;
