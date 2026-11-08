/**
 * Drizzle schema of D1 `DB` (docs/ARCHITECTURE.md#database), the source of truth: edit, then `pnpm db:generate` a migration.
 * Dates are UTC `YYYY-MM-DD`, timestamps ISO (`…Z`), so both sort and compare as text.
 */
import { sql } from 'drizzle-orm';
import { check, index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const DAY_GLOB = `'[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'`;
const nowIso = sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`;

// ---------------------------------------------------------------------------------------------------------------
// /stats history (docs/ARCHITECTURE.md#stats-page). KV snapshot `stats:v1` is rebuilt from these after every collector run.

/**
 * Per platform and day:
 * - `followers`: end-of-day followers (YouTube: subscribers), all platforms
 * - `views`, `watch_minutes`: channel views and watch time that day (YouTube only). Without YouTube Analytics, `views` is the
 *   day-over-day delta of `total_views` (written by the collector, `workers/stats-collector/`) and `watch_minutes` stays empty.
 * - `total_views`: lifetime channel views at the day's last collector run (YouTube Data API), the baseline for `views`
 * - `posts`: posts published that day (videos, shorts, posts, streams), per platform
 */
export const METRICS = ['followers', 'views', 'watch_minutes', 'total_views', 'posts'] as const;
export type Metric = (typeof METRICS)[number];

/** One value per platform, metric and UTC day; the day's last collector run wins (`onConflictDoUpdate`). */
export const dailyMetrics = sqliteTable(
	'daily_metrics',
	{
		day: text('day').notNull(),
		platform: text('platform').notNull(),
		metric: text('metric', { enum: METRICS }).notNull(),
		value: integer('value').notNull(),
		fetchedAt: text('fetched_at').notNull().default(nowIso)
	},
	(t) => [
		primaryKey({ columns: [t.platform, t.metric, t.day] }),
		// Range queries for the page ("all platforms, metric X, last N days").
		index('daily_metrics_metric_day').on(t.metric, t.day),
		check('daily_metrics_day_format', sql`${t.day} GLOB ${sql.raw(DAY_GLOB)}`),
		check('daily_metrics_metric_known', sql`${t.metric} IN ${sql.raw(`(${METRICS.map((m) => `'${m}'`).join(', ')})`)}`),
		check('daily_metrics_value_positive', sql`${t.value} >= 0`)
	]
);

/** YouTube videos that appear in the top list. */
export const videos = sqliteTable(
	'videos',
	{
		id: text('id').primaryKey(),
		title: text('title').notNull(),
		durationSeconds: integer('duration_seconds').notNull(),
		publishedAt: text('published_at'),
		updatedAt: text('updated_at').notNull().default(nowIso)
	},
	(t) => [check('videos_duration_positive', sql`${t.durationSeconds} >= 0`)]
);

/**
 * Views per video and UTC day; top-list period totals sum over `views`. Without YouTube Analytics, `views` is the day-over-day
 * delta of `total_views` (lifetime `viewCount` at the day's last collector run, the baseline for the next day's delta).
 */
export const videoDailyViews = sqliteTable(
	'video_daily_views',
	{
		videoId: text('video_id')
			.notNull()
			.references(() => videos.id, { onDelete: 'cascade' }),
		day: text('day').notNull(),
		views: integer('views').notNull(),
		totalViews: integer('total_views')
	},
	(t) => [
		primaryKey({ columns: [t.videoId, t.day] }),
		index('video_daily_views_day').on(t.day),
		check('video_daily_views_day_format', sql`${t.day} GLOB ${sql.raw(DAY_GLOB)}`),
		check('video_daily_views_views_positive', sql`${t.views} >= 0`),
		check('video_daily_views_total_views_positive', sql`${t.totalViews} >= 0`)
	]
);
