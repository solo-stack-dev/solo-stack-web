import type { RequestHandler } from './$types';

// Prerendered per build mode, so the sitemap URL matches the origin (vite.config.ts `paths.origin`).
// Staging is a copy of production: keep crawlers out there, or it competes with solo-stack.dev as duplicate content.
export const prerender = true;

export const GET: RequestHandler = ({ url }) => {
	const body = url.hostname.startsWith('staging.') ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n\nSitemap: ${url.origin}/sitemap.xml\n`;
	return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
