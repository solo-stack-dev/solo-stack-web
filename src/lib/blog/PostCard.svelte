<!--
	@component
	Blog index entry, no card box. Art: the self-hosted video thumbnail, or the format's silhouette vignette while the video
	is not public (the meta line then says "video follows", after a firefly); both on a torn paper edge. The title link
	covers the whole entry (one tab stop, one link name).

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

	// Rendered width. Index: max-w-6xl (72rem), px-4/sm:6/lg:8. Featured from md: 7fr + 5fr, gap up to 4rem. Rows from md: 15/19rem art.
	const SIZES_SINGLE = '(min-width: 40rem) calc(100vw - 3rem), calc(100vw - 2rem)';
	const sizes = $derived(
		featured
			? `(min-width: 72rem) 38rem, (min-width: 48rem) calc((100vw - 7rem) * 0.58), ${SIZES_SINGLE}`
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
			<FormatVignette class="thumb" format={post.format} {sizes} {eager} />
		{/if}
	</div>

	<div class="body">
		<h2 class="title" lang={post.lang}>
			<a href={postHref(post)} hreflang={post.lang}>{post.title}</a>
		</h2>
		<p class="teaser" lang={post.lang}>{post.description}</p>
		<!-- One meta line in one voice: date · reading time · format, and while the video is not public a firefly and "video follows" -->
		<p class="meta">
			<time datetime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
			<span aria-hidden="true">·</span>
			<span>{m.blog_reading_time({ minutes: post.readingMinutes })}</span>
			<span aria-hidden="true">·</span>
			<span>{FORMAT_LABELS[post.format]()}</span>
			{#if !post.youtubeId}
				<span class="soon"><span class="spark" aria-hidden="true"></span>{m.blog_card_no_video()}</span>
			{/if}
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

	/* Night: a faint warm light under the torn sheet (the mask would clip a box-shadow); on paper the sheet lies flat */
	:global(.dark) .art::after {
		content: '';
		position: absolute;
		inset: auto 6% -0.9rem;
		z-index: -1;
		height: 1.6rem;
		border-radius: 50%;
		background: radial-gradient(closest-side, rgb(252 215 114 / 0.1), transparent);
	}

	/* "Video follows": the last word of the meta line, a firefly instead of the middle dot before it */
	.soon {
		display: inline-flex;
		align-items: baseline;
		gap: 0.5rem;
		margin-left: 0.35rem;
		color: var(--foreground);
	}

	.spark {
		flex: none;
		align-self: center;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--color-moonlight);
		box-shadow:
			0 0 3px 1px var(--color-butter),
			0 0 10px 3px rgb(252 215 114 / 0.55);
		translate: 0 -0.05em;
		animation: blink 3.6s ease-in-out infinite;
	}

	:global(html:not(.dark)) .spark {
		background: #f1b73e;
		box-shadow:
			0 0 2px 1px rgb(226 169 59 / 0.9),
			0 0 8px 2px rgb(252 215 114 / 0.75);
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

	/* Not positioned: the title link's stretched ::after must resolve against .entry, so the art is part of the link */
	.body {
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
		gap: 0.25rem 0.5rem;
		margin-top: 0.25rem;
		color: var(--muted-foreground);
		font-size: 0.875rem;
		font-variant-numeric: tabular-nums;
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

	.is-featured {
		gap: 1rem;
	}

	.is-featured .title {
		font-size: clamp(1.9rem, 6.4vw, 2.4rem);
		line-height: 1.02;
		letter-spacing: var(--tracking-wordmark);
	}

	@media (min-width: 48rem) {
		.is-featured {
			/* art 7/12, text 5/12 */
			grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
			align-items: center;
			gap: clamp(2rem, 4.5vw, 4rem);
		}

		.is-featured .title {
			font-size: clamp(1.9rem, 2.7vw, 2.5rem);
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
