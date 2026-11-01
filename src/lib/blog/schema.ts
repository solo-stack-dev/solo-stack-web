import * as v from 'valibot';
import { locales } from '#lib/paraglide/runtime.js';
import { VIDEO_ID_PATTERN } from '#lib/home/sections/cinema/thumbnail.ts';

/**
 * Frontmatter of a blog post (`src/content/blog/<slug>.md`, one post per YouTube video). Draft from
 * docs/ARCHITECTURE.md#blog-pipeline-proposed. Every value a visitor reads (title, description, summary,
 * takeaways, chapter titles, link labels, the body) is written by gpt-6.1-sol; the transcript is the video's own.
 */
export const POST_FORMATS = ['project', 'ai-test', 'ai-news', 'business'] as const;
export type PostFormat = (typeof POST_FORMATS)[number];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * YAML turns an unquoted `2026-11-01` into a Date (mdsvex then hands over its ISO timestamp string); accept a date, a
 * timestamp or a Date and normalize to `YYYY-MM-DD`.
 */
const DateSchema = v.pipe(
	v.union([v.pipe(v.string(), v.isoDate()), v.pipe(v.string(), v.isoTimestamp()), v.date()]),
	v.transform((value) => (typeof value === 'string' ? value : value.toISOString()).slice(0, 10))
);

const SecondsSchema = v.pipe(v.number(), v.integer(), v.minValue(0));
const TextSchema = v.pipe(v.string(), v.trim(), v.nonEmpty());

export const ChapterSchema = v.object({ start: SecondsSchema, title: TextSchema });
export const PostLinkSchema = v.object({ url: v.pipe(v.string(), v.url()), label: TextSchema });
export const TranscriptSegmentSchema = v.object({ start: SecondsSchema, text: TextSchema });

export const PostFrontmatterSchema = v.object({
	title: v.pipe(TextSchema, v.maxLength(120)),
	/** Must match the file name. */
	slug: v.pipe(v.string(), v.regex(SLUG_PATTERN)),
	/** Meta description, also the card teaser. */
	description: v.pipe(TextSchema, v.maxLength(200)),
	/** Short summary shown above the article. */
	summary: v.optional(TextSchema),
	/** YouTube video ID. `null` until the video is public: the post shows a placeholder and no VideoObject. */
	youtubeId: v.optional(v.nullable(v.pipe(v.string(), v.regex(VIDEO_ID_PATTERN))), null),
	publishedAt: DateSchema,
	updatedAt: v.optional(DateSchema),
	durationSeconds: v.optional(v.nullable(SecondsSchema), null),
	format: v.picklist(POST_FORMATS),
	chapters: v.optional(v.array(ChapterSchema), []),
	takeaways: v.optional(v.array(TextSchema), []),
	links: v.optional(v.array(PostLinkSchema), []),
	transcript: v.optional(v.array(TranscriptSegmentSchema), []),
	tags: v.optional(v.array(TextSchema), []),
	lang: v.picklist(locales),
	generatedBy: v.literal('gpt-6.1-sol'),
	/** Drafts are only listed and built in dev. */
	draft: v.optional(v.boolean(), false)
});

export type PostFrontmatter = v.InferOutput<typeof PostFrontmatterSchema>;

/** A post as the pages see it: frontmatter plus derived values. */
export interface Post extends PostFrontmatter {
	readingMinutes: number;
	/** The `##` sections of the body, for the table of contents. */
	outline: { id: string; title: string }[];
}

/** Card data for the index (no transcript, links or takeaways). */
export type PostSummary = Pick<Post, 'slug' | 'title' | 'description' | 'youtubeId' | 'publishedAt' | 'format' | 'lang' | 'readingMinutes' | 'durationSeconds'>;
