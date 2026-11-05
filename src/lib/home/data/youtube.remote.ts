import { prerender } from '$app/server';
import * as v from 'valibot';
import { FALLBACK_VIDEO, LatestVideoSchema, YOUTUBE_FEED_URL, parseLatestVideo, type LatestVideo } from './youtube.ts';

/**
 * Latest video from the public channel RSS (no API key). Prerendered, so refreshed per build (e.g. scheduled rebuild).
 * Errors or an empty feed return `FALLBACK_VIDEO` (`null`); the build never fails.
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
