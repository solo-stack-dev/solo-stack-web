import { prerender } from '$app/server';
import { error } from '@sveltejs/kit';
import * as v from 'valibot';
import { published } from './posts.server.ts';
import type { Post, PostSummary } from './schema.ts';

/** Blog index: card data of every published post, newest first. */
export const getPosts = prerender(async (): Promise<PostSummary[]> =>
	published().map(({ slug, title, description, youtubeId, publishedAt, format, lang, readingMinutes, durationSeconds, translations }) => ({
		slug,
		title,
		description,
		youtubeId,
		publishedAt,
		format,
		lang,
		readingMinutes,
		durationSeconds,
		translations
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
