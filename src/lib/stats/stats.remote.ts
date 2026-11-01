import { prerender } from '$app/server';
import * as v from 'valibot';
import { StatsSchema, type Stats } from './schema.ts';
import { loadStats } from './source.server.ts';

/**
 * All numbers of the /stats page. Prerendered like the rest of the site: computed once per build from whatever
 * `loadStats()` returns. When live data lands and should refresh without a rebuild, switch to a `query`, set
 * `prerender = false` for /stats and let `loadStats()` handle freshness (planned KV snapshot with edge cache).
 */
export const getStats = prerender(async (): Promise<Stats> => v.parse(StatsSchema, await loadStats()));
