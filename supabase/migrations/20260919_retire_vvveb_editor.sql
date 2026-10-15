-- Retire Vvveb as an active editor engine.
-- Legacy HTML page payloads (engine: "vvveb") may still exist in website_pages jsonb;
-- public render continues to support them via isLegacyHtmlDocument.

update public.website_projects
set editor_engine = 'puck'
where editor_engine = 'vvveb';

alter table public.website_projects
  drop constraint if exists website_projects_editor_engine_check;

alter table public.website_projects
  add constraint website_projects_editor_engine_check
  check (editor_engine in ('puck', 'grapesjs'));
