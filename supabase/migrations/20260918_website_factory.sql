-- Website Factory: businesses, templates, projects, pages, versions, deploys.
-- Service role only (admin APIs). Public preview/live is served by Next.js.

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

