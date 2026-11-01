<script lang="ts">
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { page } from '$app/state';
	import { FORMAT_LABELS, formatDate, formatTimestamp, isoDuration, jsonLdScript, loadPostBody, postHref } from '#lib/blog/content.ts';
	import { getPost } from '#lib/blog/posts.remote.ts';
	import VideoFacade from '#lib/blog/VideoFacade.svelte';
	import { thumbnailPath } from '#lib/home/sections/cinema/thumbnail.ts';
	import { YOUTUBE_CHANNEL_URL } from '#lib/home/data/socials.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	// Data and the rendered body chunk load in parallel
	const [post, Body] = $derived(await Promise.all([getPost(params.slug), loadPostBody(params.slug)]));

	let video = $state<VideoFacade>();

	const origin = $derived(page.url.origin);
	// A post exists in its own language only: canonical and hreflang point to that URL (the root layout skips its
	// alternates on this route).
	const canonical = $derived(new URL(postHref(post), origin).href);
	const image = $derived(post.youtubeId ? new URL(thumbnailPath(post.youtubeId), origin).href : null);
	const watchUrl = $derived(post.youtubeId ? `https://www.youtube.com/watch?v=${post.youtubeId}` : null);
	const transcriptText = $derived(post.transcript.map((segment) => segment.text).join(' '));

	const graph = (nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes });

	const structuredData = $derived.by(() => {
		const author = { '@type': 'Person', name: 'Solo Stack', url: new URL(localizeHref('/'), origin).href, sameAs: [YOUTUBE_CHANNEL_URL] };
		const blogPosting = {
			'@type': 'BlogPosting',
			headline: post.title,
			description: post.description,
			datePublished: post.publishedAt,
			dateModified: post.updatedAt ?? post.publishedAt,
			inLanguage: post.lang,
			mainEntityOfPage: canonical,
			url: canonical,
			author,
			publisher: author,
			keywords: post.tags.join(', ') || undefined,
			image: image ?? undefined
		};
		if (!post.youtubeId || !image || !watchUrl) return graph([blogPosting]);
		const videoObject = {
			'@type': 'VideoObject',
			'@id': `${canonical}#video`,
			name: post.title,
			description: post.description,
			thumbnailUrl: [image],
			uploadDate: post.publishedAt,
			duration: post.durationSeconds ? isoDuration(post.durationSeconds) : undefined,
			embedUrl: `https://www.youtube-nocookie.com/embed/${post.youtubeId}`,
			contentUrl: watchUrl,
			inLanguage: post.lang,
			transcript: transcriptText || undefined,
			hasPart: post.chapters.length
				? post.chapters.map((chapter, index) => ({
						'@type': 'Clip',
						name: chapter.title,
						startOffset: chapter.start,
						endOffset: post.chapters[index + 1]?.start ?? post.durationSeconds ?? undefined,
						url: `${watchUrl}&t=${chapter.start}s`
					}))
				: undefined
		};
		return graph([{ ...blogPosting, video: { '@id': videoObject['@id'] } }, videoObject]);
	});

	function seek(event: MouseEvent, seconds: number) {
		if (!video || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
		event.preventDefault();
		video.seek(seconds);
	}
</script>

<svelte:head>
	<title>{post.title} · SOLO STACK</title>
	<meta name="description" content={post.description} />
	<link rel="canonical" href={canonical} />
	<link rel="alternate" hreflang={post.lang} href={canonical} />
	<link rel="alternate" hreflang="x-default" href={canonical} />
	<meta property="og:type" content="article" />
	<meta property="og:site_name" content="SOLO STACK" />
	<meta property="og:title" content={post.title} />
	<meta property="og:description" content={post.description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:locale" content={post.lang === 'de' ? 'de_DE' : 'en_US'} />
	<meta property="article:published_time" content={post.publishedAt} />
	{#if post.updatedAt}<meta property="article:modified_time" content={post.updatedAt} />{/if}
	{#each post.tags as tag, index (index)}<meta property="article:tag" content={tag} />{/each}
	{#if image}
		<meta property="og:image" content={image} />
		<meta property="og:image:width" content="1280" />
		<meta property="og:image:height" content="720" />
		<meta name="twitter:image" content={image} />
	{/if}
	<meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
	<meta name="twitter:title" content={post.title} />
	<meta name="twitter:description" content={post.description} />
	{@html jsonLdScript(structuredData)}
</svelte:head>

<article class="post" lang={post.lang}>
	<header class="mx-auto max-w-3xl px-4 pt-8 sm:px-8 sm:pt-12">
		<a
			href={localizeHref('/blog')}
			class="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
		>
			<ArrowLeftIcon class="size-4" aria-hidden="true" />
			{m.blog_post_back()}
		</a>

		<p class="meta mt-6">
			<span class="format">{FORMAT_LABELS[post.format]()}</span>
			<time datetime={post.publishedAt}>{formatDate(post.publishedAt, post.lang)}</time>
			<span aria-hidden="true">·</span>
			<span>{m.blog_reading_time({ minutes: post.readingMinutes })}</span>
		</p>
		<h1 class="mt-4 font-display text-4xl leading-tight font-black tracking-tight text-balance sm:text-5xl">{post.title}</h1>
		{#if post.tags.length}
			<ul class="mt-5 flex flex-wrap gap-2" aria-label={m.blog_tags_label()}>
				{#each post.tags as tag, index (index)}
					<li class="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{tag}</li>
				{/each}
			</ul>
		{/if}
	</header>

	<div class="mx-auto mt-8 max-w-4xl px-4 sm:mt-10 sm:px-8">
		<VideoFacade bind:this={video} youtubeId={post.youtubeId} title={post.title} />
		{#if watchUrl}
			<p class="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
				<span>{m.blog_video_privacy_note()}</span>
				<a href={watchUrl} target="_blank" rel="noopener" class="inline-flex min-h-11 items-center gap-1 font-medium text-foreground hover:underline">
					{m.blog_video_youtube_link()}
					<ArrowUpRightIcon class="size-3.5" aria-hidden="true" />
				</a>
			</p>
		{/if}
	</div>

	<div class="mx-auto grid max-w-3xl gap-12 px-4 pt-12 pb-20 sm:px-8">
		{#if post.summary}
			<section aria-labelledby="summary-title" class="summary">
				<h2 id="summary-title" class="eyebrow">{m.blog_summary_title()}</h2>
				<p class="mt-3 text-lg leading-relaxed text-pretty">{post.summary}</p>
			</section>
		{/if}

		{#if post.chapters.length}
			<section aria-labelledby="chapters-title">
				<h2 id="chapters-title" class="section-title">{m.blog_chapters_title()}</h2>
				<ol class="chapters mt-4">
					{#each post.chapters as chapter, index (index)}
						{@const time = formatTimestamp(chapter.start)}
						<li>
							<a
								href={watchUrl ? `${watchUrl}&t=${chapter.start}s` : undefined}
								aria-label={m.blog_chapter_seek({ time, title: chapter.title })}
								onclick={(event) => seek(event, chapter.start)}
							>
								<span class="time">{time}</span>
								<span>{chapter.title}</span>
							</a>
						</li>
					{/each}
				</ol>
			</section>
		{/if}

		{#if post.takeaways.length}
			<section aria-labelledby="takeaways-title">
				<h2 id="takeaways-title" class="section-title">{m.blog_takeaways_title()}</h2>
				<ul class="takeaways mt-4">
					{#each post.takeaways as takeaway, index (index)}
						<li>{takeaway}</li>
					{/each}
				</ul>
			</section>
		{/if}

		<div class="prose-post">
			<Body />
		</div>

		{#if post.transcript.length}
			<section aria-labelledby="transcript-title">
				<h2 id="transcript-title" class="section-title">{m.blog_transcript_title()}</h2>
				<details class="transcript mt-4">
					<summary>
						<span>{m.blog_transcript_show()}</span>
						<ChevronDownIcon class="chevron size-4" aria-hidden="true" />
					</summary>
					<div class="transcript-body">
						{#each post.transcript as segment, index (index)}
							<p>
								{#if watchUrl}
									<a href={`${watchUrl}&t=${segment.start}s`} class="time" onclick={(event) => seek(event, segment.start)}>{formatTimestamp(segment.start)}</a>
								{/if}
								{segment.text}
							</p>
						{/each}
					</div>
				</details>
			</section>
		{/if}

		{#if post.links.length}
			<section aria-labelledby="links-title">
				<h2 id="links-title" class="section-title">{m.blog_links_title()}</h2>
				<ul class="links mt-4">
					{#each post.links as link, index (index)}
						<li>
							<a href={link.url} target="_blank" rel="noopener">
								<span>{link.label}</span>
								<span class="host">{new URL(link.url).host.replace(/^www\./, '')}{new URL(link.url).pathname.replace(/\/$/, '')}</span>
								<ArrowUpRightIcon class="arrow size-4" aria-hidden="true" />
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<p class="generated">
			<span class="moon" aria-hidden="true"></span>
			{m.blog_generated_note({ model: post.generatedBy })}
		</p>
	</div>
</article>

<style>
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem 0.6rem;
		color: var(--muted-foreground);
		font-size: 0.875rem;
		font-variant-numeric: tabular-nums;
	}

	.format {
		padding: 0.2rem 0.7rem;
		border-radius: 999px;
		background: color-mix(in oklab, var(--color-butter) 55%, transparent);
		color: var(--color-night);
		font-weight: 600;
	}

	:global(.dark) .format {
		background: color-mix(in oklab, var(--color-butter) 16%, transparent);
		color: var(--color-butter);
	}

	.eyebrow {
		color: var(--muted-foreground);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: var(--tracking-clock);
		text-transform: uppercase;
	}

	.section-title {
		font-size: 1.5rem;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	/* Summary: a sheet of butter paper with a pigment edge on the left */
	.summary {
		position: relative;
		padding: 1.5rem 1.5rem 1.5rem 1.75rem;
		border-radius: calc(var(--radius) + 0.25rem);
		background: color-mix(in oklab, var(--color-butter) 22%, var(--card));
		overflow: hidden;
	}

	.summary::before {
		content: '';
		position: absolute;
		inset: 0 auto 0 0;
		width: 0.3rem;
		background: linear-gradient(var(--color-butter), var(--color-ochre));
	}

	:global(.dark) .summary {
		background: color-mix(in oklab, var(--color-butter) 7%, var(--card));
	}

	/* Chapters ----------------------------------------------------------------------------------------------- */

	.chapters {
		display: grid;
		border-top: 1px solid var(--border);
	}

	.chapters li {
		border-bottom: 1px solid var(--border);
	}

	.chapters a {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		min-height: 2.75rem;
		padding: 0.6rem 0.5rem;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: background-color 150ms ease;
	}

	.chapters a:hover {
		background: var(--muted);
	}

	.time {
		min-width: 3.5rem;
		color: var(--focus-ring);
		font-family: var(--font-mono);
		font-size: 0.875rem;
		font-variant-numeric: tabular-nums;
	}

	/* Takeaways ---------------------------------------------------------------------------------------------- */

	.takeaways {
		display: grid;
		gap: 0.85rem;
	}

	.takeaways li {
		position: relative;
		padding-left: 2rem;
		font-size: 1.0625rem;
		line-height: 1.6;
	}

	/* A small butter moon as the bullet */
	.takeaways li::before,
	.generated .moon {
		content: '';
		position: absolute;
		left: 0.2rem;
		top: 0.45em;
		width: 0.85rem;
		height: 0.85rem;
		border-radius: 999px;
		background: radial-gradient(circle at 70% 35%, transparent 0 46%, var(--color-butter) 48%);
		box-shadow: 0 0 0.6rem color-mix(in oklab, var(--color-butter) 40%, transparent);
		rotate: -20deg;
	}

	:global(html:not(.dark)) .takeaways li::before,
	:global(html:not(.dark)) .generated .moon {
		background: radial-gradient(circle at 70% 35%, transparent 0 46%, var(--color-ochre) 48%);
	}

	/* Transcript --------------------------------------------------------------------------------------------- */

	.transcript {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--card);
	}

	.transcript summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 3rem;
		padding: 0 1rem;
		font-weight: 600;
		cursor: pointer;
		list-style: none;
	}

	.transcript summary::-webkit-details-marker {
		display: none;
	}

	.transcript :global(.chevron) {
		transition: rotate 200ms ease;
	}

	.transcript[open] :global(.chevron) {
		rotate: 180deg;
	}

	.transcript-body {
		display: grid;
		gap: 0.75rem;
		max-height: 32rem;
		overflow-y: auto;
		padding: 0.5rem 1rem 1.25rem;
		color: var(--muted-foreground);
		line-height: 1.7;
	}

	.transcript-body .time {
		display: inline-block;
		min-width: auto;
		margin-right: 0.5rem;
	}

	/* Links -------------------------------------------------------------------------------------------------- */

	.links {
		display: grid;
		gap: 0.5rem;
	}

	.links a {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 0 1rem;
		min-height: 3.5rem;
		padding: 0.6rem 1rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--card);
		transition: border-color 150ms ease;
	}

	.links a:hover {
		border-color: color-mix(in oklab, var(--color-ochre) 60%, var(--border));
	}

	.links a > span:first-child {
		font-weight: 600;
	}

	.host {
		grid-row: 2;
		color: var(--muted-foreground);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		overflow-wrap: anywhere;
	}

	.links :global(.arrow) {
		grid-row: 1 / span 2;
		grid-column: 2;
		color: var(--muted-foreground);
	}

	.generated {
		position: relative;
		padding: 1.25rem 0 0 2rem;
		border-top: 1px solid var(--border);
		color: var(--muted-foreground);
		font-size: 0.875rem;
	}

	.generated .moon {
		top: calc(1.25rem + 0.3em);
	}

	/* Article body (mdsvex) ----------------------------------------------------------------------------------- */

	.prose-post {
		max-width: 68ch;
		font-size: 1.125rem;
		line-height: 1.8;
		text-wrap: pretty;
		hyphens: auto;
	}

	.prose-post :global(> * + *) {
		margin-top: 1.25em;
	}

	.prose-post :global(h2) {
		margin-top: 2.4em;
		font-size: 1.6rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		line-height: 1.25;
		text-wrap: balance;
		hyphens: manual;
	}

	.prose-post :global(h2::before) {
		content: '';
		display: block;
		width: 2.5rem;
		height: 3px;
		margin-bottom: 0.9rem;
		border-radius: 3px;
		background: var(--color-butter);
	}

	.prose-post :global(h3) {
		margin-top: 2em;
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1.35;
	}

	.prose-post :global(h2 + *),
	.prose-post :global(h3 + *) {
		margin-top: 0.75em;
	}

	.prose-post :global(> :first-child) {
		margin-top: 0;
	}

	/* The opening paragraph reads a little larger, like a lede */
	.prose-post :global(> p:first-child) {
		font-size: 1.2rem;
		color: var(--foreground);
	}

	.prose-post :global(a) {
		text-decoration: underline;
		text-decoration-color: var(--color-ochre);
		text-decoration-thickness: 2px;
		text-underline-offset: 0.2em;
	}

	.prose-post :global(strong) {
		font-weight: 700;
	}

	.prose-post :global(ul),
	.prose-post :global(ol) {
		display: grid;
		gap: 0.4em;
		padding-left: 1.4em;
	}

	.prose-post :global(ul) {
		list-style: disc;
	}

	.prose-post :global(ol) {
		list-style: decimal;
	}

	.prose-post :global(li::marker) {
		color: var(--color-ochre);
	}

	.prose-post :global(blockquote) {
		padding-left: 1.2em;
		border-left: 3px solid var(--color-butter);
		color: var(--muted-foreground);
		font-style: italic;
	}

	.prose-post :global(code) {
		padding: 0.12em 0.4em;
		border-radius: 0.35em;
		background: var(--muted);
		font-family: var(--font-mono);
		font-size: 0.86em;
	}

	.prose-post :global(pre) {
		overflow-x: auto;
		padding: 1rem 1.25rem;
		border-radius: var(--radius);
		background: var(--color-night);
		color: var(--color-cream);
		font-size: 0.9rem;
		line-height: 1.6;
	}

	.prose-post :global(pre code) {
		padding: 0;
		background: none;
	}

	.prose-post :global(hr) {
		border: 0;
		border-top: 1px solid var(--border);
	}
</style>
