import type { default as Sharp } from 'sharp';
import { THUMBNAIL_CANDIDATES, VIDEO_ID_PATTERN, type ThumbnailFormat } from './thumbnail.ts';

/** Dark 16×9 JPEG (#18191b) served when YouTube has no thumbnail or is unreachable, so a build never fails on it. */
const EMPTY_JPEG = Uint8Array.from(
	atob(
		'/9j/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAJABADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AIAAh//Z'
	),
	(char) => char.charCodeAt(0)
);

/** Best available thumbnail JPEG from YouTube's image CDN (build time only), or EMPTY_JPEG. */
export async function fetchVideoThumbnail(id: string): Promise<Uint8Array<ArrayBuffer>> {
	if (!VIDEO_ID_PATTERN.test(id)) return EMPTY_JPEG;
	for (const name of THUMBNAIL_CANDIDATES) {
		try {
			const response = await fetch(`https://i.ytimg.com/vi/${id}/${name}.jpg`, { signal: AbortSignal.timeout(8000) });
			if (response.ok && response.headers.get('content-type')?.startsWith('image/jpeg')) return new Uint8Array(await response.arrayBuffer());
		} catch {
			// try the next size
		}
	}
	return EMPTY_JPEG;
}

// One download per video per build, shared by all of its variants
const originals = new Map<string, Promise<Uint8Array<ArrayBuffer>>>();

// sharp is a native Node module: it only runs in the prerender step (Node) and in `vite dev`, never in the Worker.
// The specifier is a variable so neither Vite nor wrangler's bundler pulls it into the Worker bundle.
const SHARP_MODULE = 'sharp';

/** `id`'s thumbnail cropped to 16:9 (removes the letterbox bars of the 4:3 fallbacks) at `width`, encoded as `format`. */
export async function renderVideoThumbnail(id: string, width: number, format: ThumbnailFormat): Promise<Uint8Array<ArrayBuffer>> {
	let original = originals.get(id);
	if (!original) originals.set(id, (original = fetchVideoThumbnail(id)));

	const { default: sharp } = (await import(/* @vite-ignore */ SHARP_MODULE)) as { default: typeof Sharp };
	const image = sharp(await original).resize({ width, height: Math.round((width * 9) / 16), fit: 'cover' });
	const encoded = format === 'avif' ? image.avif({ quality: 50 }) : format === 'webp' ? image.webp({ quality: 75 }) : image.jpeg({ quality: 80, mozjpeg: true });
	return new Uint8Array(await encoded.toBuffer());
}
