-- Retire feeds that cannot succeed, and register verified replacements.
--
-- Every row disabled here was probed live and returned 403, 404, or failed to
-- resolve at all, and none of them had ever recorded a single success:
--
--   * rsshub.app twitter/instagram/tiktok routes — the public RSSHub instance
--     now blocks these (403/404). Nine rows, six consecutive failures each.
--   * feeds.reuters.com and feeds.apnews.com — both publishers discontinued
--     their public RSS. Seven consecutive failures each, never a success.
--   * two rows with a null rss_url, left behind by the reverted Strategical
--     Briefing / Xinhua change.
--
-- Disabled rather than deleted: the article rows already ingested reference
-- these sources, and deleting them would orphan that history.

update public.news_sources
set enabled = false,
    updated_at = now()
where rss_url is null
   or rss_url like '%rsshub.app%'
   or rss_url = 'https://feeds.reuters.com/Reuters/worldNews'
   or rss_url = 'https://feeds.apnews.com/apf-topnews';

-- Verified replacements. Each URL was fetched and confirmed to return a feed
-- with items before being added here. None sit on ADMIN_BLOCKED_HOSTS.
insert into public.news_sources
  (id, name, domain, country, language, category, rss_url, homepage_url,
   crawl_method, crawl_interval, priority, trust_score,
   max_requests_per_minute, enabled)
values
  ('politico-us', 'Politico', 'politico.com', 'US', 'en', 'Politics',
   'https://rss.politico.com/politics-news.xml', 'https://www.politico.com/',
   'rss', 240, 82, 0.84, 5, true),
  ('foreign-policy', 'Foreign Policy', 'foreignpolicy.com', 'US', 'en',
   'Analysis', 'https://foreignpolicy.com/feed/', 'https://foreignpolicy.com/',
   'rss', 480, 78, 0.85, 3, true),
  ('al-monitor', 'Al-Monitor', 'al-monitor.com', 'US', 'en', 'Middle East',
   'https://www.al-monitor.com/rss', 'https://www.al-monitor.com/',
   'rss', 360, 74, 0.82, 3, true),
  ('abc-au', 'ABC News (Australia)', 'abc.net.au', 'AU', 'en', 'World',
   'https://www.abc.net.au/news/feed/51120/rss.xml',
   'https://www.abc.net.au/news', 'rss', 300, 76, 0.88, 4, true),
  ('japan-times', 'The Japan Times', 'japantimes.co.jp', 'JP', 'en', 'Asia',
   'https://www.japantimes.co.jp/feed/', 'https://www.japantimes.co.jp/',
   'rss', 360, 72, 0.84, 3, true),
  ('times-of-india-world', 'The Times of India',
   'timesofindia.indiatimes.com', 'IN', 'en', 'World',
   'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms',
   'https://timesofindia.indiatimes.com/world', 'rss', 300, 70, 0.76, 4, true)
on conflict (id) do update set
  rss_url = excluded.rss_url,
  homepage_url = excluded.homepage_url,
  enabled = true,
  failure_count = 0,
  updated_at = now();

-- Clear the failure counters on feeds that are still enabled, so the health
-- view reflects what happens from now on rather than the dead URLs' history.
update public.news_sources
set failure_count = 0,
    updated_at = now()
where enabled = true;

-- Tighten crawl intervals so the desk stays fresh.
--
-- Intervals of 180-480 minutes meant a feed was revisited every three to eight
-- hours, so a newsroom refreshed every half hour was mostly re-reading the same
-- corpus. Banded by priority: the wires that carry breaking copy are checked
-- every half hour, the rest less often. Combined with FEEDS_PER_RUN this keeps
-- any single run inside the cron's 60-second budget.
update public.news_sources
set crawl_interval = case
      when priority >= 85 then 30
      when priority >= 75 then 60
      else 120
    end,
    updated_at = now()
where enabled = true;
