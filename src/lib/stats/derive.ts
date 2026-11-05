/** Pure helpers: daily `Stats` series → per-period page values. */
import { HISTORY_DAYS, type Period, type Stats, type StatPlatformId } from './schema.ts';

const LAST = HISTORY_DAYS - 1;
const DAY_MS = 86_400_000;

/** UTC date of a series index (`HISTORY_DAYS - 1` is `asOf`). */
export const dateAt = (asOf: string, index: number) => new Date(Date.parse(asOf) - (LAST - index) * DAY_MS);

/** A period's points: start value plus one per day (`days + 1` values). */
export const periodSlice = <T>(series: readonly T[], days: Period): T[] => series.slice(LAST - days);

export interface Change {
	/** Value at the end of the period. */
	value: number;
	/** Absolute change inside the period. */
	delta: number;
	/** `delta` relative to the value at the start of the period (0 when it started at 0). */
	ratio: number;
}

/** Change of a running total (followers) over the period. */
export function changeOf(series: readonly number[], days: Period): Change {
	const value = series[LAST];
	const start = series[LAST - days];
	return { value, delta: value - start, ratio: start > 0 ? (value - start) / start : 0 };
}

export interface PeriodSum {
	value: number;
	previous: number;
	/** `value` compared with the previous period of the same length (0 when there is none). */
	ratio: number;
}

/** Sum of a per-day series (views, watch time, posts) over the period and the one before. */
export function sumOf(series: readonly number[], days: Period): PeriodSum {
	const sum = (from: number, to: number) => series.slice(from, to).reduce((total, value) => total + value, 0);
	const value = sum(LAST - days + 1, LAST + 1);
	const previous = sum(LAST - 2 * days + 1, LAST - days + 1);
	return { value, previous, ratio: previous > 0 ? (value - previous) / previous : 0 };
}

/** Growth of a running total vs. its growth in the previous period (e.g. new followers). */
export function newOf(series: readonly number[], days: Period): PeriodSum {
	const value = series[LAST] - series[LAST - days];
	const previous = series[LAST - days] - series[Math.max(0, LAST - 2 * days)];
	return { value, previous, ratio: previous > 0 ? (value - previous) / previous : 0 };
}

/** Followers of all platforms per day. */
export const totalFollowers = (stats: Stats): number[] =>
	Array.from({ length: HISTORY_DAYS }, (_, day) => stats.platforms.reduce((total, platform) => total + platform.followers[day], 0));

/** Platforms with their own color in the stacked chart and share bar, in slot order; the rest is "other". */
export const SERIES_PLATFORMS = ['youtube', 'tiktok', 'instagram', 'x'] as const satisfies readonly StatPlatformId[];
export type SeriesKey = (typeof SERIES_PLATFORMS)[number] | 'other';
export const SERIES_KEYS: readonly SeriesKey[] = [...SERIES_PLATFORMS, 'other'];

/** Chart color per series, fixed by entity (never by rank): `--chart-1` … `--chart-5`. */
export const SERIES_COLOR: Record<SeriesKey, string> = {
	youtube: 'var(--chart-1)',
	tiktok: 'var(--chart-2)',
	instagram: 'var(--chart-3)',
	x: 'var(--chart-4)',
	other: 'var(--chart-5)'
};

/** One day of the growth chart. */
export interface GrowthRow extends Record<SeriesKey, number> {
	date: Date;
	total: number;
}

/** Followers per series key at a day. */
export function seriesValues(stats: Stats, day: number): Record<SeriesKey, number> {
	const values: Record<SeriesKey, number> = { youtube: 0, tiktok: 0, instagram: 0, x: 0, other: 0 };
	for (const platform of stats.platforms) {
		const key = (SERIES_PLATFORMS as readonly string[]).includes(platform.id) ? (platform.id as SeriesKey) : 'other';
		values[key] += platform.followers[day];
	}
	return values;
}

/** Longest run of consecutive days with at least one post. */
export function longestStreak(posts: readonly number[]): number {
	let best = 0;
	let run = 0;
	for (const count of posts) {
		run = count > 0 ? run + 1 : 0;
		best = Math.max(best, run);
	}
	return best;
}

export const LAST_DAY = LAST;
