import { dev } from '$app/env';
import { prerender } from '$app/server';
import { error } from '@sveltejs/kit';
import * as v from 'valibot';
import { outlineOf } from './outline.ts';
import { PostFrontmatterSchema, type Post, type PostSummary } from './schema.ts';

/*
 * Blog posts are Markdown files in src/content/blog (rendered by mdsvex). These functions read their frontmatter and
 * raw text at build time and are prerendered, so the Worker never touches the files. The rendered body is loaded on
 * the page itself (`loadPostBody` in ./content.ts), one lazy chunk per post.
 */

const metadata = import.meta.glob<Record<string, unknown>>('/src/content/blog/*.md', { eager: true, import: 'metadata' });
const sources = import.meta.glob<string>('/src/content/blog/*.md', { eager: true, query: '?raw', import: 'default' });

/** Words per minute for the reading time (German prose, a calm reading pace). */
const WORDS_PER_MINUTE = 200;

function countReadingMinutes(source: string) {
	const text = source
		.replace(/^---[\s\S]*?\n---/, '')
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/[#>*_`[\]()-]/g, ' ');
	const words = text.split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function loadAll(): Post[] {
	return Object.entries(metadata).map(([path, data]) => {
		const result = v.safeParse(PostFrontmatterSchema, data ?? {});
		if (!result.success) {
			const issues = result.issues.map((issue) => `${v.getDotPath(issue) ?? '(root)'}: ${issue.message}`).join('; ');
			throw new Error(`Invalid frontmatter in ${path}: ${issues}`);
		}
		const file = path.split('/').pop()!.replace(/\.md$/, '');
		if (result.output.slug !== file) throw new Error(`Slug "${result.output.slug}" does not match the file name ${path}`);
		const source = sources[path] ?? '';
		return { ...result.output, readingMinutes: countReadingMinutes(source), outline: outlineOf(source) };
	});
}

/** Published posts (drafts too in dev), newest first. Throws at build time on invalid frontmatter. */
function published(): Post[] {
	return loadAll()
		.filter((post) => dev || !post.draft)
		.toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title));
}

/** Blog index: card data of every published post, newest first. */
export const getPosts = prerender(async (): Promise<PostSummary[]> =>
	published().map(({ slug, title, description, youtubeId, publishedAt, format, lang, readingMinutes, durationSeconds }) => ({
		slug,
		title,
		description,
		youtubeId,
		publishedAt,
		format,
		lang,
		readingMinutes,
		durationSeconds
	}))
);

/** One post by slug (404 for unknown slugs and drafts). */
export const getPost = prerender(
	v.pipe(v.string(), v.maxLength(120)),
	async (slug): Promise<Post> => {
		const post = published().find((candidate) => candidate.slug === slug);
		if (!post) error(404);
		return post;
	},
	{ inputs: () => published().map((post) => post.slug) }
);
