-- Daily history of the /stats page (docs/ARCHITECTURE.md#stats-page). Source of truth; the KV snapshot
-- (`stats:v1`) is rebuilt from these tables after every collector run.
-- Apply: `wrangler d1 migrations apply STATS_DB --local` (dev) or `--remote --env staging|production`.

-- One value per platform, metric and UTC day. Re-running the collector on the same day overwrites the row
-- (`INSERT … ON CONFLICT DO UPDATE`), so the last fetch of a day wins.
--   followers      end-of-day followers (subscribers on YouTube), every platform
--   views          channel views that day (YouTube)
--   watch_minutes  watch time that day in minutes (YouTube)
--   posts          posts published that day (videos, shorts, posts, streams), per platform
CREATE TABLE daily_metrics (
	day TEXT NOT NULL CHECK (day GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
	platform TEXT NOT NULL,
	metric TEXT NOT NULL CHECK (metric IN ('followers', 'views', 'watch_minutes', 'posts')),
	value INTEGER NOT NULL CHECK (value >= 0),
	fetched_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
	PRIMARY KEY (platform, metric, day)
) STRICT, WITHOUT ROWID;

-- Range queries for the page ("all platforms, metric X, last N days").
CREATE INDEX daily_metrics_metric_day ON daily_metrics (metric, day);

-- YouTube videos that appear in the top list.
CREATE TABLE videos (
	id TEXT PRIMARY KEY,
	title TEXT NOT NULL,
	duration_seconds INTEGER NOT NULL CHECK (duration_seconds >= 0),
	published_at TEXT,
	updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
) STRICT;

-- Views per video and UTC day (YouTube Analytics, dimension `day` + `video`). Period totals for the top list
-- are sums over this table.
CREATE TABLE video_daily_views (
	video_id TEXT NOT NULL REFERENCES videos (id) ON DELETE CASCADE,
	day TEXT NOT NULL CHECK (day GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
	views INTEGER NOT NULL CHECK (views >= 0),
	PRIMARY KEY (video_id, day)
) STRICT, WITHOUT ROWID;

CREATE INDEX video_daily_views_day ON video_daily_views (day);
