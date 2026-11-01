import { m } from '#lib/paraglide/messages.js';
import { deLocalizeHref, localizeHref } from '#lib/paraglide/runtime.js';

/** Top level pages in the site navigation. `path` is unlocalized; `/stats` is the public social media dashboard. */
export const SITE_LINKS = [
	{ id: 'home', path: '/', label: m.site_nav_home },
	{ id: 'blog', path: '/blog', label: m.site_nav_blog },
	{ id: 'stats', path: '/stats', label: m.site_nav_stats }
] as const;

export type SiteLink = (typeof SITE_LINKS)[number];

/** Localized href of a site link, in the current locale. */
export const siteHref = (link: SiteLink) => localizeHref(link.path);

/*
 * /stats is built on a parallel branch. Until its page exists, the link gets rel="external": the prerender crawler
 * skips it instead of failing the build on a 404 (same pattern as the legal links in the sunrise footer). Once
 * src/routes/(site)/stats/+page.svelte lands, the glob finds it and the link becomes a normal client side link.
 * Only the keys are read; the lazy importer is never called.
 */
const statsPage = import.meta.glob('/src/routes/(site)/stats/+page.svelte');
const STATS_EXISTS = Object.keys(statsPage).length > 0;

/** `rel` of a site link: "external" for a page that is not built yet. */
export const siteRel = (link: SiteLink) => (link.id === 'stats' && !STATS_EXISTS ? 'external' : undefined);

/**
 * `aria-current` for a site link on the current page: `page` on the exact page, `true` inside its section
 * (e.g. a blog post under Blog), otherwise undefined. `pathname` is the current (localized) URL path.
 */
export function siteCurrent(link: SiteLink, pathname: string): 'page' | 'true' | undefined {
	const path = deLocalizeHref(pathname).replace(/\/$/, '') || '/';
	if (path === link.path) return 'page';
	if (link.path !== '/' && path.startsWith(`${link.path}/`)) return 'true';
	return undefined;
}
