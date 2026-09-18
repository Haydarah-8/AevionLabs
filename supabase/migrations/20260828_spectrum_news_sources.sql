-- Outlets across the political spectrum, so narrative spread has both sides
-- to measure. Every feed below was fetched and confirmed to return >= 5 items.

insert into public.news_sources (
  id, name, domain, country, language, category, rss_url, homepage_url,
  crawl_method, crawl_interval, priority, trust_score, max_requests_per_minute, enabled
) values
  ('fox-news', 'Fox News', 'foxnews.com', 'US', 'en', 'Politics', 'https://moxie.foxnews.com/google-publisher/latest.xml', 'https://www.foxnews.com/', 'rss', 420, 62, 0.6, 4, true),
  ('ny-post', 'New York Post', 'nypost.com', 'US', 'en', 'World', 'https://nypost.com/feed/', 'https://nypost.com/', 'rss', 420, 52, 0.55, 4, true),
  ('washington-times', 'Washington Times', 'washingtontimes.com', 'US', 'en', 'Politics', 'https://www.washingtontimes.com/rss/headlines/news/', 'https://www.washingtontimes.com/', 'rss', 420, 53, 0.6, 4, true),
  ('daily-mail', 'Daily Mail', 'dailymail.co.uk', 'GB', 'en', 'UK', 'https://www.dailymail.co.uk/news/index.rss', 'https://www.dailymail.co.uk/', 'rss', 420, 48, 0.45, 4, true),
  ('national-review', 'National Review', 'nationalreview.com', 'US', 'en', 'Politics', 'https://www.nationalreview.com/feed/', 'https://www.nationalreview.com/', 'rss', 420, 56, 0.65, 4, true),
  ('washington-examiner', 'Washington Examiner', 'washingtonexaminer.com', 'US', 'en', 'Politics', 'https://www.washingtonexaminer.com/feed', 'https://www.washingtonexaminer.com/', 'rss', 420, 55, 0.62, 4, true),
  ('breitbart', 'Breitbart', 'breitbart.com', 'US', 'en', 'Politics', 'https://feeds.feedburner.com/breitbart', 'https://www.breitbart.com/', 'rss', 420, 42, 0.35, 4, true),
  ('daily-wire', 'The Daily Wire', 'dailywire.com', 'US', 'en', 'Politics', 'https://www.dailywire.com/feeds/rss.xml', 'https://www.dailywire.com/', 'rss', 420, 43, 0.4, 4, true),
  ('gb-news', 'GB News', 'gbnews.com', 'GB', 'en', 'UK', 'https://www.gbnews.com/feeds/news.rss', 'https://www.gbnews.com/', 'rss', 420, 47, 0.45, 4, true),
  ('vox', 'Vox', 'vox.com', 'US', 'en', 'Politics', 'https://www.vox.com/rss/index.xml', 'https://www.vox.com/', 'rss', 420, 54, 0.6, 4, true),
  ('mother-jones', 'Mother Jones', 'motherjones.com', 'US', 'en', 'Politics', 'https://www.motherjones.com/feed/', 'https://www.motherjones.com/', 'rss', 420, 50, 0.55, 4, true),
  ('the-nation', 'The Nation', 'thenation.com', 'US', 'en', 'Politics', 'https://www.thenation.com/feed/?post_type=article', 'https://www.thenation.com/', 'rss', 420, 49, 0.55, 4, true),
  ('salon', 'Salon', 'salon.com', 'US', 'en', 'Politics', 'https://www.salon.com/feed/', 'https://www.salon.com/', 'rss', 420, 44, 0.45, 4, true),
  ('the-intercept', 'The Intercept', 'theintercept.com', 'US', 'en', 'Politics', 'https://theintercept.com/feed/?rss', 'https://theintercept.com/', 'rss', 420, 51, 0.6, 4, true),
  ('jacobin', 'Jacobin', 'jacobin.com', 'US', 'en', 'Politics', 'https://jacobin.com/feed/', 'https://jacobin.com/', 'rss', 420, 43, 0.5, 4, true),
  ('common-dreams', 'Common Dreams', 'commondreams.org', 'US', 'en', 'Politics', 'https://www.commondreams.org/feeds/news.rss', 'https://www.commondreams.org/', 'rss', 420, 42, 0.5, 4, true),
  ('democracy-now', 'Democracy Now', 'democracynow.org', 'US', 'en', 'Politics', 'https://www.democracynow.org/democracynow.rss', 'https://www.democracynow.org/', 'rss', 420, 46, 0.55, 4, true),
  ('the-hill', 'The Hill', 'thehill.com', 'US', 'en', 'Politics', 'https://thehill.com/news/feed/', 'https://thehill.com/', 'rss', 420, 64, 0.72, 4, true),
  ('axios', 'Axios', 'axios.com', 'US', 'en', 'Politics', 'https://api.axios.com/feed/', 'https://www.axios.com/', 'rss', 420, 66, 0.76, 4, true),
  ('newsweek', 'Newsweek', 'newsweek.com', 'US', 'en', 'World', 'https://www.newsweek.com/rss', 'https://www.newsweek.com/', 'rss', 420, 57, 0.62, 4, true),
  ('csmonitor', 'Christian Science Monitor', 'csmonitor.com', 'US', 'en', 'World', 'https://rss.csmonitor.com/feeds/usa', 'https://www.csmonitor.com/', 'rss', 420, 63, 0.78, 4, true),
  ('pbs-newshour', 'PBS NewsHour', 'pbs.org', 'US', 'en', 'World', 'https://www.pbs.org/newshour/feeds/rss/headlines', 'https://www.pbs.org/newshour/', 'rss', 420, 70, 0.82, 4, true),
  ('cbs-news', 'CBS News', 'cbsnews.com', 'US', 'en', 'World', 'https://www.cbsnews.com/latest/rss/world', 'https://www.cbsnews.com/', 'rss', 420, 68, 0.76, 4, true),
  ('nbc-news', 'NBC News', 'nbcnews.com', 'US', 'en', 'World', 'https://feeds.nbcnews.com/nbcnews/public/world', 'https://www.nbcnews.com/', 'rss', 420, 67, 0.75, 4, true)
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
