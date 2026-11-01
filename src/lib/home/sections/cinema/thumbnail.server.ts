import { THUMBNAIL_CANDIDATES, VIDEO_ID_PATTERN } from './thumbnail.ts';

/** Dark 16×9 JPEG (#18191b) served when YouTube has no thumbnail or is unreachable, so a build never fails on it. */
const EMPTY_JPEG = Uint8Array.from(
	atob(
		'/9j/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAJABADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AIAAh//Z'
	),
	(char) => char.charCodeAt(0)
);

/**
 * Fetch the best available thumbnail of a video from YouTube's image CDN (server side, at build time only).
 * Returns the JPEG bytes, or a dark placeholder JPEG if none is available.
 */
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
