import { getPosts } from '#lib/blog/posts.remote.ts';
import { baseLocale, extractLocaleFromUrl, localizeHref, type Locale } from '#lib/paraglide/runtime.js';

/**
 * Language dropdown of the navbar (LocaleSwitch → LocaleMenu). The URL is the only locale source, so every option is a plain
 * link to the other URL, with `data-sveltekit-reload`: changing the locale is a full document load (as Paraglide's
 * `setLocale` does), because messages are not reactive and `/blog` and `/en/blog` are one route component.
 */

/** Trigger look, styled by SiteNav (the placeholder and the real bits-ui trigger share it). */
export const LOCALE_TRIGGER = 'locale-trigger';

/** Posts have their own slug per language (`translationOf`), so the plain prefix swap would point at the wrong post. */
export const POST_ROUTE = '/(site)/blog/[slug]';

export type Version = { slug: string; lang: Locale };

export const localeOf = (url: { href: string }) => extractLocaleFromUrl(url.href) ?? baseLocale;

/** A language in its own language: "Deutsch", "English" (CLDR data, not site copy). */
export const languageName = (locale: Locale) => {
	const name = new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale;
	return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
};

/** The post and its translations, from the (prerendered, cached) index; empty for an unknown slug. */
export async function postVersions(slug: string): Promise<Version[]> {
	const post = (await getPosts()).find((candidate) => candidate.slug === slug);
	return post ? [post, ...post.translations] : [];
}

/**
 * The current page in `locale`. On a post: its translation, or that language's blog index when it has none.
 * `versions` is `undefined` everywhere but on post pages.
 */
export function localeHref(locale: Locale, pathname: string, versions?: Version[]) {
	if (!versions) return localizeHref(pathname, { locale });
	const version = versions.find((candidate) => candidate.lang === locale);
	return version ? localizeHref(`/blog/${version.slug}`, { locale }) : localizeHref('/blog', { locale });
}
