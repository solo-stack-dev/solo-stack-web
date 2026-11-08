/* oxlint-disable no-console -- server logs end up in Workers Logs (observability), the only place to see collector failures */
/**
 * Instagram API with Instagram Login (creator account, `instagram_business_basic`): followers and media timestamps from
 * graph.instagram.com. The long-lived token lasts 60 days; the collector refreshes it weekly (`refresh_access_token`, only
 * allowed once a token is 24 hours old) and keeps the current one in KV, seeded from the `INSTAGRAM_ACCESS_TOKEN` secret.
 */
import { count, fetchJson } from '../http.ts';
import { INSTAGRAM_TOKEN_KEY, readToken, sha256, writeToken, type InstagramToken } from '../tokens.ts';
import type { CollectContext, Reading } from './types.ts';

const API = 'https://graph.instagram.com';
const REFRESH_AFTER_MS = 7 * 86_400_000;
/** Media pages read per run (100 each). */
const MAX_PAGES = 10;

interface MediaPage {
	data: { id: string; timestamp: string }[];
	paging?: { next?: string };
}

/** Graph timestamps look like `2026-11-02T18:04:11+0000`; normalize to ISO `…Z`. */
export const isoTimestamp = (value: string) => new Date(value.replace(/([+-]\d{2})(\d{2})$/, '$1:$2')).toISOString();

/** The current token: the KV copy, or the secret when KV is empty or the secret changed; refreshed when due. */
async function currentToken(env: Env): Promise<string> {
	const secret = env.INSTAGRAM_ACCESS_TOKEN;
	if (!secret) throw new Error('instagram: INSTAGRAM_ACCESS_TOKEN is not set');
	const seed = await sha256(secret);
	let token = await readToken<InstagramToken>(env.KV, INSTAGRAM_TOKEN_KEY);
	if (!token || token.seed !== seed) {
		token = { token: secret, refreshedAt: null, expiresAt: null, seed };
		await writeToken(env.KV, INSTAGRAM_TOKEN_KEY, token);
	}
	if (token.refreshedAt && Date.now() - Date.parse(token.refreshedAt) < REFRESH_AFTER_MS) return token.token;
	try {
		const params = new URLSearchParams({ grant_type: 'ig_refresh_token', access_token: token.token });
		const next = await fetchJson<{ access_token: string; expires_in: number }>('instagram refresh', `${API}/refresh_access_token?${params}`);
		const now = Date.now();
		token = { ...token, token: next.access_token, refreshedAt: new Date(now).toISOString(), expiresAt: new Date(now + next.expires_in * 1000).toISOString() };
		await writeToken(env.KV, INSTAGRAM_TOKEN_KEY, token);
	} catch (error) {
		// Too young (< 24 h) or a hiccup: the token still works, try again next run.
		console.warn('instagram: token refresh failed, keeping the current token:', error instanceof Error ? error.message : error);
	}
	return token.token;
}

export async function collectInstagram({ env, since }: CollectContext): Promise<Reading> {
	const token = await currentToken(env);
	const profile = await fetchJson<{ followers_count: number }>(
		'instagram profile',
		`${API}/me?${new URLSearchParams({ fields: 'followers_count', access_token: token })}`
	);

	const posts: string[] = [];
	let next: string | undefined = `${API}/me/media?${new URLSearchParams({ fields: 'timestamp', limit: '100', access_token: token })}`;
	for (let page = 0; next && page < MAX_PAGES; page++) {
		const media: MediaPage = await fetchJson<MediaPage>('instagram media', next);
		const timestamps = media.data.map((item) => isoTimestamp(item.timestamp));
		posts.push(...timestamps.filter((timestamp) => timestamp >= since));
		// Newest first: stop once a page reaches before the window.
		next = timestamps.some((timestamp) => timestamp < since) ? undefined : media.paging?.next;
	}

	return { platform: 'instagram', followers: count('instagram followers', profile.followers_count), posts };
}
