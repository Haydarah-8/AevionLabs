-- Visitor tracking store for the site's analytics feature.
-- Only ever accessed server-side via the service_role key (see src/lib/tracker-store.ts),
-- so RLS is enabled with zero policies: anon/authenticated get no access, service_role bypasses RLS.

create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  "timestamp" timestamptz not null default now(),
  type text not null check (type in ('new', 'returning')),
  session_number integer not null default 1,
  ip text,
  page jsonb not null default '{}'::jsonb,
  browser jsonb not null default '{}'::jsonb,
  device jsonb not null default '{}'::jsonb,
  network jsonb not null default '{}'::jsonb,
  location jsonb not null default '{}'::jsonb,
  performance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists visitors_timestamp_idx on public.visitors ("timestamp" desc);
create index if not exists visitors_visitor_id_idx on public.visitors (visitor_id);

alter table public.visitors enable row level security;

revoke all on table public.visitors from anon, authenticated, public;
grant select, insert, update, delete on table public.visitors to service_role;
