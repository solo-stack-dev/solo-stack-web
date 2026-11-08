import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import * as v from 'valibot';
import { HISTORY_DAYS, StatsSchema } from '#lib/stats/schema.ts';
import { parseDuration } from './platforms/youtube.ts';
import { isoTimestamp } from './platforms/instagram.ts';
import {
	addDays,
	buildStats,
	countPerDay,
	dailySeries,
	historyDays,
	periodViews,
	postRowsToWrite,
	runningSeries,
	topVideos,
	viewsDelta,
	type MetricRow
} from './series.ts';

const AS_OF = '2026-11-08';
const days = historyDays(AS_OF);

/** A video with views `[days back, views]`. */
const video = (id: string, entries: [number, number][]) => ({
	id,
	title: id,
	durationSeconds: 60,
	daily: new Map(entries.map(([back, views]) => [addDays(AS_OF, -back), views]))
});

describe('days', () => {
	test('history window ends on asOf and spans HISTORY_DAYS', () => {
		assert.equal(days.length, HISTORY_DAYS);
		assert.equal(days.at(-1), AS_OF);
		assert.equal(days[0], addDays(AS_OF, -(HISTORY_DAYS - 1)));
	});

	test('addDays crosses months and years in UTC', () => {
		assert.equal(addDays('2026-12-31', 1), '2027-01-01');
		assert.equal(addDays('2026-03-01', -1), '2026-02-28');
	});
});

describe('viewsDelta', () => {
	test('no baseline → unknown', () => assert.equal(viewsDelta(100, undefined), null));
	test('growth', () => assert.equal(viewsDelta(130, 100), 30));
	test('shrinking lifetime count counts 0', () => assert.equal(viewsDelta(95, 100), 0));
	test('new video from 0', () => assert.equal(viewsDelta(42, 0), 42));
});

describe('posts', () => {
	test('countPerDay counts UTC days inside the window only', () => {
		const counts = countPerDay(['2026-11-08T23:59:59Z', '2026-11-08T00:00:00Z', '2026-11-07T12:00:00Z', '2020-01-01T00:00:00Z'], days);
		assert.deepEqual(
			[...counts],
			[
				['2026-11-08', 2],
				['2026-11-07', 1]
			]
		);
	});

	test('postRowsToWrite writes changes, zeroes deleted days, skips unchanged', () => {
		const counts = new Map([
			['2026-11-08', 2],
			['2026-11-06', 1]
		]);
		const stored = new Map([
			['2026-11-06', 1],
			['2026-11-05', 3]
		]);
		assert.deepEqual(postRowsToWrite(counts, stored), [
			{ day: '2026-11-05', value: 0 },
			{ day: '2026-11-08', value: 2 }
		]);
	});
});

describe('series', () => {
	test('runningSeries backfills before the first row and carries gaps forward', () => {
		const window = ['d1', 'd2', 'd3', 'd4', 'd5'];
		assert.deepEqual(
			runningSeries(
				new Map([
					['d2', 10],
					['d4', 12]
				]),
				window
			),
			[10, 10, 10, 12, 12]
		);
		assert.equal(runningSeries(new Map(), window), null);
	});

	test('dailySeries counts missing days as 0', () => {
		assert.deepEqual(dailySeries(new Map([['b', 3]]), ['a', 'b', 'c']), [0, 3, 0]);
		assert.deepEqual(dailySeries(undefined, ['a']), [0]);
	});

	test('periodViews sums the last 7/30/90 days', () => {
		const daily = new Map([
			[AS_OF, 1],
			[addDays(AS_OF, -6), 2],
			[addDays(AS_OF, -7), 4],
			[addDays(AS_OF, -89), 8],
			[addDays(AS_OF, -90), 16]
		]);
		assert.deepEqual(periodViews(daily, days), { 7: 3, 30: 7, 90: 15 });
	});

	test('topVideos keeps the union of every period top list and drops videos without views', () => {
		const list = [video('new', [[0, 50]]), video('old', [[60, 500]]), video('none', []), ...['a', 'b', 'c', 'd', 'e'].map((id) => video(id, [[1, 100]]))];
		const ids = topVideos(list, days)
			.map((entry) => entry.id)
			.toSorted();
		assert.deepEqual(ids, ['a', 'b', 'c', 'd', 'e', 'old']);
	});
});

describe('buildStats', () => {
	const rows: MetricRow[] = [
		{ platform: 'youtube', metric: 'followers', day: addDays(AS_OF, -1), value: 100 },
		{ platform: 'youtube', metric: 'followers', day: AS_OF, value: 103 },
		{ platform: 'youtube', metric: 'total_views', day: AS_OF, value: 9000 },
		{ platform: 'youtube', metric: 'views', day: AS_OF, value: 40 },
		{ platform: 'youtube', metric: 'posts', day: AS_OF, value: 1 },
		{ platform: 'bluesky', metric: 'followers', day: AS_OF, value: 7 },
		{ platform: 'bluesky', metric: 'posts', day: AS_OF, value: 2 },
		{ platform: 'bluesky', metric: 'posts', day: addDays(AS_OF, -3), value: 1 }
	];

	test('builds a valid live snapshot with only the platforms that have rows', () => {
		const stats = v.parse(StatsSchema, buildStats(AS_OF, rows, []));
		assert.equal(stats.source, 'live');
		assert.equal(stats.asOf, AS_OF);
		assert.deepEqual(
			stats.platforms.map((platform) => platform.id),
			['youtube', 'bluesky']
		);
		assert.equal(stats.platforms[0].followers[0], 100);
		assert.equal(stats.platforms[0].followers.at(-1), 103);
		assert.equal(stats.youtube.views.at(-1), 40);
		assert.equal(stats.youtube.watchMinutes, null);
		assert.equal(stats.posts.at(-1), 3);
		assert.equal(stats.posts.at(-4), 1);
		assert.equal(
			stats.posts.reduce((total, value) => total + value, 0),
			4
		);
	});

	test('watch time appears once rows exist', () => {
		const stats = buildStats(AS_OF, [...rows, { platform: 'youtube', metric: 'watch_minutes', day: AS_OF, value: 90 }], []);
		assert.equal(stats.youtube.watchMinutes?.at(-1), 90);
	});

	test('no follower rows → invalid (KV keeps the previous snapshot)', () => {
		assert.equal(v.safeParse(StatsSchema, buildStats(AS_OF, [], [])).success, false);
	});
});

describe('platform parsing', () => {
	test('YouTube durations', () => {
		assert.equal(parseDuration('PT1H2M3S'), 3723);
		assert.equal(parseDuration('PT45S'), 45);
		assert.equal(parseDuration('P1DT1M'), 86_460);
		assert.equal(parseDuration('P0D'), 0);
	});

	test('Instagram timestamps', () => {
		assert.equal(isoTimestamp('2026-11-02T18:04:11+0000'), '2026-11-02T18:04:11.000Z');
		assert.equal(isoTimestamp('2026-11-02T20:04:11+0200'), '2026-11-02T18:04:11.000Z');
	});
});
