insert into public.news_providers (id)
values ('rss')
on conflict (id) do nothing;
