-- Platform spine: audit logs, API keys, webhooks, webhook deliveries.

create table if not exists public.factory_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_type text not null default 'admin',
  action text not null,
  resource_type text not null default '',
  resource_id text not null default '',
  project_id uuid references public.website_projects (id) on delete set null,
  result text not null default 'ok',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists factory_audit_logs_created_idx
  on public.factory_audit_logs (created_at desc);
create index if not exists factory_audit_logs_project_idx
  on public.factory_audit_logs (project_id);
create index if not exists factory_audit_logs_action_idx
  on public.factory_audit_logs (action);

create table if not exists public.factory_api_keys (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  key_prefix text not null,
  key_hash text not null unique,
  scopes text[] not null default '{}',
  created_by uuid,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists factory_api_keys_prefix_idx
  on public.factory_api_keys (key_prefix);

create table if not exists public.factory_webhooks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  secret_hash text not null,
  secret_prefix text not null default '',
  events text[] not null default '{}',
  active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.factory_webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  webhook_id uuid not null references public.factory_webhooks (id) on delete cascade,
  event text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  attempt integer not null default 0,
  response_status integer,
  error text not null default '',
  created_at timestamptz not null default now(),
  delivered_at timestamptz
);

create index if not exists factory_webhook_deliveries_webhook_idx
  on public.factory_webhook_deliveries (webhook_id, created_at desc);

create table if not exists public.factory_integrations (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  status text not null default 'not_connected',
  account_label text not null default '',
  meta jsonb not null default '{}'::jsonb,
  encrypted_credentials text not null default '',
  connected_by uuid,
  connected_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (provider)
);
