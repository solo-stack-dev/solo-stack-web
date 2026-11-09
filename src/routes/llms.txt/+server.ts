import { postMarkdownHref } from '#lib/blog/content.ts';
import { published } from '#lib/blog/posts.server.ts';
import { m } from '#lib/paraglide/messages.js';
import type { RequestHandler } from './$types';

/*
 * /llms.txt (https://llmstxt.org): a Markdown index for LLM tools, pointing at the Markdown version of every post.
 * Text comes from existing messages and post frontmatter (gpt-6.1-sol), no new copy. English intro, since the file has
 * one language; posts of both languages are listed, newest first. Prerendered, rebuilt with every deploy like the feeds.
 */

export const prerender = true;

const options = { locale: 'en' } as const;

export const GET: RequestHandler = ({ url }) => {
	const posts = published().map((post) => `- [${post.title}](${new URL(postMarkdownHref(post), url.origin).href}): ${post.description}`);
	const body = ['# SOLO STACK', `> ${m.home_meta_description({}, options)}`, `## ${m.blog_index_title({}, options)}`, posts.join('\n')].join('\n\n');
	return new Response(`${body}\n`, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
