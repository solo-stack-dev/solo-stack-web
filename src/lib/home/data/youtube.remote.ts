import { prerender } from '$app/server';
import * as v from 'valibot';
import { FALLBACK_VIDEO, LatestVideoSchema, YOUTUBE_FEED_URL, parseLatestVideo, type LatestVideo } from './youtube.ts';

/**
 * Latest video of the channel, from the public channel RSS (no API key). Prerendered: refreshed on every build
 * (e.g. a scheduled rebuild). Any error or an empty feed returns `FALLBACK_VIDEO` (`null`), the build never fails.
 *
 * ```svelte
 * {#if await getLatestVideo()}…{/if}
 * ```
 */
export const getLatestVideo = prerender(async (): Promise<LatestVideo | null> => {
	try {
		const response = await fetch(YOUTUBE_FEED_URL, { signal: AbortSignal.timeout(8000) });
		if (!response.ok) return FALLBACK_VIDEO;
		const parsed = v.safeParse(v.nullable(LatestVideoSchema), parseLatestVideo(await response.text()));
		return parsed.success ? (parsed.output ?? FALLBACK_VIDEO) : FALLBACK_VIDEO;
	} catch {
		return FALLBACK_VIDEO;
	}
});
