-- Source registry, story clusters, and crawl job logs for admin news intelligence.
-- Public /live keeps reading news_articles; new columns are nullable.

create table if not exists public.news_sources (
  id text primary key,
  name text not null,
  domain text not null,
  country text,
  language text not null default 'en',
  category text not null default 'World',
  rss_url text,
  homepage_url text,
  enabled boolean not null default true,
  crawl_method text not null default 'rss',
  crawl_interval integer not null default 300,
  last_crawled_at timestamptz,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  failure_count integer not null default 0,
  priority integer not null default 50,
  trust_score real not null default 0.7,
  max_requests_per_minute integer not null default 6,
  concurrency integer not null default 1,
  timeout_ms integer not null default 12000,
  retry_count integer not null default 2,
  requires_browser boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.news_sources (
  id, name, domain, country, language, category, rss_url, homepage_url,
  crawl_method, crawl_interval, priority, trust_score, max_requests_per_minute
) values
  ('bbc-world', 'BBC News', 'bbc.co.uk', 'GB', 'en', 'World',
   'https://feeds.bbci.co.uk/news/world/rss.xml', 'https://www.bbc.co.uk/news/world',
   'rss', 180, 100, 0.95, 8),
  ('bbc-business', 'BBC News', 'bbc.co.uk', 'GB', 'en', 'Business',
   'https://feeds.bbci.co.uk/news/business/rss.xml', 'https://www.bbc.co.uk/news/business',
   'rss', 300, 90, 0.95, 8),
  ('reuters-world', 'Reuters', 'reuters.com', 'US', 'en', 'World',
   'https://feeds.reuters.com/Reuters/worldNews', 'https://www.reuters.com/world/',
   'rss', 180, 95, 0.95, 6),
  ('ap-top', 'Associated Press', 'apnews.com', 'US', 'en', 'World',
   'https://feeds.apnews.com/apf-topnews', 'https://apnews.com/',
   'rss', 240, 92, 0.95, 4),
  ('aljazeera', 'Al Jazeera', 'aljazeera.com', 'QA', 'en', 'World',
   'https://www.aljazeera.com/xml/rss/all.xml', 'https://www.aljazeera.com/',
   'rss', 300, 80, 0.85, 6),
  ('sky-world', 'Sky News', 'news.sky.com', 'GB', 'en', 'World',
   'https://feeds.skynews.com/feeds/rss/world.xml', 'https://news.sky.com/world',
   'rss', 240, 78, 0.8, 6),
  ('cnn-world', 'CNN', 'cnn.com', 'US', 'en', 'World',
   'http://rss.cnn.com/rss/edition_world.rss', 'https://www.cnn.com/world',
   'rss', 300, 70, 0.75, 4),
  ('npr', 'NPR', 'npr.org', 'US', 'en', 'World',
   'https://feeds.npr.org/1001/rss.xml', 'https://www.npr.org/',
   'rss', 360, 72, 0.85, 6),
  ('abc-international', 'ABC News', 'abcnews.go.com', 'US', 'en', 'World',
   'https://abcnews.go.com/abcnews/internationalheadlines', 'https://abcnews.go.com/',
   'rss', 360, 65, 0.7, 4),
  ('google-geopolitics', 'Google News', 'news.google.com', 'GB', 'en', 'World',
   'https://news.google.com/rss/search?q=geopolitics%20OR%20%22Middle%20East%22%20OR%20Ukraine%20OR%20%22China%20diplomacy%22&hl=en-GB&gl=GB&ceid=GB:en',
   'https://news.google.com/',
   'rss', 300, 60, 0.55, 8)
on conflict (id) do nothing;

create table if not exists public.news_stories (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  summary text not null default '',
  category text not null default 'World',
  entities jsonb,
  first_seen_at timestamptz not null default now(),
  last_updated_at timestamptz not null default now(),
  source_count integer not null default 1,
  importance_score real not null default 0,
  breaking_score real not null default 0,
  status text not null default 'visible' check (status in ('visible', 'hidden')),
  duplicate_group_id uuid
);

create index if not exists news_stories_updated_idx
  on public.news_stories (last_updated_at desc);
create index if not exists news_stories_breaking_idx
  on public.news_stories (breaking_score desc);
create index if not exists news_stories_status_idx
  on public.news_stories (status);
create index if not exists news_stories_category_idx
  on public.news_stories (category);

alter table public.news_articles
  add column if not exists source_id text references public.news_sources (id);
alter table public.news_articles
  add column if not exists story_id uuid references public.news_stories (id);
alter table public.news_articles
  add column if not exists excerpt text;
alter table public.news_articles
  add column if not exists discovered_at timestamptz default now();

create index if not exists news_articles_source_id_idx
  on public.news_articles (source_id);
create index if not exists news_articles_story_id_idx
  on public.news_articles (story_id);
create index if not exists news_articles_discovered_at_idx
  on public.news_articles (discovered_at desc);

create table if not exists public.news_crawl_jobs (
  id uuid primary key default gen_random_uuid(),
  job text not null,
  source_id text,
  status text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  error text,
  items integer not null default 0,
  http_status integer,
  duration_ms integer
);

create index if not exists news_crawl_jobs_started_idx
  on public.news_crawl_jobs (started_at desc);
create index if not exists news_crawl_jobs_status_idx
  on public.news_crawl_jobs (status);

alter table public.news_sources enable row level security;
alter table public.news_stories enable row level security;
alter table public.news_crawl_jobs enable row level security;

revoke all on table public.news_sources from anon, authenticated, public;
revoke all on table public.news_stories from anon, authenticated, public;
revoke all on table public.news_crawl_jobs from anon, authenticated, public;

grant select, insert, update, delete on table public.news_sources to service_role;
grant select, insert, update, delete on table public.news_stories to service_role;
grant select, insert, update, delete on table public.news_crawl_jobs to service_role;

update public.news_providers
set enabled = false, updated_at = now()
where id = 'guardian';
