-- Dashboard-created Auth users are registry admins.
-- Public sign-up should stay disabled in Authentication settings.

update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb;

insert into public.admin_users (id, email, role)
select id, coalesce(email, ''), 'admin'
from auth.users
on conflict (id) do update
set email = excluded.email,
    role = 'admin',
    updated_at = now();

create or replace function public.handle_new_admin_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update auth.users
  set raw_app_meta_data =
    coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
  where id = new.id;

  insert into public.admin_users (id, email, role)
  values (new.id, coalesce(new.email, ''), 'admin')
  on conflict (id) do update
  set email = excluded.email,
      role = 'admin',
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_admin on auth.users;
create trigger on_auth_user_created_admin
after insert on auth.users
for each row
execute function public.handle_new_admin_user();

revoke all on function public.handle_new_admin_user() from public;
revoke all on function public.handle_new_admin_user() from anon, authenticated;
