/** Bluesky public AppView, no key: followers (`getProfile`) and own posts without replies or reposts (`getAuthorFeed`). */
import { count, fetchJson } from '../http.ts';
import type { CollectContext, Reading } from './types.ts';

export const BLUESKY_ACTOR = 'solo-stack.bsky.social';
const API = 'https://public.api.bsky.app/xrpc';
/** Feed pages read per run (100 posts each). */
const MAX_PAGES = 10;

interface FeedPage {
	feed: { post: { uri: string; author: { did: string }; record: { createdAt?: string }; indexedAt: string }; reason?: unknown }[];
	cursor?: string;
}

export async function collectBluesky({ since }: CollectContext): Promise<Reading> {
	const profile = await fetchJson<{ did: string; followersCount: number }>('bluesky profile', `${API}/app.bsky.actor.getProfile?actor=${BLUESKY_ACTOR}`);

	const posts = new Map<string, string>();
	let cursor: string | undefined;
	for (let page = 0; page < MAX_PAGES; page++) {
		const params = new URLSearchParams({ actor: profile.did, filter: 'posts_no_replies', limit: '100', ...(cursor && { cursor }) });
		const feed = await fetchJson<FeedPage>('bluesky feed', `${API}/app.bsky.feed.getAuthorFeed?${params}`);
		let older = false;
		for (const item of feed.feed) {
			// Reposts carry a `reason` (and someone else's post); pinned posts may repeat an old post at the top.
			if (item.reason || item.post.author.did !== profile.did) continue;
			const createdAt = item.post.record.createdAt ?? item.post.indexedAt;
			if (createdAt >= since) posts.set(item.post.uri, createdAt);
			else older = true;
		}
		cursor = feed.cursor;
		if (older || !cursor || !feed.feed.length) break;
	}

	return { platform: 'bluesky', followers: count('bluesky followers', profile.followersCount), posts: [...posts.values()] };
}
