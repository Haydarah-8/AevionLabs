-- Canonical one-shot schema for a new project: supabase/bootstrap.sql
-- (visitors, admin_users, blog, news, storage policies, feed seeds).
-- CMS tables: supabase/cms.sql (already applied on the live project).
-- Run bootstrap.sql in: Dashboard → SQL Editor → New query → Run
-- Safe to re-run (IF NOT EXISTS / drop policy if exists).

-- ─────────────────────────────────────────────
-- 1) Visitor analytics (admin traffic dashboard)
-- Server-only via SUPABASE_SERVICE_ROLE_KEY.
-- ─────────────────────────────────────────────

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

-- ─────────────────────────────────────────────
-- 2) Blog CMS (News & Insights)
-- Admin writes via service_role. Public may read published rows only.
-- ─────────────────────────────────────────────

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

create index if not exists blog_posts_status_published_at_idx
  on public.blog_posts (status, published_at desc);

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

-- ─────────────────────────────────────────────
-- 3) Blog media (public read, admin upload via service_role)
-- ─────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-media',
  'blog-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
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

-- Agency CMS (pages, sections, projects, settings): see supabase/cms.sql

