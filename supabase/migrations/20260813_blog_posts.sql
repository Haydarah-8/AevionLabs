-- Blog CMS for News & Insights.
-- Service-role (server) access bypasses RLS. Anon can read published rows only.

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
