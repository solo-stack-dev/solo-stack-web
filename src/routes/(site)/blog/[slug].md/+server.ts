import { error } from '@sveltejs/kit';
import { renderPostMarkdown } from '#lib/blog/markdown.server.ts';
import { published } from '#lib/blog/posts.server.ts';
import { getLocale } from '#lib/paraglide/runtime.js';
import type { RequestHandler } from './$types';

/*
 * /blog/<slug>.md and /en/blog/<slug>.md: each post as Markdown for agents (src/lib/blog/markdown.server.ts), prerendered.
 * The crawler finds each file through the `<link rel="alternate" type="text/markdown">` in the post's head; /llms.txt lists them.
 * Like the page, a version lives only under its own locale: /en/blog/<German slug>.md is a 404.
 * Separate URLs instead of `Accept: text/markdown` on the page URL: Workers Cache keys on the path only.
 * Served as static files: Content-Type and X-Robots-Tag come from `_headers` in production (the headers set here are lost there).
 */

export const prerender = true;

export const GET: RequestHandler = ({ params, url }) => {
	const post = published().find((candidate) => candidate.slug === params.slug);
	if (!post || post.lang !== getLocale()) error(404);
	return new Response(renderPostMarkdown(post, url.origin), {
		headers: { 'content-type': 'text/markdown; charset=utf-8', 'x-robots-tag': 'noindex' }
	});
};
