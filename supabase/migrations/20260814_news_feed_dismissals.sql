-- Admin-only hide list for Live News / Recent Events. Service role writes; no public policies.

create table if not exists public.news_feed_dismissals (
  source_url text primary key,
  created_at timestamptz not null default now()
);

alter table public.news_feed_dismissals enable row level security;

revoke all on table public.news_feed_dismissals from anon, authenticated, public;
grant select, insert, update, delete on table public.news_feed_dismissals to service_role;
