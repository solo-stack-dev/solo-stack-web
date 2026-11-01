import { query } from '$app/server';
import * as v from 'valibot';
import { StatsSchema, type Stats } from './schema.ts';
import { loadStats } from './source.server.ts';

/**
 * All numbers of the /stats page, rendered per request (the page is not prerendered), so new numbers show up without
 * a rebuild. Freshness and caching come from the source: see `loadStats()` (planned KV snapshot with edge cache).
 */
export const getStats = query(async (): Promise<Stats> => v.parse(StatsSchema, await loadStats()));
