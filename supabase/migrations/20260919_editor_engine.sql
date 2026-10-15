-- Dual editor engines: keep Puck as default; allow VvvebJs projects.
-- Additive only — does not rewrite existing draft_data.

alter table public.website_projects
  add column if not exists editor_engine text not null default 'puck';

comment on column public.website_projects.editor_engine is
  'Visual editor engine: puck (production) | vvveb (prototype/migration)';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'website_projects_editor_engine_check'
  ) then
    alter table public.website_projects
      add constraint website_projects_editor_engine_check
      check (editor_engine in ('puck', 'vvveb'));
  end if;
end $$;

create index if not exists website_projects_editor_engine_idx
  on public.website_projects (editor_engine);
