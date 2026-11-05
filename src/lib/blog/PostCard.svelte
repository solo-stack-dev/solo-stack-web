<!--
	@component
	Blog index entry, no card box. Art: the self-hosted video thumbnail, or the format's silhouette vignette with the
	"video follows" sign lit in its sky while the video is not public; both on a torn paper edge. The title link covers the
	whole entry (one tab stop, one link name).

	`featured` (the newest post): art beside a big title from `md`. Otherwise an index row: meta column, title and teaser,
	art on the right (stacked on phones).
-->
<script lang="ts">
	import VideoThumbnail from '#lib/home/sections/cinema/VideoThumbnail.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { FORMAT_LABELS, formatDate, postHref } from './content.ts';
	import FormatVignette from './FormatVignette.svelte';
	import { DECKLE_MASK } from './materials.ts';
	import type { PostSummary } from './schema.ts';

	interface Props {
		post: PostSummary;
		featured?: boolean;
		/** Load the image eagerly (the first entry above the fold). */
		eager?: boolean;
	}

	let { post, featured = false, eager = false }: Props = $props();

	// Rendered width. Index: max-w-6xl (72rem), px-4/sm:6/lg:8. Featured from md: 1.2fr + 1fr, gap up to 4rem. Rows from md: 17rem art.
	const SIZES_SINGLE = '(min-width: 40rem) calc(100vw - 3rem), calc(100vw - 2rem)';
	const sizes = $derived(
		featured
			? `(min-width: 72rem) 36rem, (min-width: 48rem) calc((100vw - 7rem) * 0.55), ${SIZES_SINGLE}`
			: `(min-width: 64rem) 19rem, (min-width: 48rem) 15rem, ${SIZES_SINGLE}`
	);
</script>

<!-- `lang` marks only the post's own text; format, date and reading time are page UI -->
<article class={['entry', featured ? 'is-featured' : 'is-row']}>
	<div class="art">
		{#if post.youtubeId}
			<div class="thumb" style:--deckle={DECKLE_MASK}>
				<VideoThumbnail id={post.youtubeId} {sizes} loading={eager ? 'eager' : 'lazy'} fetchpriority={eager ? 'high' : undefined} />
			</div>
		{:else}
			<FormatVignette class="thumb" format={post.format} {sizes} {eager}>
				<span class="sign"><span class="spark" aria-hidden="true"></span>{m.blog_card_no_video()}</span>
			</FormatVignette>
		{/if}
	</div>

	<div class="body">
		<h2 class="title" lang={post.lang}>
			<a href={postHref(post)} hreflang={post.lang}>{post.title}</a>
		</h2>
		<p class="teaser" lang={post.lang}>{post.description}</p>
		<p class="meta">
			<span class="format">{FORMAT_LABELS[post.format]()}</span>
			<span class="facts">
				<time datetime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
				<span aria-hidden="true">·</span>
				<span>{m.blog_reading_time({ minutes: post.readingMinutes })}</span>
			</span>
		</p>
		<!-- A brushed arrow that walks on hover -->
		<svg class="go" viewBox="0 0 64 16" aria-hidden="true">
			<path d="M2 8.6C14 7.6 30 8.4 44 7.9s12 .4 16-.2" />
			<path d="M51.5 2.4c3 2.2 6 4.3 9 5.6-3.2 1.5-6.1 3.4-8.8 5.6" />
		</svg>
	</div>
</article>

<style>
	.entry {
		position: relative;
		display: grid;
		align-content: start;
		gap: 1.25rem;
	}

	/* One focus ring around the whole entry (the title link is the target) */
	.entry:has(a:focus-visible) {
		outline: 2px solid var(--focus-ring);
		outline-offset: 0.75rem;
		border-radius: 0.75rem;
	}

	/* Art ------------------------------------------------------------------------------------------------------- */

	.art {
		position: relative;
		transition: translate var(--dur-state) var(--ease-settle);
	}

	.art :global(.thumb) {
		position: relative;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		background: var(--color-ink);
		mask: var(--deckle) center / 100% 100% no-repeat;
	}

	.art :global(.thumb img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition:
			scale 900ms var(--ease-settle),
			filter 600ms ease;
	}

	/* Hover: the art drifts up and the night brightens a little, as if the landmark lit up */
	.entry:hover .art {
		translate: 0 -3px;
	}

	.entry:hover .art :global(.thumb img) {
		scale: 1.035;
		filter: brightness(1.08) saturate(1.06);
	}

	/* Paper shadow under the torn sheet (the mask would clip a box-shadow) */
	.art::after {
		content: '';
		position: absolute;
		inset: auto 6% -0.9rem;
		z-index: -1;
		height: 1.6rem;
		border-radius: 50%;
		background: radial-gradient(closest-side, rgb(24 25 27 / 0.22), transparent);
		transition: opacity var(--dur-state) ease;
	}

	:global(.dark) .art::after {
		background: radial-gradient(closest-side, rgb(252 215 114 / 0.1), transparent);
	}

	/* "Video follows", lit in the dark sky of the vignette like a sign over the hills */
	.sign {
		position: absolute;
		top: clamp(0.8rem, 6cqi, 1.75rem);
		left: clamp(0.9rem, 6cqi, 2rem);
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		color: var(--color-moonlight);
		font-family: var(--font-mono);
		font-size: clamp(0.625rem, 2.4cqi, 0.8125rem);
		font-weight: 500;
		letter-spacing: var(--tracking-label-sm);
		text-transform: uppercase;
		text-shadow:
			0 0 8px rgb(252 215 114 / 0.55),
			0 1px 2px rgb(14 15 16 / 0.8);
	}

	/* A firefly as the sign's pilot light */
	.spark {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--color-moonlight);
		box-shadow:
			0 0 3px 1px var(--color-butter),
			0 0 12px 3px rgb(252 215 114 / 0.6);
		animation: blink 3.6s ease-in-out infinite;
	}

	@keyframes blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.4;
		}
	}

	/* Text ------------------------------------------------------------------------------------------------------ */

	.body {
		position: relative;
		display: grid;
		align-content: start;
		gap: 0.75rem;
	}

	.title {
		font-family: var(--font-display);
		font-size: clamp(1.4rem, 2.1vw, 1.75rem);
		font-weight: 900;
		letter-spacing: -0.035em;
		line-height: 1.08;
		text-wrap: balance;
	}

	.title a {
		outline: none;
		box-shadow: none;
		text-decoration: underline;
		text-decoration-color: transparent;
		text-decoration-thickness: 0.075em;
		text-underline-offset: 0.16em;
		transition: text-decoration-color var(--dur-state) ease;
	}

	/* The whole entry is the link target */
	.title a::after {
		content: '';
		position: absolute;
		inset: 0;
	}

	.entry:hover .title a {
		text-decoration-color: var(--color-ochre);
	}

	:global(.dark) .entry:hover .title a {
		text-decoration-color: var(--color-butter);
	}

	.teaser {
		max-width: 58ch;
		color: var(--muted-foreground);
		line-height: 1.6;
		text-wrap: pretty;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.4rem 1rem;
		margin-top: 0.25rem;
		color: var(--muted-foreground);
		font-size: 0.8125rem;
		font-variant-numeric: tabular-nums;
	}

	.facts {
		display: inline-flex;
		gap: 0.5rem;
	}

	/* Format as an ink label, no pill: a short brush dash leads it */
	.format {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		color: var(--ink-lit);
		font-family: var(--font-mono);
		font-size: var(--text-label-sm);
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
	}

	.format::before {
		content: '';
		width: 1.1rem;
		height: 2px;
		border-radius: 2px;
		background: currentColor;
		opacity: 0.8;
	}

	.go {
		width: 3.5rem;
		height: 0.9rem;
		margin-top: 0.4rem;
		overflow: visible;
		color: var(--foreground);
		fill: none;
		stroke: currentColor;
		stroke-width: 2.2;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.55;
		transition:
			translate var(--dur-state) cubic-bezier(0.3, 1.35, 0.5, 1),
			opacity var(--dur-state) ease,
			color var(--dur-state) ease;
	}

	.entry:hover .go {
		translate: 0.6rem 0;
		opacity: 1;
		color: var(--ink-lit);
	}

	/* Featured ------------------------------------------------------------------------------------------------- */

	.is-featured .title {
		font-size: clamp(1.9rem, 6.4vw, 2.4rem);
		line-height: 1.02;
		letter-spacing: var(--tracking-wordmark);
	}

	@media (min-width: 48rem) {
		.is-featured {
			grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
			align-items: center;
			gap: clamp(2rem, 4.5vw, 4rem);
		}

		.is-featured .title {
			font-size: clamp(1.9rem, 3vw, 2.75rem);
			line-height: 1;
		}

		.is-featured .teaser {
			font-size: 1.0625rem;
		}

		.is-featured .go {
			width: 4.5rem;
			height: 1.1rem;
		}
	}

	/* Rows ------------------------------------------------------------------------------------------------------ */

	@media (min-width: 48rem) {
		.is-row {
			grid-template-columns: minmax(0, 1fr) 15rem;
			align-items: start;
			gap: 2.5rem;
		}

		.is-row .art {
			grid-column: 2;
			grid-row: 1;
		}

		.is-row .body {
			grid-column: 1;
			grid-row: 1;
		}
	}

	@media (min-width: 64rem) {
		.is-row {
			grid-template-columns: minmax(0, 1fr) 19rem;
			gap: 4rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.spark {
			animation: none;
		}

		.entry:hover .art,
		.entry:hover .go {
			translate: none;
		}

		.entry:hover .art :global(.thumb img) {
			scale: none;
		}
	}
</style>
