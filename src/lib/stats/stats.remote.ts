import { query } from '$app/server';
import type { Stats } from './schema.ts';
import { loadStats } from './source.server.ts';

/** All /stats numbers: the collector's KV snapshot (validated in `loadStats()`), or the mock while there is none. */
export const getStats = query(async (): Promise<Stats> => loadStats());
