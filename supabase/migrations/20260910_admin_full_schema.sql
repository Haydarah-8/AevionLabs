-- Aevion Labs admin stack: tracking, allow-list, blog, news, storage policies.
-- Safe to re-run. CMS tables are created in supabase/cms.sql and already exist.

-- ── Visitors (admin analytics; service role only) ──
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

-- ── Admin allow-list ──
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

-- ── Blog CMS ──
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

-- ── Storage: public read for blog-media (bucket is created from the app) ──
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
