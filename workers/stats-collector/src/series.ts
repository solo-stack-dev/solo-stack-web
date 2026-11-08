/**
 * Pure parts of the collector: UTC days, view deltas, posting days and the `Stats` snapshot built from D1 rows. No I/O here,
 * so `series.test.ts` covers it with `node --test`.
 */
import { HISTORY_DAYS, PERIODS, STAT_PLATFORM_IDS, type Period, type Stats, type TopVideo } from '#lib/stats/schema.ts';

/** UTC day, `YYYY-MM-DD`. */
export type Day = string;

const DAY_MS = 86_400_000;

export const dayOf = (time: string | number | Date): Day => new Date(time).toISOString().slice(0, 10);

export const addDays = (day: Day, days: number): Day => dayOf(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS);

/** The `HISTORY_DAYS` days of every `Stats` series, oldest first, last = `asOf`. */
export const historyDays = (asOf: Day): Day[] => Array.from({ length: HISTORY_DAYS }, (_, index) => addDays(asOf, index - HISTORY_DAYS + 1));

/**
 * Views since the previous lifetime total (YouTube Data API only has lifetime counts). `null` without a baseline: the first
 * observation says nothing about the day. Lifetime counts can shrink (YouTube removes invalid views); that day counts 0.
 */
export function viewsDelta(total: number, previous: number | undefined): number | null {
	return previous === undefined ? null : Math.max(0, total - previous);
}

/** Posts per day inside `days` from publish timestamps; days without posts are missing. */
export function countPerDay(timestamps: readonly string[], days: readonly Day[]): Map<Day, number> {
	const window = new Set(days);
	const counts = new Map<Day, number>();
	for (const timestamp of timestamps) {
		const day = dayOf(timestamp);
		if (window.has(day)) counts.set(day, (counts.get(day) ?? 0) + 1);
	}
	return counts;
}

/**
 * `posts` rows to upsert so D1 matches `counts` inside the fetched window: changed or new days, and 0 for stored days whose posts
 * are gone (deleted). Unchanged days are skipped (D1 row writes).
 */
export function postRowsToWrite(counts: ReadonlyMap<Day, number>, stored: ReadonlyMap<Day, number>): { day: Day; value: number }[] {
	const days = new Set([...counts.keys(), ...stored.keys()]);
	return [...days]
		.toSorted()
		.map((day) => ({ day, value: counts.get(day) ?? 0 }))
		.filter(({ day, value }) => stored.get(day) !== value && !(value === 0 && !stored.has(day)));
}

/**
 * A running total (followers) per day: a day without a row keeps the last known value (failed run, platform down), days before
 * the first row take the first value (history starts with the collector). `null` without any row.
 */
export function runningSeries(values: ReadonlyMap<Day, number>, days: readonly Day[]): number[] | null {
	const first = days.find((day) => values.has(day));
	if (first === undefined) return null;
	let last = values.get(first)!;
	return days.map((day) => (last = values.get(day) ?? last));
}

/** A per-day series (views, posts): a day without a row counts 0. */
export const dailySeries = (values: ReadonlyMap<Day, number> | undefined, days: readonly Day[]): number[] => days.map((day) => values?.get(day) ?? 0);

/** Views of the last 7, 30 and 90 days (each ending on the last of `days`). */
export function periodViews(daily: ReadonlyMap<Day, number>, days: readonly Day[]): Record<Period, number> {
	const series = dailySeries(daily, days);
	const sum = (period: Period) => series.slice(-period).reduce((total, value) => total + value, 0);
	return { 7: sum(7), 30: sum(30), 90: sum(90) };
}

export interface VideoRow {
	id: string;
	title: string;
	durationSeconds: number;
	/** Views per day (`video_daily_views.views`). */
	daily: ReadonlyMap<Day, number>;
}

/** The union of the `limit` most watched videos of every period (the page ranks per period and shows five). */
export function topVideos(videos: readonly VideoRow[], days: readonly Day[], limit = 5): TopVideo[] {
	const all = videos.map((video) => ({ id: video.id, title: video.title, durationSeconds: video.durationSeconds, views: periodViews(video.daily, days) }));
	const picked = new Set<string>();
	for (const period of PERIODS) {
		for (const video of all.toSorted((a, b) => b.views[period] - a.views[period]).slice(0, limit)) {
			if (video.views[period] > 0) picked.add(video.id);
		}
	}
	return all.filter((video) => picked.has(video.id));
}

export interface MetricRow {
	platform: string;
	metric: string;
	day: Day;
	value: number;
}

/** Rows by `platform/metric`, then day. */
function groupRows(rows: readonly MetricRow[]): Map<string, Map<Day, number>> {
	const groups = new Map<string, Map<Day, number>>();
	for (const row of rows) {
		const key = `${row.platform}/${row.metric}`;
		let group = groups.get(key);
		if (!group) groups.set(key, (group = new Map()));
		group.set(row.day, row.value);
	}
	return groups;
}

/**
 * The live `Stats` snapshot from the D1 rows of the last `HISTORY_DAYS` days. Platforms without any follower row are left out
 * (the page shows them as "later"); watch time is `null` until rows exist (YouTube Analytics). Validate before storing.
 */
export function buildStats(asOf: Day, rows: readonly MetricRow[], videos: readonly VideoRow[]): Stats {
	const days = historyDays(asOf);
	const groups = groupRows(rows);
	const platforms = STAT_PLATFORM_IDS.flatMap((id) => {
		const followers = runningSeries(groups.get(`${id}/followers`) ?? new Map(), days);
		return followers ? [{ id, followers }] : [];
	});
	const watch = groups.get('youtube/watch_minutes');
	const posts = days.map((day) => STAT_PLATFORM_IDS.reduce((total, id) => total + (groups.get(`${id}/posts`)?.get(day) ?? 0), 0));
	return {
		source: 'live',
		asOf,
		platforms,
		youtube: {
			views: dailySeries(groups.get('youtube/views'), days),
			watchMinutes: watch?.size ? dailySeries(watch, days) : null,
			topVideos: topVideos(videos, days)
		},
		posts
	};
}
