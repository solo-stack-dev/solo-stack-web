import { prerender } from '$app/server';
import * as v from 'valibot';
import { createMockStats } from './mock.ts';
import { StatsSchema, type Stats } from './schema.ts';

/**
 * All numbers of the /stats page. Prerendered: computed once per build.
 *
 * TODO(stats): MOCK DATA. Replace `createMockStats()` with the real platform APIs (see the open list in
 * docs/ARCHITECTURE.md). Keep the valibot parse: the UI relies on the `Stats` shape. If live data should refresh
 * without a rebuild, switch `prerender` to a cached `query`.
 */
export const getStats = prerender(async (): Promise<Stats> => v.parse(StatsSchema, createMockStats()));
