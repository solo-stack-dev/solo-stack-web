import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';
import { m } from '#lib/paraglide/messages.js';
import { getLocale, localizeHref, type Locale } from '#lib/paraglide/runtime.js';
import type { Post, PostFormat } from './schema.ts';

/** Rendered post bodies, one lazy chunk each. */
const bodies = import.meta.glob<{ default: Component }>('/src/content/blog/*.md');

/** Unknown slugs 404 like `getPost`, which this races in `Promise.all`. */
export async function loadPostBody(slug: string): Promise<Component> {
	const load = bodies[`/src/content/blog/${slug}.md`];
	if (!load) error(404);
	return (await load()).default;
}

export const FORMAT_LABELS: Record<PostFormat, () => string> = {
	project: m.blog_format_project,
	'ai-test': m.blog_format_ai_test,
	'ai-news': m.blog_format_ai_news,
	business: m.blog_format_business
};

/** Uses the post's own `lang`, so the link never points to a missing translation. */
export const postHref = (post: { slug: string; lang: Locale }) => localizeHref(`/blog/${post.slug}`, { locale: post.lang });

/**
 * The posts a visitor of `locale` sees: every post in that language, plus posts that have no version in it.
 * Translations of one video never show twice.
 */
export const postsFor = <P extends Pick<Post, 'lang' | 'translations'>>(posts: P[], locale: Locale) =>
	posts.filter((post) => post.lang === locale || !post.translations.some((translation) => translation.lang === locale));

/** `2026-11-01` → "1. November 2026", in UTC so build and browser agree. */
export function formatDate(isoDate: string, locale: string = getLocale()) {
	return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${isoDate}T00:00:00Z`));
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Seconds → `4:05` or `1:02:05`, as YouTube shows timestamps. */
export function formatTimestamp(seconds: number) {
	const h = Math.floor(seconds / 3600);
	const min = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);
	return h ? `${h}:${pad(min)}:${pad(s)}` : `${min}:${pad(s)}`;
}

/** Seconds → ISO 8601 duration (`PT1H2M5S`) for JSON-LD. */
export function isoDuration(seconds: number) {
	const h = Math.floor(seconds / 3600);
	const min = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);
	return `PT${h ? `${h}H` : ''}${min ? `${min}M` : ''}${s || (!h && !min) ? `${s}S` : ''}`;
}

/** JSON-LD tag for `{@html}`; `<` is escaped, so no `</script>` breakout. */
export const jsonLdScript = (data: unknown) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
