-- Broaden wire coverage: defence, policy, energy, markets and regional desks.
-- Every feed URL below was fetched and confirmed to return >= 5 items.

insert into public.news_sources (
  id, name, domain, country, language, category, rss_url, homepage_url,
  crawl_method, crawl_interval, priority, trust_score, max_requests_per_minute, enabled
) values
  ('un-news', 'UN News', 'news.un.org', null, 'en', 'World', 'https://news.un.org/feed/subscribe/en/news/all/rss.xml', 'https://news.un.org/en/', 'rss', 420, 76, 0.85, 4, true),
  ('euronews', 'Euronews', 'euronews.com', 'FR', 'en', 'World', 'https://www.euronews.com/rss?level=theme&name=news', 'https://www.euronews.com/', 'rss', 360, 64, 0.76, 4, true),
  ('channel-news-asia', 'CNA', 'channelnewsasia.com', 'SG', 'en', 'World', 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml', 'https://www.channelnewsasia.com/', 'rss', 360, 67, 0.78, 4, true),
  ('anadolu', 'Anadolu Agency', 'aa.com.tr', 'TR', 'en', 'World', 'https://www.aa.com.tr/en/rss/default?cat=world', 'https://www.aa.com.tr/en', 'rss', 420, 55, 0.62, 4, true),
  ('jpost', 'Jerusalem Post', 'jpost.com', 'IL', 'en', 'World', 'https://www.jpost.com/rss/rssfeedsheadlines.aspx', 'https://www.jpost.com/', 'rss', 420, 56, 0.66, 4, true),
  ('moscow-times', 'The Moscow Times', 'themoscowtimes.com', 'RU', 'en', 'World', 'https://www.themoscowtimes.com/rss/news', 'https://www.themoscowtimes.com/', 'rss', 480, 50, 0.6, 3, true),
  ('tass', 'TASS', 'tass.com', 'RU', 'en', 'World', 'https://tass.com/rss/v2.xml', 'https://tass.com/', 'rss', 480, 45, 0.4, 3, true),
  ('defense-news', 'Defense News', 'defensenews.com', 'US', 'en', 'Defence', 'https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml', 'https://www.defensenews.com/', 'rss', 420, 72, 0.82, 4, true),
  ('defense-one', 'Defense One', 'defenseone.com', 'US', 'en', 'Defence', 'https://www.defenseone.com/rss/all/', 'https://www.defenseone.com/', 'rss', 420, 71, 0.8, 4, true),
  ('breaking-defense', 'Breaking Defense', 'breakingdefense.com', 'US', 'en', 'Defence', 'https://breakingdefense.com/feed/', 'https://breakingdefense.com/', 'rss', 420, 70, 0.79, 4, true),
  ('war-on-the-rocks', 'War on the Rocks', 'warontherocks.com', 'US', 'en', 'Defence', 'https://warontherocks.com/feed/', 'https://warontherocks.com/', 'rss', 600, 62, 0.78, 3, true),
  ('csis', 'CSIS', 'csis.org', 'US', 'en', 'Defence', 'https://www.csis.org/rss.xml', 'https://www.csis.org/', 'rss', 600, 61, 0.8, 3, true),
  ('politico-eu', 'Politico Europe', 'politico.eu', 'BE', 'en', 'Politics', 'https://www.politico.eu/feed/', 'https://www.politico.eu/', 'rss', 360, 74, 0.8, 4, true),
  ('the-diplomat', 'The Diplomat', 'thediplomat.com', 'US', 'en', 'Politics', 'https://thediplomat.com/feed/', 'https://thediplomat.com/', 'rss', 480, 65, 0.77, 3, true),
  ('scmp-news', 'South China Morning Post', 'scmp.com', 'HK', 'en', 'World', 'https://www.scmp.com/rss/91/feed', 'https://www.scmp.com/', 'rss', 420, 63, 0.72, 4, true),
  ('atlantic-council', 'Atlantic Council', 'atlanticcouncil.org', 'US', 'en', 'Politics', 'https://www.atlanticcouncil.org/feed/', 'https://www.atlanticcouncil.org/', 'rss', 600, 60, 0.76, 3, true),
  ('ecfr', 'ECFR', 'ecfr.eu', 'DE', 'en', 'Politics', 'https://ecfr.eu/feed/', 'https://ecfr.eu/', 'rss', 600, 58, 0.75, 3, true),
  ('lowy-interpreter', 'Lowy Interpreter', 'lowyinstitute.org', 'AU', 'en', 'Politics', 'https://www.lowyinstitute.org/the-interpreter/rss.xml', 'https://www.lowyinstitute.org/the-interpreter', 'rss', 600, 57, 0.75, 3, true),
  ('cnbc-world', 'CNBC', 'cnbc.com', 'US', 'en', 'Business', 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362', 'https://www.cnbc.com/world/', 'rss', 360, 66, 0.74, 4, true),
  ('oilprice', 'OilPrice', 'oilprice.com', 'US', 'en', 'Business', 'https://oilprice.com/rss/main', 'https://oilprice.com/', 'rss', 480, 54, 0.65, 3, true),
  ('eia-today', 'EIA Today in Energy', 'eia.gov', 'US', 'en', 'Business', 'https://www.eia.gov/rss/todayinenergy.xml', 'https://www.eia.gov/todayinenergy/', 'rss', 720, 59, 0.84, 3, true),
  ('bbc-tech', 'BBC Technology', 'bbc.co.uk', 'GB', 'en', 'Technology', 'https://feeds.bbci.co.uk/news/technology/rss.xml', 'https://www.bbc.co.uk/news/technology', 'rss', 360, 69, 0.86, 4, true),
  ('bbc-science', 'BBC Science', 'bbc.co.uk', 'GB', 'en', 'Science', 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', 'https://www.bbc.co.uk/news/science_and_environment', 'rss', 420, 68, 0.86, 4, true)
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
