/* oxlint-disable no-console -- server logs end up in Workers Logs (observability), the only place to see collector failures */
/**
 * Threads API (graph.threads.net): followers via `/me/threads_insights?metric=followers_count` (`threads_manage_insights`),
 * posts via `/me/threads` (`threads_basic`, newest first, paged). The long-lived token (60 days) is seeded from the
 * `THREADS_ACCESS_TOKEN` secret into KV (`stats:threads-token`) and refreshed there weekly, like Instagram Login's token.
 */
import { count, fetchJson } from '../http.ts';
import { readToken, sha256, THREADS_TOKEN_KEY, writeToken, type InstagramToken } from '../tokens.ts';
import { isoTimestamp } from './instagram.ts';
import type { CollectContext, Reading } from './types.ts';

const API = 'https://graph.threads.net';
const REFRESH_AFTER_MS = 7 * 86_400_000;
/** Post pages read per run (100 each). */
const MAX_PAGES = 10;

interface ThreadsPage {
	data: { id: string; timestamp: string }[];
	paging?: { next?: string };
}

interface Insights {
	data: { name: string; total_value?: { value: number } }[];
}

/** The KV token, refreshed when due and replaced when the secret changes (re-issued token). */
async function currentToken(env: Env): Promise<string> {
	const secret = env.THREADS_ACCESS_TOKEN;
	if (!secret) throw new Error('threads: THREADS_ACCESS_TOKEN is not set');
	const seed = await sha256(secret);
	let token = await readToken<InstagramToken>(env.KV, THREADS_TOKEN_KEY);
	if (!token || token.seed !== seed) {
		token = { token: secret, refreshedAt: null, expiresAt: null, seed };
		await writeToken(env.KV, THREADS_TOKEN_KEY, token);
	}
	if (token.refreshedAt && Date.now() - Date.parse(token.refreshedAt) < REFRESH_AFTER_MS) return token.token;
	try {
		const params = new URLSearchParams({ grant_type: 'th_refresh_token', access_token: token.token });
		const next = await fetchJson<{ access_token: string; expires_in: number }>('threads refresh', `${API}/refresh_access_token?${params}`);
		const now = Date.now();
		token = { ...token, token: next.access_token, refreshedAt: new Date(now).toISOString(), expiresAt: new Date(now + next.expires_in * 1000).toISOString() };
		await writeToken(env.KV, THREADS_TOKEN_KEY, token);
	} catch (error) {
		// Too young (< 24 h) or a hiccup: the token still works, try again next run.
		console.warn('threads: token refresh failed, keeping the current token:', error instanceof Error ? error.message : error);
	}
	return token.token;
}

export async function collectThreads({ env, since }: CollectContext): Promise<Reading> {
	const token = await currentToken(env);
	const init: RequestInit = { headers: { authorization: `Bearer ${token}` } };

	const insights = await fetchJson<Insights>('threads insights', `${API}/v1.0/me/threads_insights?${new URLSearchParams({ metric: 'followers_count' })}`, init);
	const followers = insights.data.find((metric) => metric.name === 'followers_count')?.total_value?.value;

	const posts: string[] = [];
	let next: string | undefined = `${API}/v1.0/me/threads?${new URLSearchParams({ fields: 'timestamp', limit: '100' })}`;
	for (let page = 0; next && page < MAX_PAGES; page++) {
		// Paging URLs can carry the token: send it as a header only, and only to the Threads host.
		const pageUrl = new URL(next);
		if (pageUrl.origin !== API) throw new Error('threads: unexpected pagination host');
		pageUrl.searchParams.delete('access_token');
		const result: ThreadsPage = await fetchJson<ThreadsPage>('threads posts', pageUrl, init);
		const timestamps = result.data.map((item) => isoTimestamp(item.timestamp));
		posts.push(...timestamps.filter((timestamp) => timestamp >= since));
		next = timestamps.some((timestamp) => timestamp < since) ? undefined : result.paging?.next;
	}

	return { platform: 'threads', followers: count('threads followers', followers), posts };
}
