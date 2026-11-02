/**
 * Drizzle client for the D1 binding `DB` (docs/ARCHITECTURE.md#database). Server only.
 *
 * Usage inside a remote function or other request code:
 *   const db = getDb();
 *   const rows = await db.select().from(dailyMetrics).where(eq(dailyMetrics.metric, 'followers'));
 * Works in requests and in `scheduled` handlers alike: bindings come from `cloudflare:workers` (SvelteKit 3 has no
 * `platform.env`; `pnpm dev` emulates the module via the adapter). Pass an env only to override it, e.g. in tests.
 */
import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';

export function getDb(bindings: Pick<Env, 'DB'> = env) {
	return drizzle(bindings.DB);
}

export type Db = ReturnType<typeof getDb>;
