import { renderFeed } from '#lib/blog/feed.ts';
import { published } from '#lib/blog/posts.server.ts';
import { getLocale } from '#lib/paraglide/runtime.js';
import type { RequestHandler } from './$types';

/*
 * /blog/rss.xml (German) and /en/blog/rss.xml (English), prerendered like sitemap.xml. One route serves both: the
 * Paraglide reroute (src/hooks.ts) strips `/en`, the middleware sets the locale from the URL, as for the pages.
 * The crawler finds each feed through the `<link rel="alternate">` in the head of /blog and /en/blog.
 * super-sitemap only lists `+page` routes, so the feeds stay out of the sitemap.
 * Served as static files: their Content-Type comes from `_headers` in production (the header set here is lost there).
 */

export const prerender = true;

export const GET: RequestHandler = ({ url }) =>
	new Response(renderFeed({ posts: published(), locale: getLocale(), origin: url.origin, buildDate: new Date() }), {
		headers: { 'content-type': 'application/rss+xml; charset=utf-8' }
	});
