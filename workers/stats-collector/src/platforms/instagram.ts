/* oxlint-disable no-console -- server logs end up in Workers Logs (observability), the only place to see collector failures */
/**
 * Unified Login: read the configured Instagram account through graph.facebook.com with a system-user token. `/me` is the
 * system user, not the Instagram account. These tokens do not use Instagram Login's refresh endpoint or rotating KV token.
 * Legacy Instagram Login (no INSTAGRAM_ACCOUNT_ID): graph.instagram.com/me and a 60-day token, refreshed weekly in KV.
 */
import { count, fetchJson } from '../http.ts';
import { INSTAGRAM_TOKEN_KEY, readToken, sha256, writeToken, type InstagramToken } from '../tokens.ts';
import type { CollectContext, Reading } from './types.ts';

const INSTAGRAM_API = 'https://graph.instagram.com';
const UNIFIED_API = 'https://graph.facebook.com/v27.0';
const REFRESH_AFTER_MS = 7 * 86_400_000;
/** Media pages read per run (100 each). */
const MAX_PAGES = 10;

interface MediaPage {
	data: { id: string; timestamp: string }[];
	paging?: { next?: string };
}

/** Graph timestamps look like `2026-11-02T18:04:11+0000`; normalize to ISO `…Z`. */
export const isoTimestamp = (value: string) => new Date(value.replace(/([+-]\d{2})(\d{2})$/, '$1:$2')).toISOString();

/** Legacy Instagram Login only: the KV token, refreshed when due and replaced when the secret changes. */
async function currentLegacyToken(env: Env): Promise<string> {
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
		const next = await fetchJson<{ access_token: string; expires_in: number }>('instagram refresh', `${INSTAGRAM_API}/refresh_access_token?${params}`);
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
	if (!env.INSTAGRAM_ACCESS_TOKEN) throw new Error('instagram: INSTAGRAM_ACCESS_TOKEN is not set');
	const accountId = env.INSTAGRAM_ACCOUNT_ID?.trim();
	if (accountId && !/^\d+$/.test(accountId)) throw new Error('instagram: INSTAGRAM_ACCOUNT_ID must be a numeric Instagram account ID');
	const accountUrl = accountId ? `${UNIFIED_API}/${accountId}` : `${INSTAGRAM_API}/me`;
	const token = accountId ? env.INSTAGRAM_ACCESS_TOKEN : await currentLegacyToken(env);
	const init: RequestInit = { headers: { authorization: `Bearer ${token}` } };
	const profile = await fetchJson<{ followers_count: number }>('instagram profile', `${accountUrl}?${new URLSearchParams({ fields: 'followers_count' })}`, init);

	const posts: string[] = [];
	let next: string | undefined = `${accountUrl}/media?${new URLSearchParams({ fields: 'timestamp', limit: '100' })}`;
	for (let page = 0; next && page < MAX_PAGES; page++) {
		// Pagination can include the token in its URL; use the header and keep credentials on the selected API host.
		const pageUrl = new URL(next);
		if (pageUrl.origin !== new URL(accountUrl).origin) throw new Error('instagram: unexpected pagination host');
		pageUrl.searchParams.delete('access_token');
		const media: MediaPage = await fetchJson<MediaPage>('instagram media', pageUrl, init);
		const timestamps = media.data.map((item) => isoTimestamp(item.timestamp));
		posts.push(...timestamps.filter((timestamp) => timestamp >= since));
		// Newest first: stop once a page reaches before the window.
		next = timestamps.some((timestamp) => timestamp < since) ? undefined : media.paging?.next;
	}

	return { platform: 'instagram', followers: count('instagram followers', profile.followers_count), posts };
}
