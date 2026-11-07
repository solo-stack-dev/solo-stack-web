import * as sitemap from 'super-sitemap/sveltekit';
import { published } from '#lib/blog/posts.server.ts';
import { baseLocale, locales, localizeHref, type Locale } from '#lib/paraglide/runtime.js';
import type { RequestHandler } from './$types';

/*
 * /sitemap.xml, prerendered (rebuilt with every deploy, like the posts). super-sitemap discovers the page routes itself;
 * new pages appear automatically, and a new parameterized route fails the build until it gets `paramValues` or an exclusion.
 *
 * Locales: routes carry no `[[locale]]` param (Paraglide's `reroute` strips `/en`), so super-sitemap's own `locales`
 * option does not apply. `processPaths` localizes instead, mirroring the page heads:
 * - pages that exist in every locale: one entry per locale, each with hreflang alternates + x-default (= the root layout)
 * - blog posts: each language version under its own URL, alternates only between its translations (= the post page's head)
 * - legal texts: German only (= LegalPage's canonical)
 */

export const prerender = true;

const GERMAN_ONLY = new Set(['/impressum', '/datenschutz']);

const localized = (path: string, locale: Locale) => localizeHref(path, { locale });

export const GET: RequestHandler = async ({ url }) => {
	const posts = published();
	const postByPath = new Map(posts.map((post) => [`/blog/${post.slug}`, post]));

	return sitemap.response({
		origin: url.origin,
		paramValues: {
			'/blog/[slug]': posts.map((post) => ({ values: [post.slug], lastmod: post.updatedAt ?? post.publishedAt }))
		},
		processPaths: (paths) =>
			paths.flatMap((entry) => {
				if (GERMAN_ONLY.has(entry.path)) return [{ ...entry, path: localized(entry.path, baseLocale) }];
				const post = postByPath.get(entry.path);
				if (post) {
					const path = localized(entry.path, post.lang);
					if (!post.translations.length) return [{ ...entry, path }];
					const versions = [post, ...post.translations].map((version) => ({ hreflang: version.lang, path: localized(`/blog/${version.slug}`, version.lang) }));
					const fallback = versions.find((version) => version.hreflang === baseLocale) ?? versions[0];
					return [{ ...entry, path, alternates: [...versions, { hreflang: 'x-default', path: fallback.path }] }];
				}
				const alternates = [
					...locales.map((locale) => ({ hreflang: locale, path: localized(entry.path, locale) })),
					{ hreflang: 'x-default', path: localized(entry.path, baseLocale) }
				];
				return locales.map((locale) => ({ ...entry, path: localized(entry.path, locale), alternates }));
			}),
		sort: 'alpha'
	});
};
