<script lang="ts">
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { page } from '$app/state';
	import { FORMAT_LABELS, formatDate, formatTimestamp, isoDuration, jsonLdScript, loadPostBody, postHref } from '#lib/blog/content.ts';
	import { getPost } from '#lib/blog/posts.remote.ts';
	import VideoFacade from '#lib/blog/VideoFacade.svelte';
	import wash from '#lib/components/site/assets/backlight-wash.webp?w=960&format=webp&quality=50&enhanced';
	import StarField from '#lib/home/shared/StarField.svelte';
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
	// A post exists in one language only: canonical and hreflang point to its URL (the root layout skips alternates here).
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

	/** Takeaway fireflies glow brighter down the list, 0.35…1. */
	const glow = (index: number, count: number) => (count > 1 ? 0.35 + (0.65 * index) / (count - 1) : 1);

	// TOC: current section = last heading above the upper third of the viewport.
	let current = $state<string | null>(null);
	$effect(() => {
		const headings = post.outline.map(({ id }) => document.getElementById(id)).filter((heading) => heading !== null);
		if (!headings.length) return;
		const update = () => {
			const line = innerHeight * 0.33;
			current = headings.findLast((heading) => heading.getBoundingClientRect().top < line)?.id ?? null;
		};
		const observer = new IntersectionObserver(update, { rootMargin: '0px 0px -67% 0px' });
		for (const heading of headings) observer.observe(heading);
		return () => observer.disconnect();
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

<!-- Reading progress hairline: CSS scroll timeline, no JS; absent where unsupported -->
<div class="progress" aria-hidden="true"></div>

<article class="post" lang={post.lang} style:--wash="url({wash.img.src})">
	<div class="relative isolate">
		<!-- Night sky over the header, dark theme only (as on /stats and /blog) -->
		<div class="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-[30rem] mask-b-from-30% dark:block" aria-hidden="true">
			<StarField density={0.45} brightness={0.65} seed={71} />
		</div>

		<header class="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-10 lg:px-8">
			<a href={localizeHref('/blog')} class="back">
				<ArrowLeftIcon class="size-4" aria-hidden="true" />
				{m.blog_post_back()}
			</a>

			<h1 class="headline mt-8 max-w-4xl font-display font-black tracking-wordmark text-balance sm:mt-10">{post.title}</h1>
			<!-- Byline under the title (no eyebrow): format as an ink label, date and reading time, then the topics -->
			<div class="byline mt-6">
				<p class="meta">
					<span class="format">{FORMAT_LABELS[post.format]()}</span>
					<span class="facts">
						<time datetime={post.publishedAt}>{formatDate(post.publishedAt, post.lang)}</time>
						<span aria-hidden="true">·</span>
						<span>{m.blog_reading_time({ minutes: post.readingMinutes })}</span>
					</span>
				</p>
				{#if post.tags.length}
					<ul class="tags" aria-label={m.blog_tags_label()}>
						{#each post.tags as tag, index (index)}
							<li>{tag}</li>
						{/each}
					</ul>
				{/if}
			</div>
		</header>

		<div class="mx-auto mt-10 max-w-6xl px-4 sm:mt-14 sm:px-6 lg:px-8">
			<div class="stage">
				<VideoFacade bind:this={video} youtubeId={post.youtubeId} title={post.title} format={post.format} />
			</div>
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
	</div>

	<!-- Reading column (~70 ch per line), sticky TOC from lg -->
	<div class="mx-auto grid max-w-6xl gap-x-16 px-4 pt-14 pb-24 sm:px-6 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_15rem] lg:px-8">
		<div class="grid min-w-0 content-start gap-14">
			{#if post.summary}
				<section aria-labelledby="summary-title" class="summary">
					<h2 id="summary-title" class="label-title">{m.blog_summary_title()}</h2>
					<p class="summary-text">{post.summary}</p>
				</section>
			{/if}

			{#if post.chapters.length}
				<section aria-labelledby="chapters-title">
					<h2 id="chapters-title" class="section-title">{m.blog_chapters_title()}</h2>
					<ol class="chapters mt-5">
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
					<!-- Fireflies as bullets, glowing brighter down the list (as they rise from the laptop on /blog) -->
					<ul class="takeaways mt-6">
						{#each post.takeaways as takeaway, index (index)}
							<li style:--glow={glow(index, post.takeaways.length)}>
								<span class="firefly" aria-hidden="true"></span>
								{takeaway}
							</li>
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
					<details class="transcript mt-5">
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
					<ul class="links mt-5">
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
				<span class="firefly" aria-hidden="true"></span>
				{m.blog_generated_note({ model: post.generatedBy })}
			</p>
		</div>

		{#if post.outline.length}
			<aside class="hidden lg:block">
				<nav class="toc" aria-labelledby="toc-title">
					<p id="toc-title" class="toc-title">
						<!-- A firefly that lights up while you read (same scroll timeline as the progress hairline) -->
						<span class="toc-fly" aria-hidden="true"></span>
						{m.blog_toc_title()}
					</p>
					<ol class="toc-list">
						{#each post.outline as section (section.id)}
							<li><a href="#{section.id}" aria-current={current === section.id ? 'location' : undefined}>{section.title}</a></li>
						{/each}
					</ol>
				</nav>
			</aside>
		{/if}
	</div>
</article>

<style>
	/* Shared marks ---------------------------------------------------------------------------------------------- */

	/* A firefly: moonlight core, butter halo (ochre core on paper, where moonlight would vanish) */
	.firefly,
	.toc-fly {
		display: block;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--color-moonlight);
		box-shadow:
			0 0 3px 1px var(--color-butter),
			0 0 12px 3px rgb(252 215 114 / 0.55);
	}

	:global(html:not(.dark)) :is(.firefly, .toc-fly) {
		background: #f1b73e;
		box-shadow:
			0 0 2px 1px rgb(226 169 59 / 0.9),
			0 0 10px 3px rgb(252 215 114 / 0.75);
	}

	/* Header ------------------------------------------------------------------------------------------------- */

	.back {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 2.75rem;
		margin-left: -0.25rem;
		padding: 0 0.25rem;
		color: var(--muted-foreground);
		font-size: 0.875rem;
		font-weight: 500;
		transition: color var(--dur-hover) ease;
	}

	.back :global(svg) {
		transition: translate var(--dur-state) cubic-bezier(0.3, 1.35, 0.5, 1);
	}

	.back:hover {
		color: var(--foreground);
	}

	.back:hover :global(svg) {
		translate: -0.25rem 0;
	}

	.headline {
		font-size: clamp(2.4rem, 6vw, 4.75rem);
		line-height: 0.96;
		padding-bottom: 0.08em;
		/* Ink on paper; lit from behind at night (as the title on /blog) */
		background: linear-gradient(180deg, var(--foreground) 55%, color-mix(in oklab, var(--foreground) 70%, var(--color-ochre)));
		background-clip: text;
		color: transparent;
	}

	:global(.dark) .headline {
		background: linear-gradient(180deg, var(--color-cream) 42%, var(--color-butter));
		background-clip: text;
	}

	.byline {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.75rem 2rem;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.4rem 1rem;
		color: var(--muted-foreground);
		font-size: 0.9375rem;
		font-variant-numeric: tabular-nums;
	}

	.facts {
		display: inline-flex;
		gap: 0.5rem;
	}

	/* Format as an ink label led by a brush dash (as on the index), no pill */
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

	/* Topics as a quiet run of words, slashes between */
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0;
		color: var(--muted-foreground);
		font-size: 0.875rem;
	}

	/* after each word, so a wrapped line never starts with a slash */
	.tags li:not(:last-child)::after {
		content: '/';
		margin: 0 0.6rem;
		color: color-mix(in oklab, var(--muted-foreground) 50%, transparent);
	}

	/* The video sits in a pigment bloom: backlight at night, a butter wash on paper */
	.stage {
		position: relative;
		isolation: isolate;
	}

	.stage::before {
		content: '';
		position: absolute;
		inset: -14% -8% -10%;
		z-index: -1;
		background: var(--wash) center / 100% 100% no-repeat;
		opacity: 0.5;
		mix-blend-mode: multiply;
		pointer-events: none;
	}

	:global(.dark) .stage::before {
		opacity: 0.2;
		mix-blend-mode: normal;
	}

	/* Section titles ------------------------------------------------------------------------------------------ */

	/* Geist Black over a small pigment wash */
	.section-title {
		position: relative;
		isolation: isolate;
		width: fit-content;
		font-family: var(--font-display);
		font-size: clamp(1.6rem, 3vw, 2.1rem);
		font-weight: 900;
		letter-spacing: -0.035em;
		line-height: 1.1;
	}

	.section-title::before {
		content: '';
		position: absolute;
		top: 30%;
		left: -0.75rem;
		z-index: -1;
		width: calc(100% + 1.5rem);
		max-width: 16rem;
		height: 110%;
		background: var(--wash) center / 100% 100% no-repeat;
		opacity: 0.6;
		mix-blend-mode: multiply;
		rotate: -2deg;
		pointer-events: none;
	}

	:global(.dark) .section-title::before {
		opacity: 0.18;
		mix-blend-mode: normal;
	}

	/* Small label heading with the brushed ink stroke under it (summary) */
	.label-title {
		position: relative;
		width: fit-content;
		color: var(--ink-lit);
		font-family: var(--font-mono);
		font-size: var(--text-label);
		font-weight: 600;
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
	}

	.label-title::after {
		content: '';
		position: absolute;
		inset: auto -0.2rem -0.55rem;
		height: 0.5rem;
		background: currentColor;
		mask: var(--ink-underline) center / 100% 100% no-repeat;
		opacity: 0.7;
	}

	/* Summary: the lede of the page, set large on a pigment wash, no box */
	.summary {
		position: relative;
		isolation: isolate;
		max-width: 46rem;
	}

	.summary::before {
		content: '';
		position: absolute;
		inset: -2.5rem -3rem -2rem -3.5rem;
		z-index: -1;
		background: var(--wash) center / 100% 100% no-repeat;
		opacity: 0.28;
		mix-blend-mode: multiply;
		pointer-events: none;
	}

	:global(.dark) .summary::before {
		opacity: 0.08;
		mix-blend-mode: normal;
	}

	.summary-text {
		margin-top: 1.5rem;
		font-size: clamp(1.25rem, 2.2vw, 1.5rem);
		font-weight: 500;
		letter-spacing: -0.012em;
		line-height: 1.5;
		text-wrap: pretty;
	}

	/* Chapters ----------------------------------------------------------------------------------------------- */

	.chapters {
		display: grid;
	}

	.chapters li {
		position: relative;
	}

	.chapters li + li::before,
	.links li + li::before {
		content: '';
		position: absolute;
		inset: 0 0 auto;
		height: 1px;
		background: linear-gradient(90deg, var(--border) 0 85%, transparent);
	}

	.chapters a {
		display: flex;
		align-items: baseline;
		gap: 1.25rem;
		min-height: 3rem;
		padding: 0.75rem 0.25rem;
		cursor: pointer;
		transition: color var(--dur-hover) ease;
	}

	.chapters a:hover .time {
		color: var(--foreground);
		text-shadow: var(--glow-sm);
	}

	.time {
		min-width: 3.5rem;
		color: var(--ink-lit);
		font-family: var(--font-mono);
		font-size: 0.875rem;
		font-variant-numeric: tabular-nums;
		transition:
			color var(--dur-hover) ease,
			text-shadow var(--dur-hover) ease;
	}

	/* Takeaways ---------------------------------------------------------------------------------------------- */

	.takeaways {
		display: grid;
		gap: 1.1rem;
		max-width: 46rem;
	}

	.takeaways li {
		position: relative;
		padding-left: 2.1rem;
		font-size: 1.0625rem;
		line-height: 1.6;
		text-wrap: pretty;
	}

	.takeaways .firefly {
		position: absolute;
		left: 0.35rem;
		top: 0.55em;
		opacity: calc(0.45 + var(--glow) * 0.55);
		scale: calc(0.75 + var(--glow) * 0.35);
	}

	/* Transcript --------------------------------------------------------------------------------------------- */

	.transcript {
		position: relative;
	}

	.transcript::before,
	.transcript::after {
		content: '';
		position: absolute;
		inset: 0 0 auto;
		height: 1px;
		background: linear-gradient(90deg, var(--border) 0 85%, transparent);
	}

	.transcript::after {
		inset: auto 0 0;
	}

	.transcript summary {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-height: 3.25rem;
		padding: 0 0.25rem;
		font-weight: 600;
		cursor: pointer;
		list-style: none;
		transition: color var(--dur-hover) ease;
	}

	.transcript summary:hover {
		color: var(--ink-lit);
	}

	.transcript summary::-webkit-details-marker {
		display: none;
	}

	.transcript :global(.chevron) {
		transition: rotate var(--dur-state) ease;
	}

	.transcript[open] :global(.chevron) {
		rotate: 180deg;
	}

	.transcript-body {
		display: grid;
		gap: 0.85rem;
		max-height: 32rem;
		overflow-y: auto;
		margin-bottom: 1.25rem;
		padding: 0.25rem 1rem 0.5rem 1.25rem;
		border-left: 2px solid color-mix(in oklab, var(--color-butter) 60%, transparent);
		color: var(--muted-foreground);
		line-height: 1.75;
		scrollbar-width: thin;
	}

	.transcript-body .time {
		display: inline-block;
		min-width: auto;
		margin-right: 0.6rem;
	}

	/* Links -------------------------------------------------------------------------------------------------- */

	.links {
		display: grid;
	}

	.links li {
		position: relative;
	}

	.links a {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 0.15rem 1rem;
		min-height: 3.75rem;
		padding: 0.85rem 0.25rem;
	}

	.links a > span:first-child {
		font-weight: 600;
		text-decoration: underline;
		text-decoration-color: transparent;
		text-decoration-thickness: 2px;
		text-underline-offset: 0.2em;
		transition: text-decoration-color var(--dur-state) ease;
	}

	.links a:hover > span:first-child {
		text-decoration-color: var(--color-ochre);
	}

	:global(.dark) .links a:hover > span:first-child {
		text-decoration-color: var(--color-butter);
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
		transition:
			translate var(--dur-state) cubic-bezier(0.3, 1.35, 0.5, 1),
			color var(--dur-state) ease;
	}

	.links a:hover :global(.arrow) {
		translate: 0.2rem -0.2rem;
		color: var(--ink-lit);
	}

	/* Generated note ----------------------------------------------------------------------------------------- */

	.generated {
		position: relative;
		padding: 1.5rem 0 0 1.75rem;
		color: var(--muted-foreground);
		font-size: 0.875rem;
	}

	.generated::before {
		content: '';
		position: absolute;
		inset: 0 0 auto;
		height: 1px;
		background: linear-gradient(90deg, var(--border) 0 85%, transparent);
	}

	.generated .firefly {
		position: absolute;
		left: 0.2rem;
		top: calc(1.5rem + 0.45em);
		width: 0.45rem;
		height: 0.45rem;
	}

	/* Reading progress ---------------------------------------------------------------------------------------- */

	.progress {
		display: none;
	}

	@supports (animation-timeline: scroll()) {
		.progress {
			position: fixed;
			inset: 0 0 auto;
			z-index: 60;
			display: block;
			height: 3px;
			background: linear-gradient(90deg, var(--color-ochre), var(--color-butter));
			box-shadow: 0 0 12px rgb(252 215 114 / 0.55);
			transform-origin: 0 50%;
			animation: read linear both;
			animation-timeline: scroll(root);
		}

		/* Same timeline: the TOC firefly lights up */
		.toc-fly {
			animation: kindle linear both;
			animation-timeline: scroll(root);
		}
	}

	@keyframes read {
		from {
			scale: 0 1;
		}
	}

	@keyframes kindle {
		from {
			opacity: 0.3;
			scale: 0.6;
		}
	}

	/* Table of contents ------------------------------------------------------------------------------------- */

	.toc {
		position: sticky;
		top: 6rem;
		display: grid;
		gap: 1rem;
		max-height: calc(100svh - 8rem);
		overflow-y: auto;
		scrollbar-width: none;
	}

	.toc-title {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		font-family: var(--font-display);
		font-size: 0.95rem;
		font-weight: 800;
		letter-spacing: -0.01em;
	}

	.toc-list {
		display: grid;
		border-left: 1px solid var(--border);
	}

	.toc-list a {
		position: relative;
		display: block;
		padding: 0.45rem 0 0.45rem 1rem;
		color: var(--muted-foreground);
		font-size: 0.875rem;
		line-height: 1.4;
		text-wrap: pretty;
		transition: color 200ms ease;
	}

	.toc-list a:hover {
		color: var(--foreground);
	}

	/* The current section: a lit mark on the rail */
	.toc-list a::before {
		content: '';
		position: absolute;
		top: 0.45rem;
		bottom: 0.45rem;
		left: -1.5px;
		width: 2px;
		border-radius: 2px;
		background: var(--color-ochre);
		box-shadow: 0 0 10px rgb(252 215 114 / 0.6);
		opacity: 0;
		scale: 1 0.3;
		transition:
			opacity 250ms ease,
			scale 350ms cubic-bezier(0.3, 1.35, 0.5, 1);
	}

	:global(.dark) .toc-list a::before {
		background: var(--color-butter);
	}

	.toc-list a[aria-current] {
		color: var(--foreground);
		font-weight: 600;
	}

	.toc-list a[aria-current]::before {
		opacity: 1;
		scale: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.toc-list a::before,
		.back :global(svg),
		.links :global(.arrow) {
			transition: none;
		}
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
		margin-top: 1.3em;
	}

	.prose-post :global(h2) {
		scroll-margin-top: 6rem;
		margin-top: 2.6em;
		font-family: var(--font-display);
		font-size: clamp(1.55rem, 2.6vw, 1.85rem);
		font-weight: 900;
		letter-spacing: -0.035em;
		line-height: 1.2;
		text-wrap: balance;
		hyphens: manual;
	}

	/* A short brushed ink stroke over each section */
	.prose-post :global(h2::before) {
		content: '';
		display: block;
		width: 3rem;
		height: 0.55rem;
		margin-bottom: 0.85rem;
		background: var(--ink-lit);
		mask: var(--ink-underline) center / 100% 100% no-repeat;
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

	/* Lede: the first paragraph a little larger */
	.prose-post :global(> p:first-child) {
		font-size: 1.22rem;
		color: var(--foreground);
	}

	.prose-post :global(p) {
		color: color-mix(in oklab, var(--foreground) 88%, var(--muted-foreground));
	}

	.prose-post :global(a) {
		text-decoration: underline;
		text-decoration-color: var(--color-ochre);
		text-decoration-thickness: 2px;
		text-underline-offset: 0.2em;
		transition: text-decoration-color var(--dur-hover) ease;
	}

	.prose-post :global(a:hover) {
		text-decoration-color: currentColor;
	}

	.prose-post :global(strong) {
		color: var(--foreground);
		font-weight: 700;
	}

	.prose-post :global(ul),
	.prose-post :global(ol) {
		display: grid;
		gap: 0.45em;
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
		position: relative;
		padding-left: 1.4em;
		color: var(--muted-foreground);
		font-size: 1.2rem;
		font-style: italic;
	}

	.prose-post :global(blockquote::before) {
		content: '';
		position: absolute;
		inset: 0.2em auto 0.2em 0;
		width: 3px;
		border-radius: 3px;
		background: linear-gradient(var(--color-butter), var(--color-ochre));
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
		border-radius: 0.5rem;
		background: var(--color-ink);
		color: var(--color-cream);
		font-size: 0.9rem;
		line-height: 1.6;
	}

	.prose-post :global(pre code) {
		padding: 0;
		background: none;
	}

	.prose-post :global(hr) {
		height: 0.6rem;
		margin-block: 2.5em;
		border: 0;
		background: var(--border);
		mask: var(--ink-underline) center / 6rem 100% no-repeat;
	}
</style>
