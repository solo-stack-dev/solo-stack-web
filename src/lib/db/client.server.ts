/**
 * Drizzle client for D1 `DB` (docs/ARCHITECTURE.md#database), server only: `getDb().select().from(dailyMetrics)…`
 * Works in requests and `scheduled` handlers: bindings come from `cloudflare:workers` (SvelteKit 3 has no `platform.env`;
 * `pnpm dev` emulates it via the adapter). Pass an env only to override it, e.g. in tests.
 */
import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';

export function getDb(bindings: Pick<Env, 'DB'> = env) {
	return drizzle(bindings.DB);
}

export type Db = ReturnType<typeof getDb>;
