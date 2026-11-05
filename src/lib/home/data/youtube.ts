import * as v from 'valibot';
import { YOUTUBE_CHANNEL_ID } from './socials.ts';

export const YOUTUBE_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

export const LatestVideoSchema = v.object({
	id: v.pipe(v.string(), v.regex(/^[\w-]{11}$/)),
	title: v.pipe(v.string(), v.trim(), v.nonEmpty()),
	url: v.pipe(v.string(), v.url()),
	publishedAt: v.pipe(v.string(), v.isoTimestamp()),
	/** Thumbnail from the feed (480×360). Higher resolutions: `https://i.ytimg.com/vi/<id>/maxresdefault.jpg` (may not exist). */
	thumbnail: v.pipe(v.string(), v.url())
});

export type LatestVideo = v.InferOutput<typeof LatestVideoSchema>;

/** No video: the UI links to YOUTUBE_CHANNEL_URL (socials.ts) instead. Never invent a video here. */
export const FALLBACK_VIDEO: LatestVideo | null = null;

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

export function decodeXml(text: string): string {
	return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
		if (entity[0] === '#') {
			const code = entity[1] === 'x' || entity[1] === 'X' ? Number.parseInt(entity.slice(2), 16) : Number.parseInt(entity.slice(1), 10);
			return Number.isFinite(code) ? String.fromCodePoint(code) : match;
		}
		return ENTITIES[entity.toLowerCase()] ?? match;
	});
}

const tag = (xml: string, name: string) => xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`))?.[1];
const attribute = (xml: string, name: string, attr: string) => xml.match(new RegExp(`<${name}\\s[^>]*?${attr}="([^"]*)"`))?.[1];

/** Parse the newest `<entry>` of a YouTube channel Atom feed. Small and DOM-free (runs on Workers and at build time). */
export function parseLatestVideo(xml: string): unknown {
	const entry = tag(xml, 'entry');
	if (!entry) return null;
	const id = tag(entry, 'yt:videoId')?.trim();
	return {
		id,
		title: decodeXml(tag(entry, 'title') ?? ''),
		url: decodeXml(attribute(entry, 'link', 'href') ?? `https://www.youtube.com/watch?v=${id}`),
		publishedAt: tag(entry, 'published')?.trim(),
		thumbnail: decodeXml(attribute(entry, 'media:thumbnail', 'url') ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`)
	};
}
