/* oxlint-disable no-console -- server logs end up in Workers Logs (observability), the only place to see a broken snapshot */
/**
 * Source of the /stats numbers (docs/ARCHITECTURE.md#stats-page): the `Stats` snapshot that the collector Worker
 * (`workers/stats-collector/`) writes to KV after every run. KV reads go through the edge cache (`cacheTtl`), so page views
 * rarely hit KV and never hit D1. Without a valid snapshot (no run yet, KV error, outdated shape) the page shows the mock,
 * which carries its own notice, so it never breaks.
 */
import { env } from 'cloudflare:workers';
import * as v from 'valibot';
import { createMockStats } from './mock.ts';
import { STATS_KV_KEY, StatsSchema, type Stats } from './schema.ts';

export async function loadStats(): Promise<Stats> {
	try {
		const snapshot = await env.KV.get(STATS_KV_KEY, { type: 'json', cacheTtl: 3600 });
		if (snapshot !== null) {
			const parsed = v.safeParse(StatsSchema, snapshot);
			if (parsed.success) return parsed.output;
			console.error('stats: invalid KV snapshot, showing mock', v.flatten(parsed.issues));
		}
	} catch (error) {
		console.error('stats: KV read failed, showing mock', error);
	}
	return createMockStats();
}
