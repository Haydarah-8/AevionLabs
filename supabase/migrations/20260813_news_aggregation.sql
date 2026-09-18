-- Live news aggregation. Service-role writes bypass RLS.
-- Anon/authenticated may read visible articles only (for /live + Realtime).

create table if not exists public.news_providers (
  id text primary key,
  enabled boolean not null default true,
  last_ok_at timestamptz,
  last_error text,
  unhealthy_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.news_providers (id)
values ('rss'), ('gdelt'), ('newsdata'), ('currents'), ('gnews'), ('guardian')
on conflict (id) do nothing;

create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  external_id text not null,
  provider text not null references public.news_providers (id),
  source_name text not null default '',
  source_domain text not null default '',
  source_url text not null,
  canonical_url text,
  title text not null,
  description text not null default '',
  content text not null default '',
  author text,
  image_url text,
  video_url text,
  video_type text,
  video_thumbnail text,
  published_at timestamptz not null,
  first_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  category text not null default 'World',
  subcategory text,
  country text,
  language text not null default 'en',
  tags text[] not null default '{}',
  keywords text[] not null default '{}',
  is_breaking boolean not null default false,
  is_featured boolean not null default false,
  relevance_score real not null default 0,
  freshness_score real not null default 0,
  engagement_score real not null default 0,
  duplicate_group_id uuid not null,
  status text not null default 'visible' check (status in ('visible', 'hidden')),
  short_summary text,
  key_points jsonb,
  ai_topic text,
  sentiment text,
  entities jsonb,
  ai_tags text[],
  unique (provider, external_id)
);

create unique index if not exists news_articles_canonical_url_key
  on public.news_articles (canonical_url)
  where canonical_url is not null and length(canonical_url) > 0;

create index if not exists news_articles_published_at_idx
  on public.news_articles (published_at desc);
create index if not exists news_articles_category_idx
  on public.news_articles (category);
create index if not exists news_articles_country_idx
  on public.news_articles (country);
create index if not exists news_articles_language_idx
  on public.news_articles (language);
create index if not exists news_articles_provider_idx
  on public.news_articles (provider);
create index if not exists news_articles_is_breaking_idx
  on public.news_articles (is_breaking);
create index if not exists news_articles_is_featured_idx
  on public.news_articles (is_featured);
create index if not exists news_articles_status_idx
  on public.news_articles (status);
create index if not exists news_articles_duplicate_group_id_idx
  on public.news_articles (duplicate_group_id);
create index if not exists news_articles_status_published_idx
  on public.news_articles (status, published_at desc);

create table if not exists public.news_ingestion_logs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  response_time_ms integer,
  status text not null,
  articles_received integer not null default 0,
  articles_accepted integer not null default 0,
  duplicates_rejected integer not null default 0,
  error text
);

create index if not exists news_ingestion_logs_provider_started_idx
  on public.news_ingestion_logs (provider, started_at desc);

alter table public.news_articles enable row level security;
alter table public.news_providers enable row level security;
alter table public.news_ingestion_logs enable row level security;

revoke all on table public.news_articles from anon, authenticated, public;
revoke all on table public.news_providers from anon, authenticated, public;
revoke all on table public.news_ingestion_logs from anon, authenticated, public;

grant select on table public.news_articles to anon, authenticated;
grant select, insert, update, delete on table public.news_articles to service_role;
grant select, insert, update, delete on table public.news_providers to service_role;
grant select, insert, update, delete on table public.news_ingestion_logs to service_role;

drop policy if exists "public_read_visible_news" on public.news_articles;
create policy "public_read_visible_news"
  on public.news_articles
  for select
  to anon, authenticated
  using (status = 'visible');

do $$
begin
  alter publication supabase_realtime add table public.news_articles;
exception
  when duplicate_object then null;
end
$$;
