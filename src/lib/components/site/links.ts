import { m } from '#lib/paraglide/messages.js';
import { deLocalizeHref, localizeHref } from '#lib/paraglide/runtime.js';

/** Top level pages in the site navigation. `path` is unlocalized; `/stats` is the public social media dashboard, `/kontakt` the contact form. */
export const SITE_LINKS = [
	{ id: 'home', path: '/', label: m.site_nav_home },
	{ id: 'blog', path: '/blog', label: m.site_nav_blog },
	{ id: 'stats', path: '/stats', label: m.site_nav_stats },
	{ id: 'contact', path: '/kontakt', label: m.site_nav_contact }
] as const;

export type SiteLink = (typeof SITE_LINKS)[number];

/** Localized href of a site link, in the current locale. */
export const siteHref = (link: SiteLink) => localizeHref(link.path);

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
