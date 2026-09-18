-- Allow-list for the admin app. Service role only; no public policies.
create table if not exists public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

revoke all on table public.admin_users from public, anon, authenticated;
grant all on table public.admin_users to service_role;

insert into public.admin_users (id, email, role)
select id, coalesce(email, ''), 'admin'
from auth.users
on conflict (id) do update
set email = excluded.email,
    role = 'admin',
    updated_at = now();
