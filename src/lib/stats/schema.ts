/**
 * Data contract of /stats. The UI only sees a validated `Stats`, so the mock (`mock.ts`) can be swapped for real APIs behind
 * `getStats()` (`stats.remote.ts`) without UI changes. Every daily series: `HISTORY_DAYS` entries, oldest first, last = `asOf` (UTC).
 */
import * as v from 'valibot';
import type { SocialId } from '#lib/home/data/socials.ts';

/** Platforms with numbers. Discord has no stats yet (no permanent invite, see socials.ts). */
export const STAT_PLATFORM_IDS = ['youtube', 'github', 'instagram', 'tiktok', 'x', 'bluesky', 'threads', 'twitch', 'facebook'] as const satisfies readonly SocialId[];
export type StatPlatformId = (typeof STAT_PLATFORM_IDS)[number];

/** Page switch periods. History covers two of the longest (current + previous). */
export const PERIODS = [7, 30, 90] as const;
export type Period = (typeof PERIODS)[number];
export const HISTORY_DAYS = 2 * PERIODS[PERIODS.length - 1] + 1;

const Count = v.pipe(v.number(), v.integer(), v.minValue(0));
const DailySeries = v.pipe(v.array(Count), v.length(HISTORY_DAYS));

export const PlatformStatsSchema = v.object({
	id: v.picklist(STAT_PLATFORM_IDS),
	/** Followers (subscribers on YouTube) at the end of each day. */
	followers: DailySeries
});

export const TopVideoSchema = v.object({
	/** YouTube video id (mock entries use a `mock-…` id and have no thumbnail or link). */
	id: v.pipe(v.string(), v.nonEmpty()),
	title: v.pipe(v.string(), v.trim(), v.nonEmpty()),
	durationSeconds: Count,
	/** Views inside each period, keyed by period length in days. */
	views: v.object({ 7: Count, 30: Count, 90: Count })
});

export const StatsSchema = v.object({
	/** `mock` until real APIs are connected; the page shows a notice for it. */
	source: v.picklist(['mock', 'live']),
	/** Last day of every daily series (YYYY-MM-DD, UTC). */
	asOf: v.pipe(v.string(), v.isoDate()),
	platforms: v.pipe(v.array(PlatformStatsSchema), v.minLength(1)),
	youtube: v.object({
		/** Channel views per day. */
		views: DailySeries,
		/** Watch time per day in minutes. */
		watchMinutes: DailySeries,
		/** Most watched videos, any order (the page sorts per period). */
		topVideos: v.array(TopVideoSchema)
	}),
	/** Posts per day across all platforms (videos, shorts, posts, streams). */
	posts: DailySeries
});

export type PlatformStats = v.InferOutput<typeof PlatformStatsSchema>;
export type TopVideo = v.InferOutput<typeof TopVideoSchema>;
export type Stats = v.InferOutput<typeof StatsSchema>;
