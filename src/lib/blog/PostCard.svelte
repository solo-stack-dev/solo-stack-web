<!--
	@component
	Blog index entry: thumbnail (self-hosted YouTube thumbnail, or the painted night while the video is not public, with
	a rubber stamp like the one on /stats), format, date, reading time, title, teaser. No card box: the picture glows
	and lifts on hover, the title sits on the page. The title link stretches over the whole entry (one tab stop, one
	link name). `featured` lays it out wide (image beside a big title from `md`).
-->
<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
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

	// Rendered thumbnail width. Blog index: max-w-6xl (72rem) container with px-4 (sm: px-6, lg: px-8), grid column gap
	// 2rem with 1/2/3 columns (md/lg). Featured from md: image column 1.15fr beside 1fr with a 3rem gap.
	const SIZES_SINGLE = '(min-width: 40rem) calc(100vw - 3rem), calc(100vw - 2rem)';
	const sizes = $derived(
		featured
			? `(min-width: 64rem) min(calc((100vw - 7rem) * 0.535), 36.6rem), (min-width: 48rem) calc((100vw - 6rem) * 0.535), ${SIZES_SINGLE}`
			: `(min-width: 64rem) min(calc((100vw - 8rem) / 3), 21.33rem), (min-width: 48rem) calc(50vw - 2.5rem), ${SIZES_SINGLE}`
	);
</script>

<!-- `lang` marks only the post's own text: the format, date and reading time are page UI in the page locale -->
<article class={['post-card group', featured && 'is-featured']}>
	<div class="thumb">
		{#if post.youtubeId}
			<VideoThumbnail id={post.youtubeId} {sizes} loading={eager ? 'eager' : 'lazy'} />
		{:else}
			<NightScene class="scene" variant="moonrise">
				<span class="stamp">{m.blog_card_no_video()}</span>
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
		{#if featured}
			<span class="go" aria-hidden="true"><ArrowRightIcon class="size-5" /></span>
		{/if}
	</div>
</article>

<style>
	.post-card {
		position: relative;
		display: grid;
		align-content: start;
		gap: 1.25rem;
	}

	.post-card:has(a:focus-visible) {
		outline: 2px solid var(--focus-ring);
		outline-offset: 6px;
		border-radius: 1.5rem;
	}

	.thumb {
		position: relative;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		border-radius: 1.25rem;
		background: var(--color-night);
		box-shadow:
			0 0 0 1px color-mix(in oklab, var(--foreground) 8%, transparent),
			0 1.25rem 2.5rem -1.75rem rgb(24 25 27 / 0.45);
		transition:
			translate 300ms cubic-bezier(0.3, 1.35, 0.5, 1),
			box-shadow 300ms ease;
	}

	/* Hover: the picture lifts and catches the moonlight */
	.post-card:hover .thumb {
		translate: 0 -4px;
		box-shadow:
			0 0 0 1px color-mix(in oklab, var(--color-butter) 55%, transparent),
			0 1.5rem 3rem -1.5rem rgb(24 25 27 / 0.5),
			0 0 3.5rem -0.5rem rgb(252 215 114 / 0.28);
	}

	.thumb :global(img),
	.thumb :global(.scene) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: scale 600ms ease;
	}

	.post-card:hover .thumb :global(img),
	.post-card:hover .thumb :global(.scene) {
		scale: 1.04;
	}

	/* "Video follows": a butter rubber stamp on the painted night, like the mock data stamp on /stats */
	.stamp {
		position: absolute;
		top: 1rem;
		left: 1rem;
		padding: 0.3rem 0.7rem;
		border: 2px solid currentColor;
		border-radius: 0.5rem;
		color: rgb(252 215 114 / 0.9);
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		transform: rotate(-4deg);
		mask-image: radial-gradient(circle at 30% 40%, #000 60%, rgb(0 0 0 / 0.75) 85%);
	}

	.body {
		position: relative;
		display: grid;
		gap: 0.7rem;
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
		font-family: var(--font-display);
		font-size: 1.45rem;
		font-weight: 900;
		letter-spacing: -0.03em;
		line-height: 1.12;
		text-wrap: balance;
	}

	.title a {
		outline: none;
		text-decoration: underline;
		text-decoration-color: transparent;
		text-decoration-thickness: 0.08em;
		text-underline-offset: 0.18em;
		transition: text-decoration-color 200ms ease;
	}

	/* The whole entry is the link target */
	.title a::after {
		content: '';
		position: absolute;
		inset: 0;
	}

	.post-card:hover .title a {
		text-decoration-color: var(--color-ochre);
	}

	:global(.dark) .post-card:hover .title a {
		text-decoration-color: var(--color-butter);
	}

	.teaser {
		max-width: 60ch;
		color: var(--muted-foreground);
		line-height: 1.6;
		text-wrap: pretty;
	}

	.go {
		display: grid;
		place-items: center;
		width: 3rem;
		height: 3rem;
		margin-top: 0.75rem;
		border-radius: 999px;
		background: var(--color-butter);
		color: var(--color-night);
		box-shadow: 0 2px 16px -2px rgb(252 215 114 / 0.6);
		transition: translate 300ms cubic-bezier(0.3, 1.35, 0.5, 1);
	}

	.post-card:hover .go {
		translate: 0.35rem 0;
	}

	@media (min-width: 48rem) {
		.is-featured {
			grid-template-columns: 1.15fr 1fr;
			align-items: center;
			gap: 3rem;
		}

		.is-featured .thumb {
			border-radius: 1.5rem;
		}

		.is-featured .stamp {
			top: 1.5rem;
			left: 1.5rem;
			font-size: 0.8rem;
		}

		.is-featured .title {
			font-size: clamp(1.9rem, 3vw, 2.75rem);
			line-height: 1;
			letter-spacing: var(--tracking-wordmark);
		}

		.is-featured .teaser {
			font-size: 1.0625rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.post-card:hover .thumb,
		.post-card:hover .go {
			translate: none;
		}
	}
</style>
