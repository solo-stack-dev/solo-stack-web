<script lang="ts">
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { FORMAT_LABELS } from '#lib/blog/content.ts';
	import NightScene from '#lib/blog/NightScene.svelte';
	import PostCard from '#lib/blog/PostCard.svelte';
	import { getPosts } from '#lib/blog/posts.remote.ts';
	import { POST_FORMATS, type PostFormat } from '#lib/blog/schema.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	const posts = $derived(await getPosts());

	// Format filter: client side (the page is prerendered once), mirrored to `?format=` so a filtered view can be shared.
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

<div class="mx-auto max-w-6xl px-4 pt-10 pb-20 sm:px-8 sm:pt-14">
	<header class="grid items-end gap-8 md:grid-cols-5">
		<div class="grid gap-4 md:col-span-3">
			<h1 class="font-display text-5xl font-black tracking-tight sm:text-6xl">{m.blog_index_title()}</h1>
			<p class="max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">{m.blog_index_intro()}</p>
			{#if otherLanguage}
				<p class="text-sm text-muted-foreground" lang={getLocale()}>{m.blog_index_lang_note()}</p>
			{/if}
		</div>
		<NightScene class="aspect-video rounded-2xl border border-border md:col-span-2" mascotSizes="(min-width: 48rem) 9rem, 28vw" eager />
	</header>

	<div role="group" aria-label={m.blog_filter_label()} class="mt-12 flex flex-wrap gap-2">
		<button type="button" class="filter" aria-pressed={format === null} onclick={() => choose(null)}>{m.blog_filter_all()}</button>
		{#each POST_FORMATS as option (option)}
			<button type="button" class="filter" aria-pressed={format === option} onclick={() => choose(option)}>{FORMAT_LABELS[option]()}</button>
		{/each}
	</div>

	{#if visible.length}
		<ul class="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each visible as post, index (post.slug)}
				{@const featured = index === 0 && !format}
				<li class={featured ? 'md:col-span-2 lg:col-span-3' : ''}>
					<PostCard {post} {featured} eager={index === 0} />
				</li>
			{/each}
		</ul>
	{:else}
		<p class="mt-8 rounded-2xl border border-dashed border-border px-6 py-12 text-center text-muted-foreground">{m.blog_empty()}</p>
	{/if}
</div>

<style>
	.filter {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		padding: 0 1.1rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--muted-foreground);
		font-size: 0.9375rem;
		font-weight: 500;
		transition:
			color 150ms ease,
			background-color 150ms ease,
			border-color 150ms ease;
	}

	.filter:hover {
		border-color: color-mix(in oklab, var(--foreground) 25%, transparent);
		color: var(--foreground);
	}

	.filter[aria-pressed='true'] {
		border-color: var(--primary);
		background: var(--primary);
		color: var(--primary-foreground);
	}
</style>
