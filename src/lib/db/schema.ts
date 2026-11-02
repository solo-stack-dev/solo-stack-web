/**
 * Drizzle schema of the D1 database `DB` (docs/ARCHITECTURE.md#database). Single source of truth for the tables:
 * change it here, then run `pnpm db:generate` to write the next migration into `migrations/`.
 *
 * Dates are UTC `YYYY-MM-DD` strings and timestamps ISO strings (`…Z`), so they sort and compare as text.
 */
import { sql } from 'drizzle-orm';
import { check, index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const DAY_GLOB = `'[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'`;
const nowIso = sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`;

// ---------------------------------------------------------------------------------------------------------------
// /stats history (docs/ARCHITECTURE.md#stats-page). The KV snapshot `stats:v1` is rebuilt from these tables after
// every collector run.

/**
 * Metrics stored per platform and day.
 * - `followers`: end-of-day followers (subscribers on YouTube), every platform
 * - `views`: channel views that day (YouTube)
 * - `watch_minutes`: watch time that day in minutes (YouTube)
 * - `posts`: posts published that day (videos, shorts, posts, streams), per platform
 */
export const METRICS = ['followers', 'views', 'watch_minutes', 'posts'] as const;
export type Metric = (typeof METRICS)[number];

/**
 * One value per platform, metric and UTC day. Re-running the collector on the same day overwrites the row
 * (`onConflictDoUpdate`), so the last fetch of a day wins.
 */
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
 * Views per video and UTC day (YouTube Analytics, dimensions `day` + `video`). Period totals for the top list are
 * sums over this table.
 */
export const videoDailyViews = sqliteTable(
	'video_daily_views',
	{
		videoId: text('video_id')
			.notNull()
			.references(() => videos.id, { onDelete: 'cascade' }),
		day: text('day').notNull(),
		views: integer('views').notNull()
	},
	(t) => [
		primaryKey({ columns: [t.videoId, t.day] }),
		index('video_daily_views_day').on(t.day),
		check('video_daily_views_day_format', sql`${t.day} GLOB ${sql.raw(DAY_GLOB)}`),
		check('video_daily_views_views_positive', sql`${t.views} >= 0`)
	]
);
