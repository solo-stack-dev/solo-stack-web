/**
 * D1 side of the collector (tables in `#lib/db/schema.ts`): upsert one platform's reading for today, and read the rows the
 * snapshot is built from. Writes go out as multi-row upserts in one `db.batch` (one round trip, all or nothing), chunked to
 * D1's limit of 100 bound parameters per statement.
 */
import { and, desc, eq, gt, gte, isNotNull, lt, lte, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import type { BatchItem } from 'drizzle-orm/batch';
import { dailyMetrics, videoDailyViews, videos, type Metric } from '#lib/db/schema.ts';
import type { Reading } from './platforms/types.ts';
import { addDays, countPerDay, postRowsToWrite, viewsDelta, type Day, type MetricRow, type VideoRow } from './series.ts';

export const getDb = (env: Pick<Env, 'DB'>) => drizzle(env.DB);
type Db = ReturnType<typeof getDb>;

const MAX_PARAMS = 100;

function chunks<T extends object>(rows: readonly T[]): T[][] {
	if (!rows.length) return [];
	const size = Math.floor(MAX_PARAMS / Object.keys(rows[0]).length);
	return Array.from({ length: Math.ceil(rows.length / size) }, (_, index) => rows.slice(index * size, (index + 1) * size));
}

/** What a platform step reports (kept small: it is stored as the step result). */
export interface StoreSummary {
	followers: number;
	postDaysWritten?: number;
	views?: number | null;
	videos?: number;
}

/**
 * Upsert one platform's reading for `today` (UTC). `days` is the history window, which the `posts` rows are reconciled for.
 * YouTube views per day are deltas of the lifetime totals against the latest total stored before today, so several runs on one
 * day all measure from the same baseline and the last one wins.
 */
export async function storeReading(db: Db, reading: Reading, today: Day, days: readonly Day[]): Promise<StoreSummary> {
	const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
	const platform = reading.platform;
	const metric = (name: Metric, day: Day, value: number) => ({ platform, metric: name, day, value, fetchedAt: now });
	const metricRows = [metric('followers', today, reading.followers)];
	const summary: StoreSummary = { followers: reading.followers };

	if (reading.posts) {
		const stored = await db
			.select({ day: dailyMetrics.day, value: dailyMetrics.value })
			.from(dailyMetrics)
			.where(and(eq(dailyMetrics.platform, platform), eq(dailyMetrics.metric, 'posts'), gte(dailyMetrics.day, days[0])));
		const rows = postRowsToWrite(countPerDay(reading.posts, days), new Map(stored.map((row) => [row.day, row.value])));
		metricRows.push(...rows.map((row) => metric('posts', row.day, row.value)));
		summary.postDaysWritten = rows.length;
	}

	const statements: BatchItem<'sqlite'>[] = [];
	const youtube = reading.youtube;
	if (youtube) {
		const [previous] = await db
			.select({ value: dailyMetrics.value, fetchedAt: dailyMetrics.fetchedAt })
			.from(dailyMetrics)
			.where(and(eq(dailyMetrics.platform, platform), eq(dailyMetrics.metric, 'total_views'), lt(dailyMetrics.day, today)))
			.orderBy(desc(dailyMetrics.day))
			.limit(1);
		const views = viewsDelta(youtube.totalViews, previous?.value);
		metricRows.push(metric('total_views', today, youtube.totalViews));
		if (views !== null) metricRows.push(metric('views', today, views));
		summary.views = views;

		// Latest lifetime total per video before today (inside the window; older baselines are too stale to split into days).
		const totals = await db
			.select({ videoId: videoDailyViews.videoId, day: videoDailyViews.day, totalViews: videoDailyViews.totalViews })
			.from(videoDailyViews)
			.where(and(gte(videoDailyViews.day, days[0]), lt(videoDailyViews.day, today), isNotNull(videoDailyViews.totalViews)))
			.orderBy(videoDailyViews.day);
		const baseline = new Map(totals.map((row) => [row.videoId, row.totalViews!]));

		const videoRows = youtube.videos.map((video) => ({
			id: video.id,
			title: video.title,
			durationSeconds: video.durationSeconds,
			publishedAt: video.publishedAt,
			updatedAt: now
		}));
		const viewRows = youtube.videos.map((video) => {
			// A video published after the previous run started from 0 views; any other first sighting has no baseline (0 that day).
			const start = baseline.get(video.id) ?? (previous && video.publishedAt > previous.fetchedAt ? 0 : undefined);
			return { videoId: video.id, day: today, views: viewsDelta(video.totalViews, start) ?? 0, totalViews: video.totalViews };
		});
		for (const rows of chunks(videoRows)) {
			statements.push(
				db
					.insert(videos)
					.values(rows)
					.onConflictDoUpdate({
						target: videos.id,
						set: {
							title: sql`excluded.title`,
							durationSeconds: sql`excluded.duration_seconds`,
							publishedAt: sql`excluded.published_at`,
							updatedAt: sql`excluded.updated_at`
						}
					})
			);
		}
		for (const rows of chunks(viewRows)) {
			statements.push(
				db
					.insert(videoDailyViews)
					.values(rows)
					.onConflictDoUpdate({
						target: [videoDailyViews.videoId, videoDailyViews.day],
						set: { views: sql`excluded.views`, totalViews: sql`excluded.total_views` }
					})
			);
		}
		summary.videos = videoRows.length;
	}

	for (const rows of chunks(metricRows)) {
		statements.push(
			db
				.insert(dailyMetrics)
				.values(rows)
				.onConflictDoUpdate({
					target: [dailyMetrics.platform, dailyMetrics.metric, dailyMetrics.day],
					set: { value: sql`excluded.value`, fetchedAt: sql`excluded.fetched_at` }
				})
		);
	}

	const [first, ...rest] = statements;
	await db.batch([first, ...rest]);
	return summary;
}

/** The rows a snapshot ending on `asOf` needs: all metrics since `from`, and per-video daily views of the last 90 days. */
export async function readSnapshotRows(db: Db, from: Day, asOf: Day): Promise<{ metrics: MetricRow[]; videos: VideoRow[] }> {
	const [metrics, views] = await db.batch([
		db
			.select({ platform: dailyMetrics.platform, metric: dailyMetrics.metric, day: dailyMetrics.day, value: dailyMetrics.value })
			.from(dailyMetrics)
			.where(and(gte(dailyMetrics.day, from), lte(dailyMetrics.day, asOf))),
		db
			.select({ id: videos.id, title: videos.title, durationSeconds: videos.durationSeconds, day: videoDailyViews.day, views: videoDailyViews.views })
			.from(videoDailyViews)
			.innerJoin(videos, eq(videos.id, videoDailyViews.videoId))
			.where(and(gt(videoDailyViews.day, addDays(asOf, -90)), lte(videoDailyViews.day, asOf), gt(videoDailyViews.views, 0)))
	]);

	const byVideo = new Map<string, VideoRow & { daily: Map<Day, number> }>();
	for (const row of views) {
		let video = byVideo.get(row.id);
		if (!video) byVideo.set(row.id, (video = { id: row.id, title: row.title, durationSeconds: row.durationSeconds, daily: new Map() }));
		video.daily.set(row.day, row.views);
	}
	return { metrics, videos: [...byVideo.values()] };
}
