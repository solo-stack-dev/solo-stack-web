/* oxlint-disable no-console -- server logs end up in Workers Logs (observability), the only place to see collector failures */
/**
 * The collector run (docs/ARCHITECTURE.md#stats-page), started by the Workflow's `schedules` (every 6 hours) or manually
 * (`index.ts`). One step per platform fetches and upserts today's rows, with its own retries: a failing API is logged and
 * keeps its last good rows, the others carry on. The last step rebuilds the `Stats` snapshot from D1 and replaces the KV value
 * only when it validates.
 */
import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep, type WorkflowStepConfig } from 'cloudflare:workers';
import * as v from 'valibot';
import { STATS_KV_KEY, StatsSchema, type StatPlatformId } from '#lib/stats/schema.ts';
import { collectBluesky } from './platforms/bluesky.ts';
import { collectGithub } from './platforms/github.ts';
import { collectInstagram } from './platforms/instagram.ts';
import { collectTwitch } from './platforms/twitch.ts';
import type { CollectContext, Reading } from './platforms/types.ts';
import { collectYoutube } from './platforms/youtube.ts';
import { addDays, buildStats, dayOf, historyDays } from './series.ts';
import { getDb, readSnapshotRows, storeReading, type StoreSummary } from './store.ts';

/** Platforms with live numbers. Threads, TikTok, X, Facebook: see `platforms/threads.ts`. */
const COLLECTORS: [StatPlatformId, (context: CollectContext) => Promise<Reading>][] = [
	['youtube', collectYoutube],
	['github', collectGithub],
	['bluesky', collectBluesky],
	['twitch', collectTwitch],
	['instagram', collectInstagram]
];

const STEP: WorkflowStepConfig = { retries: { limit: 2, delay: '30 seconds', backoff: 'exponential' }, timeout: '2 minutes' };

const message = (error: unknown) => (error instanceof Error ? error.message : String(error));

export interface RunResult {
	day: string;
	platforms: Partial<Record<StatPlatformId, StoreSummary | { error: string }>>;
	snapshot: { written: true; platforms: StatPlatformId[] } | { written: false; reason: string };
}

export class StatsCollector extends WorkflowEntrypoint<Env> {
	async run(event: Readonly<WorkflowEvent<unknown>>, step: WorkflowStep): Promise<RunResult> {
		// The instance's start time (stable across replays) decides the UTC day all rows of this run belong to.
		const today = dayOf(event.timestamp);
		const days = historyDays(today);
		// A day early and as a bare day: compares correctly against any ISO timestamp format; `countPerDay` trims to the window.
		const since = addDays(days[0], -1);
		const result: RunResult = { day: today, platforms: {}, snapshot: { written: false, reason: 'not run' } };

		for (const [platform, collect] of COLLECTORS) {
			try {
				result.platforms[platform] = await step.do(`collect ${platform}`, STEP, async () => {
					const reading = await collect({ env: this.env, since });
					return storeReading(getDb(this.env), reading, today, days);
				});
			} catch (error) {
				console.error(`stats: ${platform} failed, keeping its last rows:`, message(error));
				result.platforms[platform] = { error: message(error) };
			}
		}

		result.snapshot = await step.do('snapshot', STEP, async () => {
			const rows = await readSnapshotRows(getDb(this.env), days[0], today);
			const parsed = v.safeParse(StatsSchema, buildStats(today, rows.metrics, rows.videos));
			if (!parsed.success) {
				const reason = JSON.stringify(v.flatten(parsed.issues)).slice(0, 500);
				console.error('stats: snapshot invalid, KV keeps the previous one:', reason);
				return { written: false as const, reason };
			}
			await this.env.KV.put(STATS_KV_KEY, JSON.stringify(parsed.output));
			return { written: true as const, platforms: parsed.output.platforms.map((platform) => platform.id) };
		});

		console.log('stats: run finished', JSON.stringify(result));
		return result;
	}
}
