/**
 * MOCK DATA for the /stats page. Every number here is made up (seeded, deterministic, so builds are stable).
 * Replace `createMockStats()` in `source.server.ts` with real API calls once the platforms are connected; the shape is
 * `Stats` from `schema.ts`. The example video titles come from gpt-6.1-sol (docs/copy/stats-mock-videos-*.md).
 */
import { HISTORY_DAYS, STAT_PLATFORM_IDS, type Stats, type StatPlatformId, type TopVideo } from './schema.ts';

/** Example video titles (gpt-6.1-sol, docs/copy/stats-mock-videos-output.json). */
const MOCK_VIDEO_TITLES: readonly string[] = [
	'Ich arbeite weiter an meiner eigenen App',
	'So nutze ich KI beim Entwickeln',
	'Ich teste künstliche Intelligenz an einer Programmieraufgabe',
	'Was mich an neuen Entwicklungen bei KI beschäftigt',
	'Ein Blick hinter die Kulissen meiner Selbstständigkeit',
	'Zwischen Kundenarbeit und meinen eigenen Projekten'
];

/** Fixed last day of the mock series, so the mock page looks the same on every request. */
export const MOCK_AS_OF = '2026-10-31';

/** Followers 180 days ago → today, per platform. */
const MOCK_FOLLOWERS: Record<StatPlatformId, [start: number, end: number]> = {
	youtube: [1460, 4185],
	github: [212, 438],
	instagram: [890, 2140],
	tiktok: [1210, 3870],
	x: [530, 912],
	bluesky: [96, 341],
	threads: [188, 566],
	twitch: [120, 397],
	facebook: [64, 158]
};

/** mulberry32: tiny seeded PRNG. */
function random(seed: number): () => number {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const days = Array.from({ length: HISTORY_DAYS }, (_, day) => day);

/** Days with a new YouTube video: every three to five days. */
function uploadDays(next: () => number): Set<number> {
	const uploads = new Set<number>();
	for (let day = 2; day < HISTORY_DAYS; day += 3 + Math.floor(next() * 3)) uploads.add(day);
	return uploads;
}

/** Bump that decays over a few days after each upload. */
const uploadBoost = (day: number, uploads: Set<number>) => [0, 1, 2, 3].reduce((sum, back) => sum + (uploads.has(day - back) ? [1.6, 0.9, 0.45, 0.2][back] : 0), 0);

/** Growing daily increments with noise and upload spikes, scaled so the series runs exactly from `start` to `end`. */
function followerSeries(start: number, end: number, next: () => number, uploads: Set<number>, uploadWeight: number): number[] {
	const raw = days.map((day) => {
		if (day === 0) return 0;
		const trend = 0.35 + (day / HISTORY_DAYS) ** 0.9;
		const noise = 0.55 + next() * 0.9;
		const weekend = new Date(Date.parse(MOCK_AS_OF) - (HISTORY_DAYS - 1 - day) * 86_400_000).getUTCDay() % 6 === 0 ? 0.8 : 1;
		return trend * noise * weekend + uploadWeight * uploadBoost(day, uploads);
	});
	const scale = (end - start) / raw.reduce((sum, value) => sum + value, 0);
	let exact = start;
	return raw.map((value, day) => {
		exact += value * scale;
		// An occasional small dip (unfollows) keeps the lines honest looking; never on the first or last day.
		const dip = day > 0 && day < HISTORY_DAYS - 1 && next() < 0.04 ? Math.ceil(next() * 3) : 0;
		return Math.max(0, Math.round(exact) - dip);
	});
}

function youtubeDaily(next: () => number, uploads: Set<number>) {
	const views = days.map((day) => {
		const base = 260 + 1100 * (day / HISTORY_DAYS) ** 1.2;
		return Math.round(base * (0.8 + next() * 0.4) * (1 + 0.9 * uploadBoost(day, uploads)));
	});
	const watchMinutes = views.map((count) => Math.round(count * (3.1 + next() * 1.3)));
	return { views, watchMinutes };
}

function postSeries(next: () => number, uploads: Set<number>): number[] {
	return days.map((day) => {
		const weekday = new Date(Date.parse(MOCK_AS_OF) - (HISTORY_DAYS - 1 - day) * 86_400_000).getUTCDay();
		const restDay = weekday === 0 && next() < 0.7;
		if (restDay) return uploads.has(day) ? 1 : 0;
		const extra = next() < 0.18 ? 0 : Math.floor(next() * (weekday === 6 ? 2 : 4));
		return (uploads.has(day) ? 2 : 0) + extra;
	});
}

function topVideos(next: () => number): TopVideo[] {
	return MOCK_VIDEO_TITLES.map((title, index) => {
		const views90 = Math.round(2400 + next() * 9000);
		// Newer videos (higher index) have more of their views in the short periods, so the ranking changes per period.
		const recency = (index + 1) / MOCK_VIDEO_TITLES.length;
		const views30 = Math.round(views90 * (0.2 + 0.55 * recency * next() + 0.2 * recency));
		const views7 = Math.round(views30 * (0.1 + 0.6 * recency * next()));
		return { id: `mock-${index + 1}`, title, durationSeconds: Math.round(480 + next() * 1080), views: { 7: views7, 30: views30, 90: views90 } };
	});
}

/** The complete mock `Stats` object. */
export function createMockStats(): Stats {
	const next = random(0x5010_57ac);
	const uploads = uploadDays(next);
	return {
		source: 'mock',
		asOf: MOCK_AS_OF,
		platforms: STAT_PLATFORM_IDS.map((id) => {
			const [start, end] = MOCK_FOLLOWERS[id];
			const uploadWeight = id === 'youtube' ? 2.2 : id === 'tiktok' || id === 'instagram' ? 0.9 : 0.25;
			return { id, followers: followerSeries(start, end, next, uploads, uploadWeight) };
		}),
		youtube: { ...youtubeDaily(next, uploads), topVideos: topVideos(next) },
		posts: postSeries(next, uploads)
	};
}
