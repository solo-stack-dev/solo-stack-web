/**
 * Twitch Helix: follower total via `GET /helix/channels/followers`, which needs a user access token. The token pair comes from
 * the one-time login (`pnpm stats:twitch-login`, stored in KV); the collector validates it every run (Twitch requires that for
 * OAuth sessions), refreshes it when it is invalid or about to expire, and writes the rotated pair back to KV.
 */
import { SOCIALS } from '#lib/home/data/socials.ts';
import { count, fetchJson, HttpError } from '../http.ts';
import { readToken, TWITCH_TOKEN_KEY, writeToken, type TwitchToken } from '../tokens.ts';
import type { CollectContext, Reading } from './types.ts';

const ID = 'https://id.twitch.tv/oauth2';
const HELIX = 'https://api.twitch.tv/helix';
/** Channel login from socials.ts; its broadcaster id is looked up every run. */
export const TWITCH_LOGIN = SOCIALS.find((social) => social.id === 'twitch')!.handle!;

export interface TwitchTokenResponse {
	access_token: string;
	refresh_token: string;
	expires_in: number;
}

export const tokenFromResponse = (response: TwitchTokenResponse, now = Date.now()): TwitchToken => ({
	accessToken: response.access_token,
	refreshToken: response.refresh_token,
	expiresAt: new Date(now + response.expires_in * 1000).toISOString()
});

async function refresh(env: Env, token: TwitchToken): Promise<TwitchToken> {
	const body = new URLSearchParams({
		grant_type: 'refresh_token',
		refresh_token: token.refreshToken,
		client_id: env.TWITCH_CLIENT_ID,
		client_secret: env.TWITCH_CLIENT_SECRET
	});
	const next = tokenFromResponse(await fetchJson<TwitchTokenResponse>('twitch refresh', `${ID}/token`, { method: 'POST', body }));
	await writeToken(env.KV, TWITCH_TOKEN_KEY, next);
	return next;
}

/** A valid access token: validated, refreshed when invalid or expiring within 15 minutes. */
async function accessToken(env: Env): Promise<TwitchToken> {
	const token = await readToken<TwitchToken>(env.KV, TWITCH_TOKEN_KEY);
	if (!token) throw new Error(`twitch: no token in KV (${TWITCH_TOKEN_KEY}), run \`pnpm stats:twitch-login\``);
	try {
		const valid = await fetchJson<{ expires_in: number }>('twitch validate', `${ID}/validate`, { headers: { authorization: `OAuth ${token.accessToken}` } });
		if (valid.expires_in > 15 * 60) return token;
	} catch (error) {
		if (!(error instanceof HttpError && error.status === 401)) throw error;
	}
	return refresh(env, token);
}

export async function collectTwitch({ env }: CollectContext): Promise<Reading> {
	if (!env.TWITCH_CLIENT_ID || !env.TWITCH_CLIENT_SECRET) throw new Error('twitch: TWITCH_CLIENT_ID/TWITCH_CLIENT_SECRET are not set');
	const token = await accessToken(env);
	const headers = { authorization: `Bearer ${token.accessToken}`, 'client-id': env.TWITCH_CLIENT_ID };

	const users = await fetchJson<{ data: { id: string }[] }>('twitch users', `${HELIX}/users?login=${encodeURIComponent(TWITCH_LOGIN)}`, { headers });
	const broadcaster = users.data[0]?.id;
	if (!broadcaster) throw new Error(`twitch: user ${TWITCH_LOGIN} not found`);
	// Without moderator rights only `total` is returned, which is all the page needs.
	const followers = await fetchJson<{ total: number }>('twitch followers', `${HELIX}/channels/followers?broadcaster_id=${broadcaster}&first=1`, { headers });
	return { platform: 'twitch', followers: count('twitch followers', followers.total) };
}
