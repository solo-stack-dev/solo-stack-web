<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate, replaceState } from '$app/navigation';
	import { FORMAT_LABELS, postsFor } from '#lib/blog/content.ts';
	import { feedHref } from '#lib/blog/feed.ts';
	import FormatVignette from '#lib/blog/FormatVignette.svelte';
	import { DRY_BRUSH_FADE_RIGHT } from '#lib/blog/materials.ts';
	import groundLine from '#lib/blog/assets/ink-ground.svg?url';
	import PostCard from '#lib/blog/PostCard.svelte';
	import ReadingHill from '#lib/blog/ReadingHill.svelte';
	import { getPosts } from '#lib/blog/posts.remote.ts';
	import { POST_FORMATS, type PostFormat } from '#lib/blog/schema.ts';
	import StarField from '#lib/home/shared/StarField.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	// One version per video: the one in this page's language when it has been translated
	const posts = $derived(postsFor(await getPosts(), getLocale()));

	// Client side filter (the page is prerendered once), mirrored to `?format=` so a filtered view can be shared.
	let format = $state<PostFormat | null>(null);
	const visible = $derived(format ? posts.filter((post) => post.format === format) : posts);
	const otherLanguage = $derived(posts.some((post) => post.lang !== getLocale()));

	// While the blog is young, four formats over a handful of posts mostly lead to empty nights: the filter appears from
	// FILTER_MIN_POSTS posts on (and always while a shared `?format=` link is active, so it can be reset).
	const FILTER_MIN_POSTS = 4;
	const showFilters = $derived(posts.length >= FILTER_MIN_POSTS || format !== null);

	// Also on a navigation to /blog from /blog (the nav link), which keeps this component: the filter follows the URL.
	afterNavigate(({ to }) => {
		const value = to?.url.searchParams.get('format');
		format = value && (POST_FORMATS as readonly string[]).includes(value) ? (value as PostFormat) : null;
	});

	function choose(next: PostFormat | null) {
		format = next;
		const url = new URL(location.href);
		if (next) url.searchParams.set('format', next);
		else url.searchParams.delete('format');
		replaceState(url, page.state);
	}

	// Ink stroke under the chosen filter, measured from the chosen button and on track resize (font swap, viewport). Until then: CSS fallback.
	let track = $state<HTMLElement>();
	let indicator = $state<{ x: number; y: number; w: number } | null>(null);

	$effect(() => {
		if (!track) return;
		const element = track;
		void format;
		const measure = () => {
			const button = element.querySelector<HTMLElement>('[aria-pressed="true"]');
			// y: the words wrap onto two lines on phones
			if (button) indicator = { x: button.offsetLeft, y: button.offsetTop + button.offsetHeight - element.offsetHeight, w: button.offsetWidth };
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	});

	const canonical = $derived(new URL(page.url.pathname, page.url.origin).href);
</script>

<svelte:head>
	<title>{m.blog_meta_title()}</title>
	<meta name="description" content={m.blog_meta_description()} />
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="SOLO STACK" />
	<meta property="og:title" content={m.blog_meta_title()} />
	<meta property="og:description" content={m.blog_meta_description()} />
	<meta property="og:url" content={canonical} />
	<meta name="twitter:card" content="summary" />
	<link rel="alternate" type="application/rss+xml" title={m.blog_meta_title()} href={feedHref(getLocale())} />
</svelte:head>

<div class="relative isolate overflow-x-clip">
	<!-- Night sky over the header, dark theme only -->
	<div class="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-[36rem] mask-b-from-30% dark:block" aria-hidden="true">
		<StarField density={0.5} brightness={0.7} seed={53} />
	</div>

	<!--
		The reading hill, anchored to the content column: title and intro set into its empty sky, the hill standing on the
		ground line that closes the header (phones: the art on top, the title in its sky). The filter words stand on that line.
	-->
	<header class="hill-header mx-auto max-w-6xl px-4 sm:px-6 lg:px-8" style:--ground={`url("${groundLine}")`}>
		<div class="hill-art" style:--wide-fade={DRY_BRUSH_FADE_RIGHT}><ReadingHill sizes="(min-width: 48rem) min(58vw, 54rem), 100vw" /></div>
		<div class="hill-copy">
			<h1 class="giant font-display leading-[0.8] font-black tracking-wordmark">{m.blog_index_title()}</h1>
			<div class="intro-block">
				<p class="intro text-pretty text-muted-foreground">{m.blog_index_intro()}</p>
				{#if otherLanguage}
					<p class="mt-3 text-sm text-muted-foreground" lang={getLocale()}>{m.blog_index_lang_note()}</p>
				{/if}
			</div>
		</div>
		<div class="ground">
			{#if showFilters}
				<div role="group" aria-label={m.blog_filter_label()} class={['filters', indicator && 'is-measured']} bind:this={track}>
					{#if indicator}
						<span class="indicator" style:translate="{indicator.x}px {indicator.y}px" style:width="{indicator.w}px" aria-hidden="true"></span>
					{/if}
					<button type="button" class="filter" aria-pressed={format === null} onclick={() => choose(null)}>{m.blog_filter_all()}</button>
					{#each POST_FORMATS as option (option)}
						<button type="button" class="filter" aria-pressed={format === option} onclick={() => choose(option)}>{FORMAT_LABELS[option]()}</button>
					{/each}
				</div>
			{/if}
		</div>
	</header>

	<div class="posts-area mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		{#if visible.length}
			<ul class="posts">
				{#each visible as post, index (post.slug)}
					{@const featured = index === 0 && !format}
					<li class={featured ? 'is-featured' : 'is-row'}>
						<PostCard {post} {featured} eager={index === 0} />
					</li>
				{/each}
			</ul>
			<!-- The end of the list for now: a quiet sign-off, fireflies rising from it -->
			<p class="closing">
				<span class="flies" aria-hidden="true"><i></i><i></i><i></i></span>
				{m.blog_index_closing()}
			</p>
		{:else}
			<!-- Nothing in this format yet: its night stays empty, the note sits in the sky -->
			<FormatVignette class="empty" format={format ?? 'project'} sizes="(min-width: 72rem) 68rem, (min-width: 40rem) calc(100vw - 3rem), calc(100vw - 2rem)">
				<p class="empty-note"><span class="spark" aria-hidden="true"></span>{m.blog_empty()}</p>
			</FormatVignette>
		{/if}
	</div>
</div>

<style>
	/* Header: the reading hill ----------------------------------------------------------------------------------- */

	.hill-header {
		--art-w: 100vw;
		/* the art's height (aspect 1672 / 941) */
		--art-h: calc(var(--art-w) * 941 / 1672);
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	/*
	 * Phones: the art first, as wide as the screen and anchored to its right edge; its empty sky (the left 45 %, the top
	 * 15 %) holds the title. The empty top tucks under the nav; the hill's foot breaks up in dry brush just above the intro.
	 */
	.hill-art {
		grid-area: 1 / 1;
		justify-self: end;
		width: var(--art-w);
		max-width: none;
		margin: calc(var(--art-h) * -0.19) calc((100vw - 100%) / -2) 0 0;
		pointer-events: none;
	}

	.hill-copy {
		display: contents;
	}

	.giant {
		grid-area: 1 / 1;
		align-self: end;
		position: relative;
		z-index: 1;
		/* sits in the sky left of the tree, its foot level with the hill's toe (which the dry brush dissolves) */
		margin-bottom: calc(var(--art-h) * 0.12);
		font-size: clamp(4.25rem, 20vw, 5.25rem);
		/* Solid ink on paper (a warm gradient turned olive in the g's descender); lit from behind at night */
		color: var(--foreground);
		/* room for the g's descender inside the clipped background (night) */
		padding-bottom: 0.16em;
		margin-left: -0.05em;
	}

	:global(.dark) .giant {
		background: linear-gradient(180deg, var(--color-cream) 38%, var(--color-butter));
		background-clip: text;
		color: transparent;
		text-shadow: 0 0 80px rgb(252 215 114 / 0.18);
	}

	.intro-block {
		position: relative;
		z-index: 1;
	}

	.intro {
		max-width: 34rem;
		font-size: clamp(1.0625rem, 1.4vw, 1.1875rem);
		line-height: 1.55;
	}

	/* The ground line the hill stands on (and the filter words, when there are enough posts) */
	.ground {
		position: relative;
		z-index: 1;
		min-height: 1px;
		margin-top: 1rem;
	}

	.ground::after {
		content: '';
		position: absolute;
		inset: auto 0 -0.4rem;
		height: 0.75rem;
		background: color-mix(in oklab, var(--foreground) 72%, transparent);
		mask: var(--ground) center / 100% 100% no-repeat;
		pointer-events: none;
	}

	/* Night: the line is the lit rim of the land, warm under the hill and fading out toward the title */
	:global(.dark) .ground::after {
		background: linear-gradient(90deg, rgb(251 243 221 / 0.35), rgb(236 160 60 / 0.75) 80%);
	}

	/*
	 * From md the art stands right, anchored to the content column (never to the viewport): its right edge is the column's
	 * right edge plus up to 9rem of bleed; while that bleed reaches the viewport edge (≤ 90rem) the hill runs off the
	 * screen, beyond it the hill breaks up in dry brush. Its foot stands on the ground line; title and intro sit in its sky.
	 */
	@media (min-width: 48rem) {
		.hill-header {
			--art-w: clamp(30rem, 58vw, 54rem);
			--bleed: min(9rem, max(0px, (100vw - 72rem) / 2));
			min-height: calc(var(--art-w) * 941 / 1672 * 0.86);
			align-content: end;
		}

		.hill-art {
			position: absolute;
			right: calc(var(--bleed) * -1);
			bottom: 0;
			width: var(--art-w);
			margin: 0;
			/* the dry brush foot dips just over the line */
			translate: 0 7%;
		}

		.hill-copy {
			display: block;
			position: relative;
			z-index: 1;
			padding-top: 2.5rem;
		}

		.giant {
			margin-bottom: 0;
			font-size: clamp(5.5rem, 10vw, 9.5rem);
		}

		.intro-block {
			margin-top: 0.75rem;
		}

		.intro {
			max-width: min(32rem, 42vw);
		}

		.ground {
			margin-top: clamp(2.5rem, 4vw, 3.5rem);
		}
	}

	@media (min-width: 90.05rem) {
		.hill-art {
			--fade-right: var(--wide-fade);
		}
	}

	/* Format filter: words on the ground line, the chosen one underlined with the brushed ink stroke --------------- */

	.filters {
		position: relative;
		display: flex;
		flex-wrap: wrap;
		gap: 0 clamp(1.25rem, 3vw, 2.25rem);
		/* the words stand on the ground line; room below for the focus ring */
		margin-bottom: 0.35rem;
	}

	.filter {
		position: relative;
		z-index: 1;
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		padding: 0 0.1rem;
		border-radius: 0.4rem;
		color: var(--muted-foreground);
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		white-space: nowrap;
		transition: color var(--dur-state) ease;
	}

	.filter:hover,
	.filter[aria-pressed='true'] {
		color: var(--foreground);
	}

	/* Hover preview of the stroke; also the chosen stroke before JS measured (SSR) */
	.filter::after {
		content: '';
		position: absolute;
		inset: auto -0.2rem 0.1rem;
		height: 0.55rem;
		background: var(--ink-lit);
		mask: var(--ink-underline) center / 100% 100% no-repeat;
		opacity: 0;
		transition: opacity var(--dur-state) ease;
	}

	.filter:hover::after {
		opacity: 0.3;
	}

	.filters:not(.is-measured) .filter[aria-pressed='true']::after {
		opacity: 1;
	}

	.filter[aria-pressed='true']::after {
		opacity: 0;
	}

	.indicator {
		position: absolute;
		bottom: 0.1rem;
		left: 0;
		height: 0.55rem;
		margin-left: -0.2rem;
		padding-right: 0.4rem;
		box-sizing: content-box;
		background: var(--ink-lit);
		mask: var(--ink-underline) center / 100% 100% no-repeat;
		filter: drop-shadow(0 0 6px rgb(252 215 114 / 0.5));
		transition:
			translate 500ms cubic-bezier(0.3, 1.3, 0.5, 1),
			width 500ms cubic-bezier(0.3, 1.3, 0.5, 1);
	}

	/* Posts: the newest one featured, the rest an index ---------------------------------------------------------- */

	.posts {
		display: grid;
	}

	.posts > .is-featured {
		padding-block: clamp(1.25rem, 4.5vw, 3.25rem) clamp(2.5rem, 5vw, 4rem);
	}

	.posts > .is-row {
		position: relative;
		padding-block: clamp(2rem, 4vw, 2.75rem);
	}

	.posts > .is-row::before {
		content: '';
		position: absolute;
		inset: 0 0 auto;
		height: 1px;
		background: linear-gradient(90deg, var(--border) 0 80%, transparent);
	}

	.posts > .is-row:first-child::before {
		display: none;
	}

	.posts > .is-row:first-child {
		padding-top: clamp(2rem, 4.5vw, 3rem);
	}

	/* The end of the list: one quiet line, three fireflies rising from it; then the footer horizon takes over */
	.closing {
		display: flex;
		align-items: center;
		gap: 1rem;
		color: var(--muted-foreground);
		font-size: 0.9375rem;
		text-wrap: balance;
	}

	.flies {
		position: relative;
		flex: none;
		width: 1.5rem;
		height: 1.75rem;
	}

	.flies i {
		position: absolute;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--color-moonlight);
		box-shadow:
			0 0 3px 1px var(--color-butter),
			0 0 10px 3px rgb(252 215 114 / 0.55);
		animation: drift 6s ease-in-out infinite;
	}

	:global(html:not(.dark)) .flies i {
		background: #f1b73e;
		box-shadow:
			0 0 2px 1px rgb(226 169 59 / 0.9),
			0 0 9px 3px rgb(252 215 114 / 0.75);
	}

	.flies i:nth-child(1) {
		left: 0.15rem;
		bottom: 0.25rem;
	}

	.flies i:nth-child(2) {
		left: 0.8rem;
		bottom: 0.85rem;
		scale: 0.8;
		animation-delay: -2s;
	}

	.flies i:nth-child(3) {
		left: 0.35rem;
		top: 0;
		scale: 0.6;
		animation-delay: -4s;
	}

	@keyframes drift {
		50% {
			opacity: 0.45;
			translate: 0.15rem -0.2rem;
		}
	}

	/* Empty format: the night of that format with the note in its sky ------------------------------------------ */

	.posts-area :global(.empty) {
		margin-top: clamp(2rem, 4.5vw, 3rem);
		aspect-ratio: 21 / 9;
	}

	@media (max-width: 40rem) {
		.posts-area :global(.empty) {
			aspect-ratio: 4 / 5;
		}
	}

	/* The sky brightens toward the horizon: an ink scrim from the top left keeps the note well over 4.5:1 */
	.posts-area :global(.empty .content) {
		background:
			radial-gradient(70% 80% at 0% 0%, rgb(14 15 16 / 0.85) 0 30%, rgb(14 15 16 / 0.55) 55%, transparent 80%),
			linear-gradient(to bottom, rgb(14 15 16 / 0.3), transparent 45%);
	}

	.empty-note {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		max-width: 22ch;
		padding: clamp(1.5rem, 6cqi, 3.5rem);
		color: var(--color-cream);
		font-family: var(--font-display);
		font-size: clamp(1.35rem, 3.6cqi, 2.25rem);
		font-weight: 900;
		letter-spacing: -0.035em;
		line-height: 1.08;
		text-wrap: balance;
		text-shadow: 0 1px 2px rgb(14 15 16 / 0.7);
	}

	.spark {
		flex: none;
		width: 0.3em;
		height: 0.3em;
		border-radius: 50%;
		background: var(--color-moonlight);
		box-shadow:
			0 0 3px 1px var(--color-butter),
			0 0 14px 4px rgb(252 215 114 / 0.6);
		translate: 0 -0.1em;
	}

	@media (prefers-reduced-motion: reduce) {
		.indicator {
			transition: none;
		}

		.flies i {
			animation: none;
		}
	}
</style>
