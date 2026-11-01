import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit/hooks';
import { baseLocale, deLocalizeUrl, getTextDirection } from '#lib/paraglide/runtime.js';
import { paraglideMiddleware } from '#lib/paraglide/server.js';

// The base locale lives at unprefixed URLs (`/blog`). Paraglide also accepts `/de/blog` for it,
// which would be duplicate content, so redirect it permanently to the canonical URL.
const handleBaseLocalePrefix: Handle = ({ event, resolve }) => {
	const { pathname } = event.url;
	if (pathname === `/${baseLocale}` || pathname.startsWith(`/${baseLocale}/`)) {
		const canonical = deLocalizeUrl(event.url);
		redirect(308, canonical.pathname + canonical.search);
	}
	return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		return resolve(
			{ ...event, request },
			{
				transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale).replace('%paraglide.dir%', getTextDirection(locale))
			}
		);
	});

export const handle: Handle = sequence(handleBaseLocalePrefix, handleParaglide);
