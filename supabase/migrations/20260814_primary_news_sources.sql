-- Primary scraped news sources: Strategical Briefing and Xinhua English.

insert into public.news_sources (
  id, name, domain, country, language, category, rss_url, homepage_url,
  crawl_method, crawl_interval, priority, trust_score, max_requests_per_minute, enabled
) values
  (
    'strategical-briefing',
    'Strategical Briefing',
    'strategical.org.uk',
    'GB',
    'en',
    'Defence',
    null,
    'https://www.strategical.org.uk/strategical-briefing',
    'scrape',
    360,
    120,
    0.92,
    4,
    true
  ),
  (
    'xinhua-english',
    'Xinhua',
    'english.news.cn',
    'CN',
    'en',
    'World',
    null,
    'https://english.news.cn/',
    'scrape',
    180,
    115,
    0.9,
    6,
    true
  )
on conflict (id) do update set
  name = excluded.name,
  domain = excluded.domain,
  country = excluded.country,
  language = excluded.language,
  category = excluded.category,
  rss_url = excluded.rss_url,
  homepage_url = excluded.homepage_url,
  crawl_method = excluded.crawl_method,
  crawl_interval = excluded.crawl_interval,
  priority = excluded.priority,
  trust_score = excluded.trust_score,
  max_requests_per_minute = excluded.max_requests_per_minute,
  enabled = excluded.enabled,
  updated_at = now();

-- Keep Strategical and Xinhua ahead of legacy RSS feeds.
update public.news_sources
set priority = least(priority, 100), updated_at = now()
where id not in ('strategical-briefing', 'xinhua-english')
  and priority > 100;
