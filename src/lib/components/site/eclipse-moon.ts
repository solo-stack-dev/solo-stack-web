/**
 * Eclipse moon egg (a Bleach night sky nod): replaces the navbar crescent and favicon for the rest of the session, all pages.
 * Woken by the third crescent slash of a visit (src/lib/home/eggs/Eggs.svelte) or `?eclipse=1` (`?eclipse=0` clears it).
 * SiteNav restores it on mount. Art: `src/lib/assets/moon-eclipse.svg`, `favicon-eclipse.svg` (loaded only once awake).
 */

/** On `<html>` while awake; SiteNav swaps its moon on it. */
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
	// Drop the .ico fallback so no browser keeps showing the crescent.
	for (const link of document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]')) {
		if (link.type === 'image/svg+xml') link.href = href;
		else link.remove();
	}
}
