<script lang="ts">
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { page } from '$app/state';
	import { FORMAT_LABELS, formatDate, formatTimestamp, isoDuration, jsonLdScript, loadPostBody, postHref } from '#lib/blog/content.ts';
	import { getPost } from '#lib/blog/posts.remote.ts';
	import VideoFacade from '#lib/blog/VideoFacade.svelte';
	import bloom from '#lib/home/sections/making/assets/making-bloom-chart.webp?w=480&format=webp&quality=40&enhanced';
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

	/** Lit part of a moon in a 16×16 box (light from the right), `lit` 0…1: crescent → half → full. */
	function phase(lit: number) {
		const rx = Math.abs(1 - 2 * lit) * 6.6;
		return `M8 1.4A6.6 6.6 0 0 1 8 14.6A${rx.toFixed(2)} 6.6 0 0 ${lit < 0.5 ? 0 : 1} 8 1.4Z`;
	}

	// Table of contents: the section whose heading last crossed the upper third of the viewport is the current one.
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

<!-- Reading progress: a butter hairline under the navbar, driven by a CSS scroll timeline (no JS; absent where unsupported) -->
<div class="progress" aria-hidden="true"></div>

<article class="post" lang={post.lang} style:--bloom="url({bloom.img.src})">
	<div class="relative isolate">
		<!-- Night sky over the header, only in the dark theme (like /stats and the blog index) -->
		<div class="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-[30rem] mask-b-from-30% dark:block" aria-hidden="true">
			<StarField density={0.45} brightness={0.65} seed={71} />
		</div>

		<header class="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8">
			<a
				href={localizeHref('/blog')}
				class="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeftIcon class="size-4" aria-hidden="true" />
				{m.blog_post_back()}
			</a>

			<p class="meta mt-8">
				<span class="format">{FORMAT_LABELS[post.format]()}</span>
				<time datetime={post.publishedAt}>{formatDate(post.publishedAt, post.lang)}</time>
				<span aria-hidden="true">·</span>
				<span>{m.blog_reading_time({ minutes: post.readingMinutes })}</span>
			</p>
			<h1 class="headline mt-5 max-w-4xl font-display font-black tracking-wordmark text-balance">{post.title}</h1>
			{#if post.tags.length}
				<ul class="mt-6 flex flex-wrap gap-2" aria-label={m.blog_tags_label()}>
					{#each post.tags as tag, index (index)}
						<li class="rounded-full bg-foreground/[0.06] px-3 py-1 text-xs text-muted-foreground ring-1 ring-foreground/10 ring-inset">{tag}</li>
					{/each}
				</ul>
			{/if}
		</header>

		<div class="mx-auto mt-10 max-w-6xl px-4 sm:mt-12 sm:px-6 lg:px-8">
			<div class="stage">
				<VideoFacade bind:this={video} youtubeId={post.youtubeId} title={post.title} />
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

	<!-- Reading column (about 70 characters per line) beside a sticky table of contents from lg -->
	<div class="mx-auto grid max-w-6xl gap-x-16 px-4 pt-14 pb-24 sm:px-6 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_15rem] lg:px-8">
		<div class="grid min-w-0 content-start gap-14">
			{#if post.summary}
				<section aria-labelledby="summary-title" class="summary">
					<h2 id="summary-title" class="stamp">{m.blog_summary_title()}</h2>
					<p class="mt-4 text-lg leading-relaxed text-pretty sm:text-xl sm:leading-relaxed">{post.summary}</p>
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
					<!-- The bullets wax from a crescent to the full moon, like the moon phases of the period switch on /stats -->
					<ul class="takeaways mt-5">
						{#each post.takeaways as takeaway, index (index)}
							<li>
								<svg viewBox="0 0 16 16" class="phase" aria-hidden="true">
									<circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-opacity="0.45" stroke-width="1" />
									<path d={phase(post.takeaways.length > 1 ? 0.2 + (0.8 * index) / (post.takeaways.length - 1) : 1)} fill="currentColor" />
								</svg>
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
				<span class="moon" aria-hidden="true"></span>
				{m.blog_generated_note({ model: post.generatedBy })}
			</p>
		</div>

		{#if post.outline.length}
			<aside class="hidden lg:block">
				<nav class="toc" aria-labelledby="toc-title">
					<p id="toc-title" class="toc-title">
						<!-- A moon that waxes while you read (same scroll timeline as the progress hairline) -->
						<svg viewBox="0 0 16 16" class="toc-moon" aria-hidden="true">
							<defs><clipPath id="toc-disc"><circle cx="8" cy="8" r="6.6" /></clipPath></defs>
							<circle cx="8" cy="8" r="6.6" fill="currentColor" fill-opacity="0.16" />
							<g clip-path="url(#toc-disc)"><circle cx="8" cy="8" r="6.6" fill="currentColor" class="toc-lit" /></g>
						</svg>
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

		/* The toc moon waxes with the same timeline: the lit disc slides in from the right limb */
		.toc-lit {
			animation: wax linear both;
			animation-timeline: scroll(root);
		}
	}

	@keyframes read {
		from {
			scale: 0 1;
		}
	}

	@keyframes wax {
		from {
			translate: 13.2px 0;
		}
	}

	/* Header ------------------------------------------------------------------------------------------------- */

	.headline {
		font-size: clamp(2.4rem, 5.6vw, 4.5rem);
		line-height: 0.98;
		padding-bottom: 0.08em;
		/* Ink on paper; at night it catches the moonlight like the big titles on /blog and /stats */
		background: linear-gradient(180deg, var(--foreground) 55%, color-mix(in oklab, var(--foreground) 70%, var(--color-ochre)));
		background-clip: text;
		color: transparent;
	}

	:global(.dark) .headline {
		background: linear-gradient(180deg, var(--color-cream) 45%, var(--color-butter));
		background-clip: text;
	}

	/* A soft moon glow behind the video, so the screen sits in the night instead of on it */
	.stage {
		position: relative;
		isolation: isolate;
	}

	.stage::before {
		content: '';
		position: absolute;
		inset: 8% 6% -6%;
		z-index: -1;
		border-radius: 50%;
		background: radial-gradient(closest-side, rgb(252 215 114 / 0.22), transparent);
		filter: blur(40px);
		pointer-events: none;
	}

	:global(html:not(.dark)) .stage::before {
		background: radial-gradient(closest-side, rgb(226 169 59 / 0.22), transparent);
	}

	/* Section titles: Geist Black over a wash of butter pigment, like the section headings on /stats */
	.section-title {
		position: relative;
		isolation: isolate;
		width: fit-content;
		font-family: var(--font-display);
		font-size: clamp(1.6rem, 3vw, 2rem);
		font-weight: 900;
		letter-spacing: -0.035em;
		line-height: 1.1;
	}

	.section-title::before {
		content: '';
		position: absolute;
		top: 40%;
		left: -0.6rem;
		z-index: -1;
		width: min(78%, 14rem);
		height: 100%;
		background: var(--bloom) center / 100% 100% no-repeat;
		opacity: 0.55;
		mix-blend-mode: multiply;
		rotate: -2deg;
		pointer-events: none;
	}

	:global(.dark) .section-title::before {
		opacity: 0.25;
		mix-blend-mode: normal;
	}

	/* "Summary" as a rubber stamp, like the mock data stamp on /stats */
	.stamp {
		display: inline-block;
		padding: 0.3rem 0.7rem;
		border: 2px solid currentColor;
		border-radius: 0.5rem;
		color: #7d560a;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		transform: rotate(-3deg);
		mask-image: radial-gradient(circle at 30% 40%, #000 60%, rgb(0 0 0 / 0.8) 85%);
		opacity: 0.9;
	}

	:global(.dark) .stamp {
		color: rgb(252 215 114 / 0.85);
	}

	/* Summary: a sheet of butter paper with a pigment edge on the left */
	.summary {
		position: relative;
		padding: 1.75rem 2rem 1.9rem 2.25rem;
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
		padding-left: 2.1rem;
		font-size: 1.0625rem;
		line-height: 1.6;
	}

	.phase {
		position: absolute;
		left: 0.1rem;
		top: 0.3em;
		width: 1.1rem;
		height: 1.1rem;
		color: var(--color-ochre);
	}

	:global(.dark) .phase {
		color: var(--color-butter);
		filter: drop-shadow(0 0 0.35rem rgb(252 215 114 / 0.45));
	}

	/* A small butter moon */
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
		gap: 0.6rem;
		font-family: var(--font-display);
		font-size: 0.95rem;
		font-weight: 800;
		letter-spacing: -0.01em;
	}

	.toc-moon {
		width: 1.1rem;
		height: 1.1rem;
		color: var(--color-ochre);
	}

	:global(.dark) .toc-moon {
		color: var(--color-butter);
		filter: drop-shadow(0 0 0.35rem rgb(252 215 114 / 0.45));
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

	/* The current section: a butter mark on the rail */
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
		.toc-list a::before {
			transition: none;
		}
	}

	/* Article body (mdsvex) ----------------------------------------------------------------------------------- */

	.prose-post {
		max-width: 70ch;
		font-size: 1.125rem;
		line-height: 1.8;
		text-wrap: pretty;
		hyphens: auto;
	}

	.prose-post :global(> * + *) {
		margin-top: 1.25em;
	}

	.prose-post :global(h2) {
		scroll-margin-top: 6rem;
		margin-top: 2.4em;
		font-family: var(--font-display);
		font-size: 1.7rem;
		font-weight: 900;
		letter-spacing: -0.035em;
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
