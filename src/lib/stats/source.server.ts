/**
 * Where the /stats numbers come from. Today: MOCK DATA (`createMockStats()`).
 *
 * TODO(stats): planned live source (docs/ARCHITECTURE.md#stats-page). Bindings are configured in `wrangler.jsonc`:
 * 1. A collector (Cron Trigger, daily, optionally every few hours) fetches the follower counts and YouTube numbers
 *    from the platform APIs and upserts today's rows into D1 (`STATS_DB`, schema in `migrations/`). D1 keeps the
 *    full history. Most APIs only return "now", so start collecting early.
 * 2. After each run it builds the `Stats` object from the last `HISTORY_DAYS` days and writes it to KV
 *    (`STATS_KV`, key `stats:v1`).
 * 3. This function reads the snapshot: `await platform.env.STATS_KV.get('stats:v1', { type: 'json', cacheTtl: 3600 })`.
 *    The `cacheTtl` keeps it in the edge cache for an hour, so page views rarely hit KV and never hit D1.
 * 4. Fall back to the last good value (or the mock) when KV is empty, so the page never breaks.
 *
 * The remote function parses the result with `StatsSchema`, so the UI never sees a malformed value.
 */
import { createMockStats } from './mock.ts';

export async function loadStats(): Promise<unknown> {
	return createMockStats();
}
