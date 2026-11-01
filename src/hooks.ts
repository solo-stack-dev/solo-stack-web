import type { Reroute } from '@sveltejs/kit/hooks';
import { baseLocale, deLocalizeUrl } from '#lib/paraglide/runtime.js';

export const reroute: Reroute = (request) => {
	const { pathname } = request.url;
	// `/de/…` (base locale with a prefix) stays unresolved, so the request reaches `handle` in hooks.server.ts and gets
	// its 308 to the unprefixed URL. Rerouted to a prerendered page, SvelteKit would serve that file before `handle` runs.
	if (pathname === `/${baseLocale}` || pathname.startsWith(`/${baseLocale}/`)) return pathname;
	return deLocalizeUrl(request.url).pathname;
};
