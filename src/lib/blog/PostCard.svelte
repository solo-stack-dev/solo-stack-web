<!--
	@component
	Blog index card: thumbnail (self-hosted YouTube thumbnail, or the painted night while the video is not public),
	format, date, reading time, title, teaser. The title link stretches over the whole card (one tab stop, one link
	name). `featured` lays it out wide (image beside the text from `md`).
-->
<script lang="ts">
	import VideoThumbnail from '#lib/home/sections/cinema/VideoThumbnail.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { FORMAT_LABELS, formatDate, postHref } from './content.ts';
	import NightScene from './NightScene.svelte';
	import type { PostSummary } from './schema.ts';

	interface Props {
		post: PostSummary;
		featured?: boolean;
		/** Load the image eagerly (the first card above the fold). */
		eager?: boolean;
	}

	let { post, featured = false, eager = false }: Props = $props();

	// Rendered thumbnail width. Blog index: max-w-6xl container with px-4 (sm: px-8), grid gap 1.5rem with 1/2/3 columns
	// (md/lg), card padding 0.75rem. Featured from md: one full-width card, image column 1.15fr beside 1fr, 2rem gap.
	const SIZES_SINGLE = '(min-width: 40rem) calc(100vw - 5.5rem), calc(100vw - 3.5rem)';
	const sizes = $derived(
		featured
			? `(min-width: 48rem) min(calc((100vw - 7.5rem) * 0.535), 34.5rem), ${SIZES_SINGLE}`
			: `(min-width: 64rem) min(calc((100vw - 7rem) / 3 - 1.5rem), 20.25rem), (min-width: 48rem) calc(50vw - 4.25rem), ${SIZES_SINGLE}`
	);
</script>

<!-- `lang` marks only the post's own text: the format, date and reading time are page UI in the page locale -->
<article class={['post-card group', featured && 'is-featured']}>
	<div class="thumb">
		{#if post.youtubeId}
			<VideoThumbnail id={post.youtubeId} {sizes} loading={eager ? 'eager' : 'lazy'} />
		{:else}
			<NightScene class="scene" variant="moonrise">
				<span class="no-video">{m.blog_card_no_video()}</span>
			</NightScene>
		{/if}
	</div>

	<div class="body">
		<p class="meta">
			<span class="format">{FORMAT_LABELS[post.format]()}</span>
			<time datetime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
			<span aria-hidden="true">·</span>
			<span>{m.blog_reading_time({ minutes: post.readingMinutes })}</span>
		</p>
		<h2 class="title" lang={post.lang}>
			<a href={postHref(post)} hreflang={post.lang}>{post.title}</a>
		</h2>
		<p class="teaser" lang={post.lang}>{post.description}</p>
	</div>
</article>

<style>
	.post-card {
		position: relative;
		display: grid;
		align-content: start;
		gap: 1rem;
		padding: 0.75rem;
		border: 1px solid var(--border);
		border-radius: calc(var(--radius) + 0.5rem);
		background: var(--card);
		color: var(--card-foreground);
		transition:
			border-color 200ms ease,
			translate 200ms ease,
			box-shadow 200ms ease;
	}

	.post-card:hover {
		border-color: color-mix(in oklab, var(--color-ochre) 55%, var(--border));
		box-shadow: 0 1.25rem 2.5rem -1.75rem rgb(24 25 27 / 0.35);
		translate: 0 -2px;
	}

	.post-card:has(a:focus-visible) {
		outline: 2px solid var(--focus-ring);
		outline-offset: 3px;
	}

	.thumb {
		position: relative;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		border-radius: var(--radius);
		background: var(--color-night);
	}

	.thumb :global(img),
	.thumb :global(.scene) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: scale 500ms ease;
	}

	.post-card:hover .thumb :global(img),
	.post-card:hover .thumb :global(.scene) {
		scale: 1.03;
	}

	.no-video {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		padding: 0.2rem 0.6rem;
		border: 1px solid rgb(251 243 221 / 0.25);
		border-radius: 999px;
		background: rgb(14 15 16 / 0.55);
		color: var(--color-cream);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.08em;
		backdrop-filter: blur(4px);
	}

	.body {
		display: grid;
		gap: 0.6rem;
		padding: 0 0.5rem 0.5rem;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem 0.6rem;
		color: var(--muted-foreground);
		font-size: 0.8125rem;
		font-variant-numeric: tabular-nums;
	}

	.format {
		padding: 0.15rem 0.6rem;
		border-radius: 999px;
		background: color-mix(in oklab, var(--color-butter) 55%, transparent);
		color: var(--color-night);
		font-weight: 600;
	}

	:global(.dark) .format {
		background: color-mix(in oklab, var(--color-butter) 16%, transparent);
		color: var(--color-butter);
	}

	.title {
		font-size: 1.3rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		line-height: 1.2;
		text-wrap: balance;
	}

	.title a {
		outline: none;
	}

	/* The whole card is the link target */
	.title a::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
	}

	.post-card:hover .title a {
		text-decoration: underline;
		text-decoration-color: var(--color-ochre);
		text-decoration-thickness: 2px;
		text-underline-offset: 0.2em;
	}

	.teaser {
		color: var(--muted-foreground);
		line-height: 1.6;
		text-wrap: pretty;
	}

	@media (min-width: 48rem) {
		.is-featured {
			grid-template-columns: 1.15fr 1fr;
			align-items: center;
			gap: 2rem;
		}

		.is-featured .body {
			padding: 1rem 1.5rem 1rem 0;
		}

		.is-featured .title {
			font-size: clamp(1.6rem, 2.6vw, 2.25rem);
		}

		.is-featured .teaser {
			font-size: 1.0625rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.post-card:hover {
			translate: none;
		}
	}
</style>
