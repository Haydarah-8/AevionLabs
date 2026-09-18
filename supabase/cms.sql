-- Agency CMS: pages, sections, projects, site settings.
-- Public reads published content only. Writes go through the service role.

create table if not exists public.cms_pages (
  id text primary key,
  slug text not null unique,
  title text not null,
  nav_label text not null default '',
  show_in_nav boolean not null default false,
  nav_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  is_system boolean not null default false,
  path text not null,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cms_pages_nav_idx
  on public.cms_pages (nav_order)
  where show_in_nav and status = 'published';

create table if not exists public.cms_sections (
  id text primary key,
  page_id text not null references public.cms_pages(id) on delete cascade,
  type text not null,
  sort_order integer not null default 0,
  visible boolean not null default true,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cms_sections_page_idx
  on public.cms_sections (page_id, sort_order);

create table if not exists public.cms_projects (
  id text primary key,
  slug text not null unique,
  client text not null,
  overview text not null default '',
  services text[] not null default '{}',
  year text not null default '',
  hero_src text not null default '',
  hero_alt text not null default '',
  rows jsonb not null default '[]'::jsonb,
  result_cpt text not null default '',
  result_text text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cms_projects_status_idx
  on public.cms_projects (status, sort_order);

create table if not exists public.cms_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.cms_pages enable row level security;
alter table public.cms_sections enable row level security;
alter table public.cms_projects enable row level security;
alter table public.cms_settings enable row level security;

revoke all on table public.cms_pages from anon, authenticated, public;
revoke all on table public.cms_sections from anon, authenticated, public;
revoke all on table public.cms_projects from anon, authenticated, public;
revoke all on table public.cms_settings from anon, authenticated, public;

grant select on table public.cms_pages to anon, authenticated;
grant select on table public.cms_sections to anon, authenticated;
grant select on table public.cms_projects to anon, authenticated;
grant select on table public.cms_settings to anon, authenticated;

grant select, insert, update, delete on table public.cms_pages to service_role;
grant select, insert, update, delete on table public.cms_sections to service_role;
grant select, insert, update, delete on table public.cms_projects to service_role;
grant select, insert, update, delete on table public.cms_settings to service_role;

drop policy if exists "public_read_published_pages" on public.cms_pages;
create policy "public_read_published_pages"
  on public.cms_pages
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "public_read_visible_sections" on public.cms_sections;
create policy "public_read_visible_sections"
  on public.cms_sections
  for select
  to anon, authenticated
  using (
    visible = true
    and exists (
      select 1
      from public.cms_pages p
      where p.id = cms_sections.page_id
        and p.status = 'published'
    )
  );

drop policy if exists "public_read_published_projects" on public.cms_projects;
create policy "public_read_published_projects"
  on public.cms_projects
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "public_read_settings" on public.cms_settings;
create policy "public_read_settings"
  on public.cms_settings
  for select
  to anon, authenticated
  using (true);
