<script lang="ts">
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { FORMAT_LABELS } from '#lib/blog/content.ts';
	import FormatVignette from '#lib/blog/FormatVignette.svelte';
	import PostCard from '#lib/blog/PostCard.svelte';
	import ReadingHill from '#lib/blog/ReadingHill.svelte';
	import { getPosts } from '#lib/blog/posts.remote.ts';
	import { POST_FORMATS, type PostFormat } from '#lib/blog/schema.ts';
	import StarField from '#lib/home/shared/StarField.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	const posts = $derived(await getPosts());

	// Client side filter (the page is prerendered once), mirrored to `?format=` so a filtered view can be shared.
	let format = $state<PostFormat | null>(null);
	const visible = $derived(format ? posts.filter((post) => post.format === format) : posts);
	const otherLanguage = $derived(posts.some((post) => post.lang !== getLocale()));

	$effect(() => {
		const initial = new URLSearchParams(location.search).get('format');
		if (initial && (POST_FORMATS as readonly string[]).includes(initial)) format = initial as PostFormat;
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
	let indicator = $state<{ x: number; w: number } | null>(null);

	$effect(() => {
		if (!track) return;
		const element = track;
		void format;
		const measure = () => {
			const button = element.querySelector<HTMLElement>('[aria-pressed="true"]');
			if (button) indicator = { x: button.offsetLeft, w: button.offsetWidth };
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
	<!-- TODO(owner): RSS feed for the blog (/blog/rss.xml) and sitemap.xml (super-sitemap) once the launch pages exist -->
</svelte:head>

<div class="relative isolate overflow-x-clip">
	<!-- Night sky over the header, dark theme only -->
	<div class="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-[40rem] mask-b-from-30% dark:block" aria-hidden="true">
		<StarField density={0.5} brightness={0.7} seed={53} />
	</div>

	<!-- The reading hill: title and intro set into the empty sky of the art (phones: the art moves below the title) -->
	<header class="hill-header">
		<div class="hill-art"><ReadingHill sizes="(min-width: 48rem) min(94vw, 90rem), 165vw" /></div>
		<div class="hill-copy mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
			<h1 class="giant font-display leading-[0.8] font-black tracking-wordmark">{m.blog_index_title()}</h1>
			<p class="intro mt-6 text-pretty text-muted-foreground">{m.blog_index_intro()}</p>
			{#if otherLanguage}
				<p class="mt-3 text-sm text-muted-foreground" lang={getLocale()}>{m.blog_index_lang_note()}</p>
			{/if}
		</div>
	</header>

	<div class="posts-area mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
		<div class="-mx-4 [scrollbar-width:none] overflow-x-auto px-4 sm:mx-0 sm:px-0">
			<div role="group" aria-label={m.blog_filter_label()} class={['filters', indicator && 'is-measured']} bind:this={track}>
				{#if indicator}
					<span class="indicator" style:translate="{indicator.x}px 0" style:width="{indicator.w}px" aria-hidden="true"></span>
				{/if}
				<button type="button" class="filter" aria-pressed={format === null} onclick={() => choose(null)}>{m.blog_filter_all()}</button>
				{#each POST_FORMATS as option (option)}
					<button type="button" class="filter" aria-pressed={format === option} onclick={() => choose(option)}>{FORMAT_LABELS[option]()}</button>
				{/each}
			</div>
		</div>

		{#if visible.length}
			<ul class="posts">
				{#each visible as post, index (post.slug)}
					{@const featured = index === 0 && !format}
					<li class={featured ? 'is-featured' : 'is-row'}>
						<PostCard {post} {featured} eager={index === 0} />
					</li>
				{/each}
			</ul>
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
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	.hill-copy {
		position: relative;
		z-index: 1;
		padding-top: clamp(2.5rem, 8vw, 4rem);
	}

	/* Phones: the art bleeds off the right edge below the title; its empty sky slides up under the intro */
	.hill-art {
		--art-w: 165vw;
		order: 2;
		width: var(--art-w);
		max-width: none;
		/* right edges flush: the painted right part shows, the empty sky hangs off the left */
		margin: -3.5rem 0 0 calc(100% - var(--art-w));
	}

	/*
	 * From md the art spans almost the whole width, anchored bottom right: its empty left sky holds the title, its empty
	 * top tenth rises above the header (transparent), so the header is only as tall as the painted part.
	 */
	@media (min-width: 48rem) {
		.hill-header {
			--art-w: min(94vw, 90rem);
			min-height: calc(var(--art-w) * 941 / 1672 * 0.9);
			align-items: center;
		}

		.hill-art {
			--art-w: min(94vw, 90rem);
			position: absolute;
			right: 0;
			bottom: 0;
			margin: 0;
		}

		.hill-copy {
			padding-block: 2rem 5rem;
		}
	}

	.giant {
		font-size: clamp(6.5rem, 17vw, 13.5rem);
		/* Ink on paper; lit from behind at night */
		background: linear-gradient(180deg, var(--foreground) 55%, color-mix(in oklab, var(--foreground) 70%, var(--color-ochre)));
		background-clip: text;
		color: transparent;
		/* room for the g's descender inside the clipped background */
		padding-bottom: 0.16em;
		margin-bottom: -0.16em;
		margin-left: -0.05em;
	}

	:global(.dark) .giant {
		background: linear-gradient(180deg, var(--color-cream) 38%, var(--color-butter));
		background-clip: text;
		text-shadow: 0 0 80px rgb(252 215 114 / 0.18);
	}

	.intro {
		max-width: 34rem;
		font-size: clamp(1.0625rem, 1.5vw, 1.25rem);
		line-height: 1.6;
	}

	@media (min-width: 48rem) {
		.intro {
			max-width: min(34rem, 40vw);
		}
	}

	/* Format filter: words on a ruled line, the chosen one underlined with the brushed ink stroke --------------- */

	.filters {
		position: relative;
		display: flex;
		gap: 0 clamp(1.25rem, 3vw, 2.25rem);
		width: max-content;
		min-width: 100%;
		margin-top: clamp(1.5rem, 4vw, 2.5rem);
	}

	/* The rule the words stand on, thinning out at the ends like a brush line */
	.filters::before {
		content: '';
		position: absolute;
		inset: auto 0 0;
		height: 1px;
		background: linear-gradient(90deg, var(--border) 0 80%, transparent);
	}

	.filter {
		position: relative;
		z-index: 1;
		display: inline-flex;
		align-items: center;
		min-height: 3rem;
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
		inset: auto -0.2rem -0.3rem;
		height: 0.6rem;
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
		bottom: -0.3rem;
		left: 0;
		height: 0.6rem;
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
		padding-block: clamp(2.5rem, 6vw, 4rem) clamp(2.5rem, 6vw, 4.5rem);
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
		padding-top: clamp(2.5rem, 6vw, 3.5rem);
	}

	/* Empty format: the night of that format with the note in its sky ------------------------------------------ */

	.posts-area :global(.empty) {
		margin-top: clamp(2.5rem, 6vw, 3.5rem);
		aspect-ratio: 21 / 9;
	}

	@media (max-width: 40rem) {
		.posts-area :global(.empty) {
			aspect-ratio: 4 / 5;
		}
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
	}
</style>
