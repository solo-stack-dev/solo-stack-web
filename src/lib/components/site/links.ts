import { m } from '#lib/paraglide/messages.js';
import { deLocalizeHref, localizeHref } from '#lib/paraglide/runtime.js';

/** Site nav pages; `path` is unlocalized. `/stats` = public social media dashboard. */
export const SITE_LINKS = [
	{ id: 'home', path: '/', label: m.site_nav_home },
	{ id: 'blog', path: '/blog', label: m.site_nav_blog },
	{ id: 'stats', path: '/stats', label: m.site_nav_stats },
	{ id: 'contact', path: '/kontakt', label: m.site_nav_contact }
] as const;

export type SiteLink = (typeof SITE_LINKS)[number];

/** In the current locale. */
export const siteHref = (link: SiteLink) => localizeHref(link.path);

/** `aria-current`: `page` on the exact page, `true` inside its section (a post under Blog). `pathname` is localized. */
export function siteCurrent(link: SiteLink, pathname: string): 'page' | 'true' | undefined {
	const path = deLocalizeHref(pathname).replace(/\/$/, '') || '/';
	if (path === link.path) return 'page';
	if (link.path !== '/' && path.startsWith(`${link.path}/`)) return 'true';
	return undefined;
}
