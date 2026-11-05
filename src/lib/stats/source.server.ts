/**
 * Source of the /stats numbers. Today: MOCK DATA (`createMockStats()`). The remote function parses the result with `StatsSchema`.
 *
 * TODO(stats): live source (docs/ARCHITECTURE.md#stats-page), bindings in `wrangler.jsonc`:
 * 1. Cron collector (daily, optionally every few hours) fetches follower counts and YouTube numbers and upserts today's rows into
 *    D1 (`getDb()` from `#lib/db/client.server.ts`, tables in `#lib/db/schema.ts`). D1 keeps full history; most APIs only return
 *    "now", so start collecting early.
 * 2. After each run, build `Stats` from the last `HISTORY_DAYS` days and write it to KV (`KV`, key `stats:v1`).
 * 3. Here: `await env.KV.get('stats:v1', { type: 'json', cacheTtl: 3600 })` (`env` from `cloudflare:workers`). The 1 h edge cache
 *    means page views rarely hit KV and never hit D1.
 * 4. If KV is empty, fall back to the last good value (or the mock) so the page never breaks.
 */
import { createMockStats } from './mock.ts';

export async function loadStats(): Promise<unknown> {
	return createMockStats();
}
