/**
 * OAuth tokens that rotate. A Worker cannot update its own secrets, so the current token lives in KV and the collector rewrites
 * it after every refresh. Keys are per environment (each environment has its own KV namespace).
 */
export const TWITCH_TOKEN_KEY = 'stats:twitch-token';
export const INSTAGRAM_TOKEN_KEY = 'stats:instagram-token';

/** Twitch user token from the authorization-code flow (`pnpm stats:twitch-login`). */
export interface TwitchToken {
	accessToken: string;
	refreshToken: string;
	/** ISO timestamp. */
	expiresAt: string;
}

/** Instagram long-lived user token (60 days), seeded from the `INSTAGRAM_ACCESS_TOKEN` secret. */
export interface InstagramToken {
	token: string;
	/** ISO timestamp of the last successful refresh; `null` = seeded from the secret, age unknown. */
	refreshedAt: string | null;
	/** ISO timestamp, when known. */
	expiresAt: string | null;
	/** SHA-256 of the secret this token was seeded from: a new secret (re-issued token) replaces the KV copy. */
	seed: string;
}

export const readToken = <T>(kv: KVNamespace, key: string) => kv.get<T>(key, { type: 'json' });

export const writeToken = (kv: KVNamespace, key: string, token: TwitchToken | InstagramToken) => kv.put(key, JSON.stringify(token));

export async function sha256(value: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
	return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
