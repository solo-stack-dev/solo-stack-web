/**
 * Drizzle client for the D1 binding `DB` (docs/ARCHITECTURE.md#database). Server only.
 *
 * Usage inside a remote function or other request code:
 *   const db = getDb();
 *   const rows = await db.select().from(dailyMetrics).where(eq(dailyMetrics.metric, 'followers'));
 * Outside a request (e.g. a `scheduled` handler) pass the Worker env: `getDb(env)`.
 */
import { getRequestEvent } from '$app/server';
import { drizzle } from 'drizzle-orm/d1';

export function getDb(env: Env = requestEnv()) {
	return drizzle(env.DB);
}

export type Db = ReturnType<typeof getDb>;

function requestEnv(): Env {
	const env = getRequestEvent().platform?.env;
	if (!env) throw new Error('No Cloudflare platform env: run inside the Worker (`pnpm dev` emulates it via the adapter).');
	return env;
}
