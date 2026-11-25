/**
 * Hand-entered follower counts for platforms without an API collector (no credentials, or the account is down). The owner
 * tells an agent the new count, the agent edits it here, and the next collector deploy ships it (`production:deploy` includes
 * it). Every run stores the value as today's reading, like any collector, so a changed count builds real history (sparkline,
 * change). Remove an entry once that platform gets a real collector in `workflow.ts`.
 */
import type { StatPlatformId } from '#lib/stats/schema.ts';
import type { Reading } from './types.ts';

/** Last updated by the owner: 2026-11-25. */
export const MANUAL_FOLLOWERS: Partial<Record<StatPlatformId, number>> = {
	instagram: 4,
	tiktok: 5,
	x: 0,
	facebook: 0,
	discord: 1
};

export const collectManual = (platform: StatPlatformId, followers: number) => async (): Promise<Reading> => ({ platform, followers });
