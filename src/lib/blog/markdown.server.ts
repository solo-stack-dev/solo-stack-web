import { m } from '#lib/paraglide/messages.js';
import { formatTimestamp, postHref, postMarkdownHref } from './content.ts';
import { postSource } from './posts.server.ts';
import type { Post } from './schema.ts';

/*
 * The Markdown version of a post (`/blog/<slug>.md`, `/en/blog/<slug>.md`) for agents and LLM tools: the same content as
 * the page, in the page's order, without layout. Every visitor text is the post's own (gpt-6.1-sol) or an existing
 * Paraglide message in the post's language; nothing here is new copy. The frontmatter is rebuilt from the validated
 * fields, so the source's YAML comments (internal notes) never ship.
 */

/** A JSON string is a valid YAML double-quoted scalar. */
const yaml = (value: string) => JSON.stringify(value);

/** Root-relative Markdown links (`](/stats)`) become absolute: the file is often read outside the site. */
const absoluteLinks = (markdown: string, origin: string) => markdown.replace(/\]\(\/(?!\/)/g, `](${origin}/`);

export function renderPostMarkdown(post: Post, origin: string): string {
	const absolute = (path: string) => new URL(path, origin).href;
	const options = { locale: post.lang };
	const watchUrl = post.youtubeId ? `https://www.youtube.com/watch?v=${post.youtubeId}` : null;

	const front = ['---', `title: ${yaml(post.title)}`, `description: ${yaml(post.description)}`, `lang: ${post.lang}`, `url: ${yaml(absolute(postHref(post)))}`];
	front.push(`published: ${post.publishedAt}`);
	if (post.updatedAt) front.push(`updated: ${post.updatedAt}`);
	if (watchUrl) front.push(`video: ${yaml(watchUrl)}`);
	if (post.tags.length) front.push(`tags: [${post.tags.map(yaml).join(', ')}]`);
	if (post.translations.length) {
		front.push('translations:');
		for (const translation of post.translations) front.push(`  - lang: ${translation.lang}`, `    url: ${yaml(absolute(postMarkdownHref(translation)))}`);
	}
	front.push(`generatedBy: ${post.generatedBy}`, '---');

	const sections = [front.join('\n'), `# ${post.title}`];
	if (post.summary) sections.push(`## ${m.blog_summary_title({}, options)}\n\n${post.summary}`);
	if (post.chapters.length) {
		const chapter = ({ start, title }: Post['chapters'][number]) =>
			watchUrl ? `- [${formatTimestamp(start)}](${watchUrl}&t=${start}s) ${title}` : `- ${formatTimestamp(start)} ${title}`;
		sections.push(`## ${m.blog_chapters_title({}, options)}\n\n${post.chapters.map(chapter).join('\n')}`);
	}
	if (post.takeaways.length) sections.push(`## ${m.blog_takeaways_title({}, options)}\n\n${post.takeaways.map((item) => `- ${item}`).join('\n')}`);
	sections.push(absoluteLinks(postSource(post.slug), origin));
	if (post.transcript.length) {
		const segments = post.transcript.map(({ start, text }) => `[${formatTimestamp(start)}] ${text}`);
		sections.push(`## ${m.blog_transcript_title({}, options)}\n\n${segments.join('\n\n')}`);
	}
	if (post.links.length) sections.push(`## ${m.blog_links_title({}, options)}\n\n${post.links.map(({ url, label }) => `- [${label}](${url})`).join('\n')}`);
	sections.push(`---\n\n${m.blog_generated_note({ model: post.generatedBy }, options)}`);

	return `${sections.join('\n\n')}\n`;
}
