alter table public.blog_posts
  add column if not exists content jsonb not null default '[]'::jsonb;

alter table public.blog_posts
  add column if not exists html text not null default '';
