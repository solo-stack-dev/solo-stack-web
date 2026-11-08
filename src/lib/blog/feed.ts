import { m } from '#lib/paraglide/messages.js';
import { localizeHref, type Locale } from '#lib/paraglide/runtime.js';
import { postHref } from './content.ts';
import type { Post } from './schema.ts';

/*
 * RSS 2.0 feed of one language (`/blog/rss.xml`, `/en/blog/rss.xml`), written by hand: the feed is tiny and a library
 * would only add a dependency. Built by src/routes/(site)/blog/rss.xml/+server.ts at prerender time.
 */

export const FEED_PATH = '/blog/rss.xml';

/** The feed of `locale` (`/blog/rss.xml`, `/en/blog/rss.xml`). */
export const feedHref = (locale: Locale) => localizeHref(FEED_PATH, { locale });

// XML 1.0 forbids most C0 controls, even escaped: drop them, so a stray one in frontmatter cannot break the feed.
// oxlint-disable-next-line no-control-regex
const INVALID_XML_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g;
const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };

/** Text and attribute values. */
export const escapeXml = (value: string) => value.replace(INVALID_XML_CHARS, '').replace(/[&<>"']/g, (char) => ENTITIES[char]);

/** `2026-11-01` → `Sun, 01 Nov 2026 00:00:00 GMT` (RFC 822 date as RSS wants it; UTC midnight, like `formatDate`). */
export const rfc822 = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`).toUTCString();

/** The posts of one feed (`published()` order, newest first): only those written in `locale`, no drafts (not even in dev). */
export const feedPosts = (posts: Post[], locale: Locale) => posts.filter((post) => post.lang === locale && !post.draft);

export function renderFeed({ posts, locale, origin, buildDate }: { posts: Post[]; locale: Locale; origin: string; buildDate: Date }) {
	const absolute = (path: string) => new URL(path, origin).href;
	const items = feedPosts(posts, locale);
	// Last change of the content (newest publish or update); an empty feed falls back to the build
	const lastChange = items
		.map((post) => post.updatedAt ?? post.publishedAt)
		.toSorted()
		.at(-1);
	const lastBuildDate = lastChange ? rfc822(lastChange) : buildDate.toUTCString();

	const channel = [
		`<title>${escapeXml(m.blog_meta_title({}, { locale }))}</title>`,
		`<link>${escapeXml(absolute(localizeHref('/blog', { locale })))}</link>`,
		`<description>${escapeXml(m.blog_meta_description({}, { locale }))}</description>`,
		`<language>${locale}</language>`,
		`<lastBuildDate>${lastBuildDate}</lastBuildDate>`,
		`<atom:link href="${escapeXml(absolute(feedHref(locale)))}" rel="self" type="application/rss+xml"/>`
	];

	const entries = items.flatMap((post) => {
		const link = escapeXml(absolute(postHref(post)));
		const fields = [
			`<title>${escapeXml(post.title)}</title>`,
			`<link>${link}</link>`,
			`<guid isPermaLink="true">${link}</guid>`,
			`<pubDate>${rfc822(post.publishedAt)}</pubDate>`,
			`<description>${escapeXml(post.description)}</description>`
		];
		return ['<item>', ...fields.map((field) => `\t${field}`), '</item>'];
	});

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
		'\t<channel>',
		...[...channel, ...entries].map((line) => `\t\t${line}`),
		'\t</channel>',
		'</rss>',
		''
	].join('\n');
}
