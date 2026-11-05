<script lang="ts">
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { FORMAT_LABELS } from '#lib/blog/content.ts';
	import MoonWatch from '#lib/blog/MoonWatch.svelte';
	import PostCard from '#lib/blog/PostCard.svelte';
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

	// Filter disc, measured from the chosen button and on track resize (font swap, viewport). Until then: CSS fallback.
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
	<div class="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-[34rem] mask-b-from-30% dark:block" aria-hidden="true">
		<StarField density={0.5} brightness={0.7} seed={53} />
	</div>

	<div class="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6 sm:pt-16 lg:px-8">
		<header class="grid items-end gap-x-10 gap-y-8 md:grid-cols-[1fr_auto]">
			<div class="grid gap-5">
				<h1 class="giant font-display leading-[0.8] font-black tracking-wordmark">{m.blog_index_title()}</h1>
				<p class="max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">{m.blog_index_intro()}</p>
				{#if otherLanguage}
					<p class="text-sm text-muted-foreground" lang={getLocale()}>{m.blog_index_lang_note()}</p>
				{/if}
			</div>
			<MoonWatch class="justify-self-end max-md:-order-1 max-md:-mb-10" />
		</header>

		<div class="-mx-4 mt-12 [scrollbar-width:none] overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
			<div
				role="group"
				aria-label={m.blog_filter_label()}
				class={['track relative flex w-max gap-0.5 rounded-full bg-foreground/[0.06] p-1 ring-1 ring-foreground/10 ring-inset', indicator && 'is-measured']}
				bind:this={track}
			>
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
			<ul class="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
				{#each visible as post, index (post.slug)}
					{@const featured = index === 0 && !format}
					<li class={featured ? 'md:col-span-2 lg:col-span-3' : ''}>
						<PostCard {post} {featured} eager={index === 0} />
					</li>
				{/each}
			</ul>
		{:else}
			<p class="mt-10 rounded-[1.25rem] border border-dashed border-border px-6 py-12 text-center text-muted-foreground">{m.blog_empty()}</p>
		{/if}
	</div>
</div>

<style>
	.giant {
		font-size: clamp(5.5rem, 16vw, 11rem);
		/* Ink on paper; moonlit at night (as the big number on /stats) */
		background: linear-gradient(180deg, var(--foreground) 55%, color-mix(in oklab, var(--foreground) 70%, var(--color-ochre)));
		background-clip: text;
		color: transparent;
		/* room for the g's descender inside the clipped background */
		padding-bottom: 0.16em;
		margin-bottom: -0.16em;
	}

	:global(.dark) .giant {
		background: linear-gradient(180deg, var(--color-cream) 40%, var(--color-butter));
		background-clip: text;
		text-shadow: 0 0 60px rgb(252 215 114 / 0.15);
	}

	/* Pill track (as the /stats period switch); the disc slides to the chosen format */
	.filter {
		position: relative;
		z-index: 1;
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		padding: 0 1.1rem;
		border-radius: 999px;
		color: var(--muted-foreground);
		font-size: 0.9375rem;
		font-weight: 500;
		white-space: nowrap;
		transition: color 300ms ease;
	}

	.filter:hover {
		color: var(--foreground);
	}

	.filter[aria-pressed='true'] {
		color: var(--color-night);
	}

	/* Unmeasured (SSR, no JS): the chosen pill paints its own disc */
	.track:not(.is-measured) .filter[aria-pressed='true'] {
		background: var(--color-butter);
	}

	.filter:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}

	.indicator {
		position: absolute;
		top: 0.25rem;
		bottom: 0.25rem;
		left: 0;
		border-radius: 999px;
		background: var(--color-butter);
		box-shadow: 0 2px 16px -2px rgb(252 215 114 / 0.6);
		transition:
			translate 500ms cubic-bezier(0.3, 1.35, 0.5, 1),
			width 500ms cubic-bezier(0.3, 1.35, 0.5, 1);
	}

	@media (prefers-reduced-motion: reduce) {
		.indicator {
			transition: none;
		}
	}
</style>
