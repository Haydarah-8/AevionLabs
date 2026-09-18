-- Aevion Labs — run once in Dashboard → SQL Editor → New query → Run
-- Project: utxsrxhzdmvyrulnxehq
-- Safe to re-run.


-- ===== 20260910_admin_full_schema.sql =====

-- Aevion Labs admin stack: tracking, allow-list, blog, news, storage policies.
-- Safe to re-run. CMS tables are created in supabase/cms.sql and already exist.

-- â”€â”€ Visitors (admin analytics; service role only) â”€â”€
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

-- â”€â”€ Admin allow-list â”€â”€
create table if not exists public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from public, anon, authenticated;
grant select, insert, update, delete on table public.admin_users to service_role;

insert into public.admin_users (id, email, role)
select id, coalesce(email, ''), 'admin'
from auth.users
on conflict (id) do update
set email = excluded.email,
    role = 'admin',
    updated_at = now();

-- â”€â”€ Blog CMS â”€â”€
create table if not exists public.blog_posts (
  id text primary key,
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  category text not null default 'Insights',
  sub text not null default '',
  date text not null,
  published_at date not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  seo_title text,
  seo_description text,
  author text,
  sections jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_posts add column if not exists content jsonb not null default '[]'::jsonb;
alter table public.blog_posts add column if not exists html text not null default '';
alter table public.blog_posts add column if not exists source_url text;
alter table public.blog_posts add column if not exists news_story_id uuid;
alter table public.blog_posts add column if not exists news_article_id uuid;
alter table public.blog_posts add column if not exists created_from_news_feed boolean not null default false;
alter table public.blog_posts add column if not exists discovered_at timestamptz;

create index if not exists blog_posts_status_published_at_idx
  on public.blog_posts (status, published_at desc);

create unique index if not exists blog_posts_source_url_key
  on public.blog_posts (source_url)
  where source_url is not null and length(trim(source_url)) > 0;

alter table public.blog_posts enable row level security;
revoke all on table public.blog_posts from anon, authenticated, public;
grant select on table public.blog_posts to anon, authenticated;
grant select, insert, update, delete on table public.blog_posts to service_role;

drop policy if exists "public_read_published_posts" on public.blog_posts;
create policy "public_read_published_posts"
  on public.blog_posts
  for select
  to anon, authenticated
  using (status = 'published');

-- â”€â”€ Storage: public read for blog-media (bucket is created from the app) â”€â”€
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-media',
  'blog-media',
  true,
  52428800,
  array[
    'image/jpeg','image/png','image/webp','image/gif','image/svg+xml',
    'video/mp4','video/webm','video/quicktime','video/ogg',
    'audio/mpeg','audio/mp4','audio/wav','audio/webm','audio/ogg',
    'application/pdf'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public_read_blog_media" on storage.objects;
create policy "public_read_blog_media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'blog-media');

drop policy if exists "authenticated_upload_blog_media" on storage.objects;
create policy "authenticated_upload_blog_media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'blog-media'
  and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') in ('admin', 'super_admin')
);

drop policy if exists "authenticated_update_blog_media" on storage.objects;
create policy "authenticated_update_blog_media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'blog-media'
  and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') in ('admin', 'super_admin')
)
with check (
  bucket_id = 'blog-media'
  and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') in ('admin', 'super_admin')
);


-- ===== 20260813_news_aggregation.sql =====

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


-- ===== 20260813_news_providers_rss.sql =====

insert into public.news_providers (id)
values ('rss')
on conflict (id) do nothing;


-- ===== 20260813_news_sources_stories.sql =====

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


-- ===== 20260814_news_feed_dismissals.sql =====

-- Admin-only hide list for Live News / Recent Events. Service role writes; no public policies.

create table if not exists public.news_feed_dismissals (
  source_url text primary key,
  created_at timestamptz not null default now()
);

alter table public.news_feed_dismissals enable row level security;

revoke all on table public.news_feed_dismissals from anon, authenticated, public;
grant select, insert, update, delete on table public.news_feed_dismissals to service_role;


-- ===== 20260814_primary_news_sources.sql =====

-- Primary scraped news sources: Strategical Briefing and Xinhua English.

insert into public.news_sources (
  id, name, domain, country, language, category, rss_url, homepage_url,
  crawl_method, crawl_interval, priority, trust_score, max_requests_per_minute, enabled
) values
  (
    'strategical-briefing',
    'Strategical Briefing',
    'strategical.org.uk',
    'GB',
    'en',
    'Defence',
    null,
    'https://www.strategical.org.uk/strategical-briefing',
    'scrape',
    360,
    120,
    0.92,
    4,
    true
  ),
  (
    'xinhua-english',
    'Xinhua',
    'english.news.cn',
    'CN',
    'en',
    'World',
    null,
    'https://english.news.cn/',
    'scrape',
    180,
    115,
    0.9,
    6,
    true
  )
on conflict (id) do update set
  name = excluded.name,
  domain = excluded.domain,
  country = excluded.country,
  language = excluded.language,
  category = excluded.category,
  rss_url = excluded.rss_url,
  homepage_url = excluded.homepage_url,
  crawl_method = excluded.crawl_method,
  crawl_interval = excluded.crawl_interval,
  priority = excluded.priority,
  trust_score = excluded.trust_score,
  max_requests_per_minute = excluded.max_requests_per_minute,
  enabled = excluded.enabled,
  updated_at = now();

-- Keep Strategical and Xinhua ahead of legacy RSS feeds.
update public.news_sources
set priority = least(priority, 100), updated_at = now()
where id not in ('strategical-briefing', 'xinhua-english')
  and priority > 100;


-- ===== 20260827_expand_news_sources.sql =====

-- Broaden wire coverage: defence, policy, energy, markets and regional desks.
-- Every feed URL below was fetched and confirmed to return >= 5 items.

insert into public.news_sources (
  id, name, domain, country, language, category, rss_url, homepage_url,
  crawl_method, crawl_interval, priority, trust_score, max_requests_per_minute, enabled
) values
  ('un-news', 'UN News', 'news.un.org', null, 'en', 'World', 'https://news.un.org/feed/subscribe/en/news/all/rss.xml', 'https://news.un.org/en/', 'rss', 420, 76, 0.85, 4, true),
  ('euronews', 'Euronews', 'euronews.com', 'FR', 'en', 'World', 'https://www.euronews.com/rss?level=theme&name=news', 'https://www.euronews.com/', 'rss', 360, 64, 0.76, 4, true),
  ('channel-news-asia', 'CNA', 'channelnewsasia.com', 'SG', 'en', 'World', 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml', 'https://www.channelnewsasia.com/', 'rss', 360, 67, 0.78, 4, true),
  ('anadolu', 'Anadolu Agency', 'aa.com.tr', 'TR', 'en', 'World', 'https://www.aa.com.tr/en/rss/default?cat=world', 'https://www.aa.com.tr/en', 'rss', 420, 55, 0.62, 4, true),
  ('jpost', 'Jerusalem Post', 'jpost.com', 'IL', 'en', 'World', 'https://www.jpost.com/rss/rssfeedsheadlines.aspx', 'https://www.jpost.com/', 'rss', 420, 56, 0.66, 4, true),
  ('moscow-times', 'The Moscow Times', 'themoscowtimes.com', 'RU', 'en', 'World', 'https://www.themoscowtimes.com/rss/news', 'https://www.themoscowtimes.com/', 'rss', 480, 50, 0.6, 3, true),
  ('tass', 'TASS', 'tass.com', 'RU', 'en', 'World', 'https://tass.com/rss/v2.xml', 'https://tass.com/', 'rss', 480, 45, 0.4, 3, true),
  ('defense-news', 'Defense News', 'defensenews.com', 'US', 'en', 'Defence', 'https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml', 'https://www.defensenews.com/', 'rss', 420, 72, 0.82, 4, true),
  ('defense-one', 'Defense One', 'defenseone.com', 'US', 'en', 'Defence', 'https://www.defenseone.com/rss/all/', 'https://www.defenseone.com/', 'rss', 420, 71, 0.8, 4, true),
  ('breaking-defense', 'Breaking Defense', 'breakingdefense.com', 'US', 'en', 'Defence', 'https://breakingdefense.com/feed/', 'https://breakingdefense.com/', 'rss', 420, 70, 0.79, 4, true),
  ('war-on-the-rocks', 'War on the Rocks', 'warontherocks.com', 'US', 'en', 'Defence', 'https://warontherocks.com/feed/', 'https://warontherocks.com/', 'rss', 600, 62, 0.78, 3, true),
  ('csis', 'CSIS', 'csis.org', 'US', 'en', 'Defence', 'https://www.csis.org/rss.xml', 'https://www.csis.org/', 'rss', 600, 61, 0.8, 3, true),
  ('politico-eu', 'Politico Europe', 'politico.eu', 'BE', 'en', 'Politics', 'https://www.politico.eu/feed/', 'https://www.politico.eu/', 'rss', 360, 74, 0.8, 4, true),
  ('the-diplomat', 'The Diplomat', 'thediplomat.com', 'US', 'en', 'Politics', 'https://thediplomat.com/feed/', 'https://thediplomat.com/', 'rss', 480, 65, 0.77, 3, true),
  ('scmp-news', 'South China Morning Post', 'scmp.com', 'HK', 'en', 'World', 'https://www.scmp.com/rss/91/feed', 'https://www.scmp.com/', 'rss', 420, 63, 0.72, 4, true),
  ('atlantic-council', 'Atlantic Council', 'atlanticcouncil.org', 'US', 'en', 'Politics', 'https://www.atlanticcouncil.org/feed/', 'https://www.atlanticcouncil.org/', 'rss', 600, 60, 0.76, 3, true),
  ('ecfr', 'ECFR', 'ecfr.eu', 'DE', 'en', 'Politics', 'https://ecfr.eu/feed/', 'https://ecfr.eu/', 'rss', 600, 58, 0.75, 3, true),
  ('lowy-interpreter', 'Lowy Interpreter', 'lowyinstitute.org', 'AU', 'en', 'Politics', 'https://www.lowyinstitute.org/the-interpreter/rss.xml', 'https://www.lowyinstitute.org/the-interpreter', 'rss', 600, 57, 0.75, 3, true),
  ('cnbc-world', 'CNBC', 'cnbc.com', 'US', 'en', 'Business', 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362', 'https://www.cnbc.com/world/', 'rss', 360, 66, 0.74, 4, true),
  ('oilprice', 'OilPrice', 'oilprice.com', 'US', 'en', 'Business', 'https://oilprice.com/rss/main', 'https://oilprice.com/', 'rss', 480, 54, 0.65, 3, true),
  ('eia-today', 'EIA Today in Energy', 'eia.gov', 'US', 'en', 'Business', 'https://www.eia.gov/rss/todayinenergy.xml', 'https://www.eia.gov/todayinenergy/', 'rss', 720, 59, 0.84, 3, true),
  ('bbc-tech', 'BBC Technology', 'bbc.co.uk', 'GB', 'en', 'Technology', 'https://feeds.bbci.co.uk/news/technology/rss.xml', 'https://www.bbc.co.uk/news/technology', 'rss', 360, 69, 0.86, 4, true),
  ('bbc-science', 'BBC Science', 'bbc.co.uk', 'GB', 'en', 'Science', 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', 'https://www.bbc.co.uk/news/science_and_environment', 'rss', 420, 68, 0.86, 4, true)
on conflict (id) do update set
  name = excluded.name,
  domain = excluded.domain,
  country = excluded.country,
  language = excluded.language,
  category = excluded.category,
  rss_url = excluded.rss_url,
  homepage_url = excluded.homepage_url,
  crawl_method = excluded.crawl_method,
  crawl_interval = excluded.crawl_interval,
  priority = excluded.priority,
  trust_score = excluded.trust_score,
  max_requests_per_minute = excluded.max_requests_per_minute,
  enabled = excluded.enabled,
  updated_at = now();


-- ===== 20260828_spectrum_news_sources.sql =====

-- Outlets across the political spectrum, so narrative spread has both sides
-- to measure. Every feed below was fetched and confirmed to return >= 5 items.

insert into public.news_sources (
  id, name, domain, country, language, category, rss_url, homepage_url,
  crawl_method, crawl_interval, priority, trust_score, max_requests_per_minute, enabled
) values
  ('fox-news', 'Fox News', 'foxnews.com', 'US', 'en', 'Politics', 'https://moxie.foxnews.com/google-publisher/latest.xml', 'https://www.foxnews.com/', 'rss', 420, 62, 0.6, 4, true),
  ('ny-post', 'New York Post', 'nypost.com', 'US', 'en', 'World', 'https://nypost.com/feed/', 'https://nypost.com/', 'rss', 420, 52, 0.55, 4, true),
  ('washington-times', 'Washington Times', 'washingtontimes.com', 'US', 'en', 'Politics', 'https://www.washingtontimes.com/rss/headlines/news/', 'https://www.washingtontimes.com/', 'rss', 420, 53, 0.6, 4, true),
  ('daily-mail', 'Daily Mail', 'dailymail.co.uk', 'GB', 'en', 'UK', 'https://www.dailymail.co.uk/news/index.rss', 'https://www.dailymail.co.uk/', 'rss', 420, 48, 0.45, 4, true),
  ('national-review', 'National Review', 'nationalreview.com', 'US', 'en', 'Politics', 'https://www.nationalreview.com/feed/', 'https://www.nationalreview.com/', 'rss', 420, 56, 0.65, 4, true),
  ('washington-examiner', 'Washington Examiner', 'washingtonexaminer.com', 'US', 'en', 'Politics', 'https://www.washingtonexaminer.com/feed', 'https://www.washingtonexaminer.com/', 'rss', 420, 55, 0.62, 4, true),
  ('breitbart', 'Breitbart', 'breitbart.com', 'US', 'en', 'Politics', 'https://feeds.feedburner.com/breitbart', 'https://www.breitbart.com/', 'rss', 420, 42, 0.35, 4, true),
  ('daily-wire', 'The Daily Wire', 'dailywire.com', 'US', 'en', 'Politics', 'https://www.dailywire.com/feeds/rss.xml', 'https://www.dailywire.com/', 'rss', 420, 43, 0.4, 4, true),
  ('gb-news', 'GB News', 'gbnews.com', 'GB', 'en', 'UK', 'https://www.gbnews.com/feeds/news.rss', 'https://www.gbnews.com/', 'rss', 420, 47, 0.45, 4, true),
  ('vox', 'Vox', 'vox.com', 'US', 'en', 'Politics', 'https://www.vox.com/rss/index.xml', 'https://www.vox.com/', 'rss', 420, 54, 0.6, 4, true),
  ('mother-jones', 'Mother Jones', 'motherjones.com', 'US', 'en', 'Politics', 'https://www.motherjones.com/feed/', 'https://www.motherjones.com/', 'rss', 420, 50, 0.55, 4, true),
  ('the-nation', 'The Nation', 'thenation.com', 'US', 'en', 'Politics', 'https://www.thenation.com/feed/?post_type=article', 'https://www.thenation.com/', 'rss', 420, 49, 0.55, 4, true),
  ('salon', 'Salon', 'salon.com', 'US', 'en', 'Politics', 'https://www.salon.com/feed/', 'https://www.salon.com/', 'rss', 420, 44, 0.45, 4, true),
  ('the-intercept', 'The Intercept', 'theintercept.com', 'US', 'en', 'Politics', 'https://theintercept.com/feed/?rss', 'https://theintercept.com/', 'rss', 420, 51, 0.6, 4, true),
  ('jacobin', 'Jacobin', 'jacobin.com', 'US', 'en', 'Politics', 'https://jacobin.com/feed/', 'https://jacobin.com/', 'rss', 420, 43, 0.5, 4, true),
  ('common-dreams', 'Common Dreams', 'commondreams.org', 'US', 'en', 'Politics', 'https://www.commondreams.org/feeds/news.rss', 'https://www.commondreams.org/', 'rss', 420, 42, 0.5, 4, true),
  ('democracy-now', 'Democracy Now', 'democracynow.org', 'US', 'en', 'Politics', 'https://www.democracynow.org/democracynow.rss', 'https://www.democracynow.org/', 'rss', 420, 46, 0.55, 4, true),
  ('the-hill', 'The Hill', 'thehill.com', 'US', 'en', 'Politics', 'https://thehill.com/news/feed/', 'https://thehill.com/', 'rss', 420, 64, 0.72, 4, true),
  ('axios', 'Axios', 'axios.com', 'US', 'en', 'Politics', 'https://api.axios.com/feed/', 'https://www.axios.com/', 'rss', 420, 66, 0.76, 4, true),
  ('newsweek', 'Newsweek', 'newsweek.com', 'US', 'en', 'World', 'https://www.newsweek.com/rss', 'https://www.newsweek.com/', 'rss', 420, 57, 0.62, 4, true),
  ('csmonitor', 'Christian Science Monitor', 'csmonitor.com', 'US', 'en', 'World', 'https://rss.csmonitor.com/feeds/usa', 'https://www.csmonitor.com/', 'rss', 420, 63, 0.78, 4, true),
  ('pbs-newshour', 'PBS NewsHour', 'pbs.org', 'US', 'en', 'World', 'https://www.pbs.org/newshour/feeds/rss/headlines', 'https://www.pbs.org/newshour/', 'rss', 420, 70, 0.82, 4, true),
  ('cbs-news', 'CBS News', 'cbsnews.com', 'US', 'en', 'World', 'https://www.cbsnews.com/latest/rss/world', 'https://www.cbsnews.com/', 'rss', 420, 68, 0.76, 4, true),
  ('nbc-news', 'NBC News', 'nbcnews.com', 'US', 'en', 'World', 'https://feeds.nbcnews.com/nbcnews/public/world', 'https://www.nbcnews.com/', 'rss', 420, 67, 0.75, 4, true)
on conflict (id) do update set
  name = excluded.name,
  domain = excluded.domain,
  country = excluded.country,
  language = excluded.language,
  category = excluded.category,
  rss_url = excluded.rss_url,
  homepage_url = excluded.homepage_url,
  crawl_method = excluded.crawl_method,
  crawl_interval = excluded.crawl_interval,
  priority = excluded.priority,
  trust_score = excluded.trust_score,
  max_requests_per_minute = excluded.max_requests_per_minute,
  enabled = excluded.enabled,
  updated_at = now();


-- ===== 20260828_retire_dead_feeds.sql =====

-- Retire feeds that cannot succeed, and register verified replacements.
--
-- Every row disabled here was probed live and returned 403, 404, or failed to
-- resolve at all, and none of them had ever recorded a single success:
--
--   * rsshub.app twitter/instagram/tiktok routes â€” the public RSSHub instance
--     now blocks these (403/404). Nine rows, six consecutive failures each.
--   * feeds.reuters.com and feeds.apnews.com â€” both publishers discontinued
--     their public RSS. Seven consecutive failures each, never a success.
--   * two rows with a null rss_url, left behind by the reverted Strategical
--     Briefing / Xinhua change.
--
-- Disabled rather than deleted: the article rows already ingested reference
-- these sources, and deleting them would orphan that history.

update public.news_sources
set enabled = false,
    updated_at = now()
where rss_url is null
   or rss_url like '%rsshub.app%'
   or rss_url = 'https://feeds.reuters.com/Reuters/worldNews'
   or rss_url = 'https://feeds.apnews.com/apf-topnews';

-- Verified replacements. Each URL was fetched and confirmed to return a feed
-- with items before being added here. None sit on ADMIN_BLOCKED_HOSTS.
insert into public.news_sources
  (id, name, domain, country, language, category, rss_url, homepage_url,
   crawl_method, crawl_interval, priority, trust_score,
   max_requests_per_minute, enabled)
values
  ('politico-us', 'Politico', 'politico.com', 'US', 'en', 'Politics',
   'https://rss.politico.com/politics-news.xml', 'https://www.politico.com/',
   'rss', 240, 82, 0.84, 5, true),
  ('foreign-policy', 'Foreign Policy', 'foreignpolicy.com', 'US', 'en',
   'Analysis', 'https://foreignpolicy.com/feed/', 'https://foreignpolicy.com/',
   'rss', 480, 78, 0.85, 3, true),
  ('al-monitor', 'Al-Monitor', 'al-monitor.com', 'US', 'en', 'Middle East',
   'https://www.al-monitor.com/rss', 'https://www.al-monitor.com/',
   'rss', 360, 74, 0.82, 3, true),
  ('abc-au', 'ABC News (Australia)', 'abc.net.au', 'AU', 'en', 'World',
   'https://www.abc.net.au/news/feed/51120/rss.xml',
   'https://www.abc.net.au/news', 'rss', 300, 76, 0.88, 4, true),
  ('japan-times', 'The Japan Times', 'japantimes.co.jp', 'JP', 'en', 'Asia',
   'https://www.japantimes.co.jp/feed/', 'https://www.japantimes.co.jp/',
   'rss', 360, 72, 0.84, 3, true),
  ('times-of-india-world', 'The Times of India',
   'timesofindia.indiatimes.com', 'IN', 'en', 'World',
   'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms',
   'https://timesofindia.indiatimes.com/world', 'rss', 300, 70, 0.76, 4, true)
on conflict (id) do update set
  rss_url = excluded.rss_url,
  homepage_url = excluded.homepage_url,
  enabled = true,
  failure_count = 0,
  updated_at = now();

-- Clear the failure counters on feeds that are still enabled, so the health
-- view reflects what happens from now on rather than the dead URLs' history.
update public.news_sources
set failure_count = 0,
    updated_at = now()
where enabled = true;

-- Tighten crawl intervals so the desk stays fresh.
--
-- Intervals of 180-480 minutes meant a feed was revisited every three to eight
-- hours, so a newsroom refreshed every half hour was mostly re-reading the same
-- corpus. Banded by priority: the wires that carry breaking copy are checked
-- every half hour, the rest less often. Combined with FEEDS_PER_RUN this keeps
-- any single run inside the cron's 60-second budget.
update public.news_sources
set crawl_interval = case
      when priority >= 85 then 30
      when priority >= 75 then 60
      else 120
    end,
    updated_at = now()
where enabled = true;


notify pgrst, 'reload schema';

-- ===== 20260918_website_factory.sql =====
-- Website Factory tables. Safe to re-run.

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  tagline text not null default '',
  description text not null default '',
  industry text not null default '',
  logo_url text not null default '',
  favicon_url text not null default '',
  hero_url text not null default '',
  phone text not null default '',
  email text not null default '',
  website text not null default '',
  address text not null default '',
  postcode text not null default '',
  opening_hours jsonb not null default '{}'::jsonb,
  social jsonb not null default '{}'::jsonb,
  years_in_business integer,
  certifications jsonb not null default '[]'::jsonb,
  awards jsonb not null default '[]'::jsonb,
  primary_cta jsonb not null default '{}'::jsonb,
  secondary_cta jsonb not null default '{}'::jsonb,
  usps jsonb not null default '[]'::jsonb,
  trust_indicators jsonb not null default '[]'::jsonb,
  prospect_label text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  description text not null default '',
  image_url text not null default '',
  sort_order integer not null default 0
);

create table if not exists public.business_team (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  role text not null default '',
  photo_url text not null default '',
  bio text not null default '',
  sort_order integer not null default 0
);

create table if not exists public.business_reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  customer_name text not null,
  quote text not null default '',
  rating integer not null default 5,
  source text not null default '',
  sort_order integer not null default 0
);

create table if not exists public.business_media (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  kind text not null default 'gallery',
  url text not null,
  alt text not null default '',
  sort_order integer not null default 0
);

create table if not exists public.website_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  industry text not null default '',
  description text not null default '',
  thumbnail_url text not null default '',
  version integer not null default 1,
  definition_key text not null,
  pages_count integer not null default 0,
  configuration jsonb not null default '{}'::jsonb,
  duplicated_from uuid references public.website_templates (id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.website_projects (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete restrict,
  template_id uuid not null references public.website_templates (id) on delete restrict,
  name text not null,
  slug text not null unique,
  status text not null default 'draft',
  theme jsonb not null default '{}'::jsonb,
  site_config jsonb not null default '{}'::jsonb,
  seo_config jsonb not null default '{}'::jsonb,
  subdomain text,
  custom_domain text,
  deployment_status text not null default 'idle',
  deployment_provider text not null default 'aevion',
  deployment_url text not null default '',
  published_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.website_pages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.website_projects (id) on delete cascade,
  slug text not null,
  title text not null,
  nav_label text not null default '',
  show_in_nav boolean not null default true,
  nav_order integer not null default 0,
  draft_data jsonb not null default '{"root":{"props":{}},"content":[]}'::jsonb,
  preview_data jsonb,
  published_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, slug)
);

create table if not exists public.website_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.website_projects (id) on delete cascade,
  version_number integer not null,
  author_id uuid,
  snapshot jsonb not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  unique (project_id, version_number)
);

create table if not exists public.website_deployments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.website_projects (id) on delete cascade,
  version_id uuid references public.website_versions (id) on delete set null,
  provider text not null,
  status text not null,
  url text not null default '',
  error text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.website_domains (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.website_projects (id) on delete cascade,
  hostname text not null,
  kind text not null default 'custom',
  dns_records jsonb not null default '[]'::jsonb,
  status text not null default 'pending',
  ssl_status text not null default 'pending',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (hostname)
);

create index if not exists businesses_industry_idx on public.businesses (industry);
create index if not exists business_services_business_idx on public.business_services (business_id, sort_order);
create index if not exists business_team_business_idx on public.business_team (business_id, sort_order);
create index if not exists business_reviews_business_idx on public.business_reviews (business_id, sort_order);
create index if not exists business_media_business_idx on public.business_media (business_id, kind, sort_order);
create index if not exists website_projects_status_idx on public.website_projects (status);
create index if not exists website_projects_business_idx on public.website_projects (business_id);
create index if not exists website_pages_project_idx on public.website_pages (project_id, nav_order);
create index if not exists website_versions_project_idx on public.website_versions (project_id, version_number desc);
create index if not exists website_deployments_project_idx on public.website_deployments (project_id, created_at desc);
create index if not exists website_domains_project_idx on public.website_domains (project_id);

alter table public.businesses enable row level security;
alter table public.business_services enable row level security;
alter table public.business_team enable row level security;
alter table public.business_reviews enable row level security;
alter table public.business_media enable row level security;
alter table public.website_templates enable row level security;
alter table public.website_projects enable row level security;
alter table public.website_pages enable row level security;
alter table public.website_versions enable row level security;
alter table public.website_deployments enable row level security;
alter table public.website_domains enable row level security;

revoke all on table public.businesses from public, anon, authenticated;
revoke all on table public.business_services from public, anon, authenticated;
revoke all on table public.business_team from public, anon, authenticated;
revoke all on table public.business_reviews from public, anon, authenticated;
revoke all on table public.business_media from public, anon, authenticated;
revoke all on table public.website_templates from public, anon, authenticated;
revoke all on table public.website_projects from public, anon, authenticated;
revoke all on table public.website_pages from public, anon, authenticated;
revoke all on table public.website_versions from public, anon, authenticated;
revoke all on table public.website_deployments from public, anon, authenticated;
revoke all on table public.website_domains from public, anon, authenticated;

grant all on table public.businesses to service_role;
grant all on table public.business_services to service_role;
grant all on table public.business_team to service_role;
grant all on table public.business_reviews to service_role;
grant all on table public.business_media to service_role;
grant all on table public.website_templates to service_role;
grant all on table public.website_projects to service_role;
grant all on table public.website_pages to service_role;
grant all on table public.website_versions to service_role;
grant all on table public.website_deployments to service_role;
grant all on table public.website_domains to service_role;

insert into public.website_templates (
  slug, name, industry, description, definition_key, pages_count, active
)
values
  (
    'roofing-premium',
    'Roofing Premium',
    'Roofing',
    'Multi-page site for roofing and exterior trades. Home, about, services, projects, and contact.',
    'roofing',
    5,
    true
  ),
  (
    'professional-services',
    'Professional Services',
    'Professional',
    'Calm, type-led layout for accountants, consultants, and practices.',
    'professional',
    5,
    true
  ),
  (
    'restaurant',
    'Restaurant',
    'Hospitality',
    'Menu, atmosphere, and booking-led site for restaurants and cafes.',
    'restaurant',
    5,
    true
  )
on conflict (slug) do update
set
  name = excluded.name,
  industry = excluded.industry,
  description = excluded.description,
  definition_key = excluded.definition_key,
  pages_count = excluded.pages_count,
  updated_at = now();

notify pgrst, 'reload schema';

