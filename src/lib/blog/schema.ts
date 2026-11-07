import * as v from 'valibot';
import { locales, type Locale } from '#lib/paraglide/runtime.js';
import { VIDEO_ID_PATTERN } from '#lib/home/sections/cinema/thumbnail.ts';

/**
 * Post frontmatter (`src/content/blog/<slug>.md`, one per video; docs/ARCHITECTURE.md#blog-pipeline-proposed). All visitor
 * text is written by gpt-6.1-sol, except the transcript (the video's own).
 */
export const POST_FORMATS = ['project', 'ai-test', 'ai-news', 'business'] as const;
export type PostFormat = (typeof POST_FORMATS)[number];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** YAML turns an unquoted `2026-11-01` into a Date (mdsvex passes its ISO timestamp): accept all three, normalize to `YYYY-MM-DD`. */
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
	/** `null` until the video is public: the post shows a placeholder and no VideoObject. */
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
	/**
	 * Only on a translation: the slug of the original post (the one in the video's language). Links both ways for hreflang,
	 * the sitemap and the language link under the title; the blog index then shows each visitor one version per video.
	 */
	translationOf: v.optional(v.pipe(v.string(), v.regex(SLUG_PATTERN))),
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
	/** The other language versions of this post (published ones only). */
	translations: { slug: string; lang: Locale }[];
	/** Language spoken in the video: the original post's `lang`. */
	videoLang: Locale;
}

/** Card data for the index (no transcript, links or takeaways). */
export type PostSummary = Pick<
	Post,
	'slug' | 'title' | 'description' | 'youtubeId' | 'publishedAt' | 'format' | 'lang' | 'readingMinutes' | 'durationSeconds' | 'translations'
>;
