/**
 * Easter egg: the eclipse moon. A glowing disc swallowed by a black crescent (a nod to a Bleach night sky) replaces the
 * butter crescent in the navbar and the favicon for the rest of the session, on every page.
 *
 * Woken by the third crescent slash of a visit (src/lib/home/eggs/Eggs.svelte) or `?eclipse=1` (`?eclipse=0` clears it).
 * SiteNav calls `restoreEclipseMoon()` on mount; the moon art is `src/lib/assets/moon-eclipse.svg` (navbar) and
 * `favicon-eclipse.svg` (tab), the latter loaded only once the egg is awake.
 */

/** Attribute on `<html>` while the eclipse moon is awake. SiteNav swaps its moon on it. */
export const ECLIPSE_ATTR = 'data-eclipse-moon';

/** Crescent slashes per visit that wake the eclipse moon. */
export const ECLIPSE_AFTER_SLASHES = 3;

const KEY = 'solostack:eclipse-moon';

export function wakeEclipseMoon() {
	try {
		sessionStorage.setItem(KEY, '1');
	} catch {
		// Storage blocked: the moon stays for this page only.
	}
	void apply();
}

/** Re-apply a woken moon after a reload or on another page, and honor `?eclipse=1|0`. */
export function restoreEclipseMoon() {
	const force = new URL(location.href).searchParams.get('eclipse');
	try {
		if (force === '0') sessionStorage.removeItem(KEY);
		if (force === '1' || sessionStorage.getItem(KEY)) wakeEclipseMoon();
	} catch {
		if (force === '1') void apply();
	}
}

async function apply() {
	const root = document.documentElement;
	if (root.hasAttribute(ECLIPSE_ATTR)) return;
	root.setAttribute(ECLIPSE_ATTR, '');
	const { default: href } = await import('#lib/assets/favicon-eclipse.svg');
	// The .ico is only a fallback for old clients; drop it so no browser keeps showing the crescent.
	for (const link of document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]')) {
		if (link.type === 'image/svg+xml') link.href = href;
		else link.remove();
	}
}
