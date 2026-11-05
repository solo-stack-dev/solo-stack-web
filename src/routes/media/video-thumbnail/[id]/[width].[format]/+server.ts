import { building, dev } from '$app/env';
import { error } from '@sveltejs/kit';
import { THUMBNAIL_FORMATS, THUMBNAIL_WIDTHS, VIDEO_ID_PATTERN, type ThumbnailFormat } from '#lib/home/sections/cinema/thumbnail.ts';
import { renderVideoThumbnail } from '#lib/home/sections/cinema/thumbnail.server.ts';
import type { RequestHandler } from './$types';

// Self-hosted 16:9 thumbnails (src/lib/home/sections/cinema/thumbnail.ts), prerendered when the crawler meets one in a
// `srcset`, `<img src>` or `og:image`. 'auto', not `true`: with no videos nothing is crawled and a `true` route would fail the build.
export const prerender = 'auto';

const CONTENT_TYPES: Record<ThumbnailFormat, string> = { avif: 'image/avif', webp: 'image/webp', jpg: 'image/jpeg' };

const isFormat = (format: string): format is ThumbnailFormat => (THUMBNAIL_FORMATS as readonly string[]).includes(format);

export const GET: RequestHandler = async ({ params }) => {
	// Production serves only prerendered copies; the Worker never proxies or encodes thumbnails.
	if (!building && !dev) error(404);
	const width = Number(params.width);
	const { format } = params;
	if (!VIDEO_ID_PATTERN.test(params.id) || !(THUMBNAIL_WIDTHS as readonly number[]).includes(width) || !isFormat(format)) error(404);
	return new Response(await renderVideoThumbnail(params.id, width, format), {
		headers: { 'content-type': CONTENT_TYPES[format], 'cache-control': 'public, max-age=86400' }
	});
};
