import { dev } from '$app/env';
import * as v from 'valibot';
import { outlineOf } from './outline.ts';
import { PostFrontmatterSchema, type Post } from './schema.ts';

/*
 * Frontmatter and raw text of src/content/blog/*.md, read and prerendered at build time (the Worker never touches the
 * files; server only). The rendered body is a lazy chunk per post (`loadPostBody`, ./content.ts).
 */

const metadata = import.meta.glob<Record<string, unknown>>('/src/content/blog/*.md', { eager: true, import: 'metadata' });
const sources = import.meta.glob<string>('/src/content/blog/*.md', { eager: true, query: '?raw', import: 'default' });

/** Calm reading pace for German prose. */
const WORDS_PER_MINUTE = 200;

function countReadingMinutes(source: string) {
	const text = source
		.replace(/^---[\s\S]*?\n---/, '')
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/[#>*_`[\]()-]/g, ' ');
	const words = text.split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

const FRONTMATTER = /^---[\s\S]*?\n---\r?\n?/;

/** The Markdown body of a post as written (frontmatter removed, its YAML comments are internal notes). */
export function postSource(slug: string): string {
	return (sources[`/src/content/blog/${slug}.md`] ?? '').replace(FRONTMATTER, '').trim();
}

type LoadedPost = Omit<Post, 'translations' | 'videoLang'>;

function loadAll(): LoadedPost[] {
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

/**
 * Translations: a translated post names its original in `translationOf`; the original and its translations form one group
 * (one post per language). Checked over all posts, drafts included, so a broken link fails the build.
 */
function checkTranslations(all: LoadedPost[]) {
	const bySlug = new Map(all.map((post) => [post.slug, post]));
	const taken = new Set<string>();
	for (const post of all) {
		if (!post.translationOf) continue;
		const original = bySlug.get(post.translationOf);
		const where = `src/content/blog/${post.slug}.md`;
		if (!original) throw new Error(`${where}: translationOf "${post.translationOf}" is not a post`);
		if (original.translationOf) throw new Error(`${where}: translationOf must name the original, but "${original.slug}" is itself a translation`);
		if (original.lang === post.lang) throw new Error(`${where}: translation and original "${original.slug}" are both "${post.lang}"`);
		const key = `${original.slug}:${post.lang}`;
		if (taken.has(key)) throw new Error(`${where}: "${original.slug}" already has a "${post.lang}" translation`);
		taken.add(key);
		if (post.youtubeId !== original.youtubeId) throw new Error(`${where}: youtubeId differs from the original "${original.slug}" (same video)`);
	}
}

/** Published posts (drafts too in dev), newest first, each with its published translations. Throws at build time on invalid frontmatter. */
export function published(): Post[] {
	const all = loadAll();
	checkTranslations(all);
	const bySlug = new Map(all.map((post) => [post.slug, post]));
	const visible = all.filter((post) => dev || !post.draft);
	const groupOf = (post: LoadedPost) => post.translationOf ?? post.slug;
	return visible
		.map((post) => ({
			...post,
			videoLang: post.translationOf ? bySlug.get(post.translationOf)!.lang : post.lang,
			translations: visible.filter((other) => other !== post && groupOf(other) === groupOf(post)).map(({ slug, lang }) => ({ slug, lang }))
		}))
		.toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title));
}
