-- Scraped content CMS: durable imports with full IntelligenceResult payload.

create table if not exists public.factory_scrape_imports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.website_projects (id) on delete set null,
  job_id text,
  source_url text not null default '',
  status text not null default 'imported',
  title text not null default '',
  summary text not null default '',
  page_count integer not null default 0,
  asset_count integer not null default 0,
  service_count integer not null default 0,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  applied_at timestamptz
);

create index if not exists factory_scrape_imports_project_idx
  on public.factory_scrape_imports (project_id, created_at desc);
create index if not exists factory_scrape_imports_status_idx
  on public.factory_scrape_imports (status);

alter table public.factory_scrape_imports enable row level security;
revoke all on table public.factory_scrape_imports from public, anon, authenticated;
grant all on table public.factory_scrape_imports to service_role;
