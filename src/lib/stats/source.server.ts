/**
 * Where the /stats numbers come from. Today: MOCK DATA (`createMockStats()`).
 *
 * TODO(stats): planned live source (docs/ARCHITECTURE.md#stats-page), no database needed:
 * 1. A Cron Trigger on the Worker (daily, optionally every few hours) fetches the follower counts and YouTube numbers
 *    from the platform APIs, appends today's values to the history and writes ONE JSON value to Workers KV
 *    (key `stats:v1`, a `Stats` object, about 100 kB for a year of history). Most APIs only return "now", so the
 *    history exists only from the day the cron starts: start collecting early.
 * 2. This function reads it: `await platform.env.STATS.get('stats:v1', { type: 'json', cacheTtl: 3600 })`. The
 *    `cacheTtl` keeps the value in the edge cache for an hour, so page views rarely hit KV (free plan: 100k reads and
 *    1k writes per day; the cron needs a handful of writes).
 * 3. Fall back to the last good value (or the mock) when KV is empty, so the page never breaks.
 *
 * The remote function parses the result with `StatsSchema`, so the UI never sees a malformed value.
 */
import { createMockStats } from './mock.ts';

export async function loadStats(): Promise<unknown> {
	return createMockStats();
}
