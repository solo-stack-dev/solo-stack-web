import { building, dev } from '$app/env';
import { error } from '@sveltejs/kit';
import { VIDEO_ID_PATTERN } from '#lib/home/sections/cinema/thumbnail.ts';
import { fetchVideoThumbnail } from '#lib/home/sections/cinema/thumbnail.server.ts';
import type { RequestHandler } from './$types';

// Self-hosted thumbnail of the latest video for the 04:00 cinema facade (see src/lib/home/sections/cinema/thumbnail.ts).
// Prerendered when the crawler meets the facade's <img src>. 'auto' instead of `true`: with an empty feed there is
// no <img> to crawl, and an unseen `true` route would fail the build.
export const prerender = 'auto';

export const GET: RequestHandler = async ({ params }) => {
	// Only the prerendered copies are served in production; the Worker never proxies arbitrary thumbnails.
	if (!building && !dev) error(404);
	if (!VIDEO_ID_PATTERN.test(params.id)) error(404);
	return new Response(await fetchVideoThumbnail(params.id), {
		headers: { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=86400' }
	});
};
