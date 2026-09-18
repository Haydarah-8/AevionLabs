-- Track original reporting URLs so news intake does not clone drafts.

alter table public.blog_posts
  add column if not exists source_url text;

create unique index if not exists blog_posts_source_url_key
  on public.blog_posts (source_url)
  where source_url is not null and length(trim(source_url)) > 0;
