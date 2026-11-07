<script lang="ts">
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { page } from '$app/state';
	import { FORMAT_LABELS, formatDate, formatTimestamp, isoDuration, jsonLdScript, loadPostBody, postHref, postsFor } from '#lib/blog/content.ts';
	import { getPost, getPosts } from '#lib/blog/posts.remote.ts';
	import { breakStyles } from '#lib/blog/section-breaks.ts';
	import inkGround from '#lib/blog/assets/ink-ground.svg?url';
	import VideoFacade from '#lib/blog/VideoFacade.svelte';
	import wash from '#lib/components/site/assets/backlight-wash.webp?w=960&format=webp&quality=50&enhanced';
	import StarField from '#lib/home/shared/StarField.svelte';
	import { thumbnailPath } from '#lib/home/sections/cinema/thumbnail.ts';
	import { YOUTUBE_CHANNEL_URL } from '#lib/home/data/socials.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { baseLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	// Data, the rendered body chunk and the index (for the neighbours at the end) load in parallel
	const [post, Body, posts] = $derived(await Promise.all([getPost(params.slug), loadPostBody(params.slug), getPosts()]));

	// The ending: the newer and the older neighbour in the index (newest first), among the posts of this language
	const neighbours = $derived.by(() => {
		const list = postsFor(posts, post.lang);
		const index = list.findIndex((candidate) => candidate.slug === post.slug);
		if (index < 0) return [];
		const newer = list[index - 1];
		const older = list[index + 1];
		return [newer && { post: newer, label: m.blog_post_newer() }, older && { post: older, label: m.blog_post_older() }].filter((item) => !!item);
	});

	const breakSheet = `<style>${breakStyles()}</style>`;

	/** `SvelteKit Dokumentation lesen` → [`SvelteKit Dokumentation `, `lesen`]: the last word travels with the arrow. */
	const splitLast = (label: string) => {
		const at = label.trimEnd().lastIndexOf(' ');
		return at < 0 ? ['', label] : [label.slice(0, at + 1), label.slice(at + 1)];
	};

	/** `https://www.svelte.dev/docs/kit/` → `svelte.dev/docs/kit` */
	const linkHost = (href: string) => {
		const url = new URL(href);
		return url.host.replace(/^www\./, '') + url.pathname.replace(/\/$/, '');
	};

	let video = $state<VideoFacade>();

	const origin = $derived(page.url.origin);
	// Each language version is its own canonical; hreflang links it with its translations (`translationOf`, posts.server.ts).
	// The root layout skips its alternates here. x-default: the German version if there is one.
	const canonical = $derived(new URL(postHref(post), origin).href);
	const versions = $derived([post, ...post.translations].map((version) => ({ lang: version.lang, href: new URL(postHref(version), origin).href })));
	const defaultVersion = $derived(versions.find((version) => version.lang === baseLocale) ?? versions[0]);
	const image = $derived(post.youtubeId ? new URL(thumbnailPath(post.youtubeId), origin).href : null);
	const watchUrl = $derived(post.youtubeId ? `https://www.youtube.com/watch?v=${post.youtubeId}` : null);
	const transcriptText = $derived(post.transcript.map((segment) => segment.text).join(' '));

	const ogLocale = (lang: string) => (lang === 'de' ? 'de_DE' : 'en_US');

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
			inLanguage: post.videoLang,
			// The transcript of a translation is translated: only the video's own words count as its transcript
			transcript: (post.lang === post.videoLang && transcriptText) || undefined,
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

	let body = $state<HTMLElement>();

	/*
	 * TOC: the current section is the last heading above the upper third of the viewport; scrolled to the very bottom, the
	 * last section (a short final section never reaches the line). Measured on scroll and resize, at most once per frame, so
	 * jumps (End, Page Down, a fling, a TOC link) land on the right entry. Starts once the post body is in the DOM and again
	 * for each post.
	 */
	let current = $state<string | null>(null);
	$effect(() => {
		if (!body || !Body) return;
		const headings = post.outline.map(({ id }) => document.getElementById(id)).filter((heading) => heading !== null);
		if (!headings.length) {
			current = null;
			return;
		}
		let frame = 0;
		const update = () => {
			frame = 0;
			const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
			const line = innerHeight * 0.33;
			current = (atBottom ? headings.at(-1) : headings.findLast((heading) => heading.getBoundingClientRect().top < line))?.id ?? null;
		};
		const schedule = () => {
			frame ||= requestAnimationFrame(update);
		};
		update();
		addEventListener('scroll', schedule, { passive: true });
		addEventListener('resize', schedule, { passive: true });
		return () => {
			cancelAnimationFrame(frame);
			removeEventListener('scroll', schedule);
			removeEventListener('resize', schedule);
		};
	});

	// Painted section breaks load their image only once they come near the viewport (section-breaks.ts)
	$effect(() => {
		if (!body || !Body) return; // re-runs for each post body
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					entry.target.setAttribute('data-near', '');
					observer.unobserve(entry.target);
				}
			},
			{ rootMargin: '100% 0px' }
		);
		for (const rule of body.querySelectorAll(':scope > hr')) observer.observe(rule);
		return () => observer.disconnect();
	});

	/** The phone contents close once an entry is chosen (before the jump, so the target lands where the layout settles). */
	function closeOnPick(details: HTMLDetailsElement) {
		const close = (event: Event) => {
			if (event.target instanceof Element && event.target.closest('a')) details.open = false;
		};
		details.addEventListener('click', close);
		return () => details.removeEventListener('click', close);
	}

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
	{#each versions as version (version.lang)}
		<link rel="alternate" hreflang={version.lang} href={version.href} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={defaultVersion.href} />
	<meta property="og:type" content="article" />
	<meta property="og:site_name" content="SOLO STACK" />
	<meta property="og:title" content={post.title} />
	<meta property="og:description" content={post.description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:locale" content={ogLocale(post.lang)} />
	{#each post.translations as translation (translation.lang)}<meta property="og:locale:alternate" content={ogLocale(translation.lang)} />{/each}
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
	<!-- The art of the section breaks (static, from section-breaks.ts) -->
	{@html breakSheet}
	<!-- Without scripts the painted breaks load right away -->
	<noscript
		><style>
			.prose-post hr::after {
				background-image: var(--art) !important;
			}
		</style></noscript
	>
</svelte:head>

<!-- Reading progress hairline: CSS scroll timeline, no JS; absent where unsupported -->
<div class="progress" aria-hidden="true"></div>

{#snippet contents(labelId: string)}
	<ol class="toc-list" aria-labelledby={labelId}>
		{#each post.outline as section (section.id)}
			<li><a href="#{section.id}" aria-current={current === section.id ? 'location' : undefined}>{section.title}</a></li>
		{/each}
	</ol>
{/snippet}

<!-- Keyed: SvelteKit reuses this component between posts; a playing video or an open <details> must not carry over. -->
{#key post.slug}
	<article class="post" lang={post.lang} style:--wash="url({wash.img.src})">
		<div class="relative isolate">
			<!-- Night sky over the header, dark theme only (as on /stats and /blog) -->
			<div class="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-[30rem] mask-b-from-30% dark:block" aria-hidden="true">
				<StarField density={0.45} brightness={0.65} seed={71} />
			</div>

			<header class="mx-auto max-w-6xl px-4 pt-4 sm:px-6 sm:pt-10 lg:px-8">
				<a href={localizeHref('/blog')} class="back">
					<ArrowLeftIcon class="size-4" aria-hidden="true" />
					{m.blog_post_back()}
				</a>

				<h1 class="headline mt-5 max-w-4xl font-display font-black tracking-wordmark text-balance sm:mt-8">{post.title}</h1>
				<!-- One quiet line under the title: date, reading time, format (the topics follow the summary) -->
				<p class="meta mt-4 sm:mt-6">
					<time datetime={post.publishedAt}>{formatDate(post.publishedAt, post.lang)}</time>
					<span aria-hidden="true">·</span>
					<span>{m.blog_reading_time({ minutes: post.readingMinutes })}</span>
					<span aria-hidden="true">·</span>
					<span>{FORMAT_LABELS[post.format]()}</span>
					<!-- The other language version, labelled in its own language -->
					{#each post.translations as translation (translation.lang)}
						<span aria-hidden="true">·</span>
						<a href={postHref(translation)} hreflang={translation.lang} lang={translation.lang} class="translation" data-sveltekit-reload>
							{m.blog_post_translation_link({}, { locale: translation.lang })}
						</a>
					{/each}
				</p>

				{#if post.outline.length}
					<!-- Below lg: the same contents as a disclosure right under the metadata. Closed, it shows the article as a trail of
				     fireflies on an ink thread, one per section; the section you are in glows. A chosen entry closes it. -->
					<details class="toc-mobile lg:hidden" style:--ink-ground={`url("${inkGround}")`} {@attach closeOnPick}>
						<summary>
							<span class="toc-head">
								<span class="toc-fly" aria-hidden="true"></span>
								<span id="toc-mobile-title">{m.blog_toc_title()}</span>
							</span>
							<span class="trail" aria-hidden="true">
								{#each post.outline as section (section.id)}
									<i class:lit={current === section.id}></i>
								{/each}
							</span>
							<span class="toggle" aria-hidden="true"><ChevronDownIcon class="chevron size-4" /></span>
						</summary>
						{@render contents('toc-mobile-title')}
					</details>
				{/if}
			</header>

			<div class="mx-auto mt-7 max-w-6xl px-4 sm:mt-12 sm:px-6 lg:px-8">
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

		<!-- Reading column (66 ch at body size), sticky contents from lg -->
		<div class="mx-auto grid max-w-6xl gap-x-16 px-4 pt-12 pb-8 sm:px-6 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_17rem] lg:px-8">
			<div class="read">
				{#if post.summary || post.tags.length}
					<div class="opening">
						{#if post.summary}
							<section aria-labelledby="summary-title" class="summary">
								<h2 id="summary-title" class="sr-only">{m.blog_summary_title()}</h2>
								<p class="summary-text">{post.summary}</p>
							</section>
						{/if}
						{#if post.tags.length}
							<ul class="tags" aria-label={m.blog_tags_label()}>
								{#each post.tags as tag, index (index)}
									<li>{tag}</li>
								{/each}
							</ul>
						{/if}
					</div>
				{/if}

				{#if post.chapters.length}
					<section aria-labelledby="chapters-title">
						<h2 id="chapters-title" class="section-title">{m.blog_chapters_title()}</h2>
						<ol class="chapters mt-5">
							{#each post.chapters as chapter, index (index)}
								{@const time = formatTimestamp(chapter.start)}
								<li>
									{#if watchUrl}
										<a
											href="{watchUrl}&t={chapter.start}s"
											aria-label={m.blog_chapter_seek({ time, title: chapter.title })}
											onclick={(event) => seek(event, chapter.start)}
										>
											<span class="time">{time}</span>
											<span>{chapter.title}</span>
										</a>
									{:else}
										<span class="chapter">
											<span class="time">{time}</span>
											<span>{chapter.title}</span>
										</span>
									{/if}
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

				<div class="prose-post" bind:this={body}>
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
						<ul class="links mt-6">
							{#each post.links as link, index (index)}
								{@const [head, last] = splitLast(link.label)}
								<li>
									<a href={link.url} target="_blank" rel="noopener">
										<span class="link-name">{head}<span class="last">{last}<ArrowUpRightIcon class="arrow size-4" aria-hidden="true" /></span></span>
										<span class="host">{linkHost(link.url)}</span>
									</a>
								</li>
							{/each}
						</ul>
					</section>
				{/if}

				<!-- The ending: who wrote it, then the way back into the blog (or on to the neighbouring articles) -->
				<footer class="post-end">
					<p class="generated">
						<span class="firefly" aria-hidden="true"></span>
						{m.blog_generated_note({ model: post.generatedBy })}
					</p>
					<nav class="onward" aria-label={m.blog_post_more_label()}>
						<a href={localizeHref('/blog')} class="home">
							<ArrowLeftIcon class="size-4" aria-hidden="true" />
							{m.blog_post_back()}
						</a>
						{#each neighbours as item (item.post.slug)}
							<a href={postHref(item.post)} hreflang={item.post.lang} class="neighbour">
								<span class="neighbour-label">{item.label}</span>
								<span class="neighbour-title" lang={item.post.lang}>{item.post.title}</span>
							</a>
						{/each}
					</nav>
				</footer>
			</div>

			{#if post.outline.length}
				<aside class="hidden lg:block">
					<nav class="toc" aria-labelledby="toc-title">
						<p id="toc-title" class="toc-title">
							<!-- A firefly that lights up while you read (same scroll timeline as the progress hairline) -->
							<span class="toc-fly" aria-hidden="true"></span>
							{m.blog_toc_title()}
						</p>
						{@render contents('toc-title')}
					</nav>
				</aside>
			{/if}
		</div>
	</article>
{/key}

<style>
	/* Shared marks ---------------------------------------------------------------------------------------------- */

	/* A firefly: moonlight core, butter halo (ochre core on paper, where moonlight would vanish) */
	.firefly,
	.toc-fly {
		display: block;
		flex: none;
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

	.back,
	.home {
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

	.back :global(svg),
	.home :global(svg) {
		transition: translate var(--dur-state) cubic-bezier(0.3, 1.35, 0.5, 1);
	}

	.back:hover,
	.home:hover {
		color: var(--foreground);
	}

	.back:hover :global(svg),
	.home:hover :global(svg) {
		translate: -0.25rem 0;
	}

	.headline {
		font-size: clamp(2.25rem, 6vw, 4.75rem);
		line-height: 0.98;
		padding-bottom: 0.08em;
		/* Ink on paper, a gentle warm cast across the whole title (no separate brown last line); lit from behind at night */
		background: linear-gradient(180deg in oklab, var(--foreground) 10%, #6b4a12 160%);
		background-clip: text;
		color: transparent;
	}

	/*
	 * Night: cream throughout, warmth only at the feet of the last line. Measured up from the bottom of the box in em, so it
	 * stays on the last line's lower half however many lines the title breaks into (no line turns colour in one step).
	 */
	:global(.dark) .headline {
		background: linear-gradient(0deg, color-mix(in oklab, var(--color-cream), var(--color-butter) 45%) 0.12em, var(--color-cream) 0.62em);
		background-clip: text;
	}

	/* Date · reading time · format, one voice (as on the index) */
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.25rem 0.5rem;
		color: var(--muted-foreground);
		font-size: 0.9375rem;
		font-variant-numeric: tabular-nums;
	}

	.meta .translation {
		color: var(--foreground);
		text-decoration: underline;
		text-decoration-color: var(--color-ochre);
		text-decoration-thickness: 2px;
		text-underline-offset: 0.2em;
		transition: text-decoration-color var(--dur-hover) ease;
	}

	.meta .translation:hover {
		text-decoration-color: currentColor;
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

	/* Reading column ----------------------------------------------------------------------------------------- */

	/* Every block shares one measure: about 66 characters of German prose per line at body size (18px) */
	.read {
		display: grid;
		align-content: start;
		gap: clamp(3rem, 6vw, 3.75rem);
		min-width: 0;
		max-width: 34em;
		font-size: 1.125rem;
	}

	/* Section titles: Geist Black over a small pigment wash */
	.section-title {
		position: relative;
		isolation: isolate;
		width: fit-content;
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 2.6vw, 1.85rem);
		font-weight: 900;
		letter-spacing: -0.035em;
		line-height: 1.15;
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

	/* Opening: the summary is the lede, marked by a lit margin stroke (no label); the topics follow as one quiet line */
	.opening {
		display: grid;
		gap: 1.25rem;
	}

	.summary {
		position: relative;
		padding-left: clamp(1.1rem, 2.5vw, 1.5rem);
	}

	/* A brushed butter stroke down the margin, thinning out at both ends */
	.summary::before {
		content: '';
		position: absolute;
		inset: 0.3em auto 0.3em 0;
		width: 3px;
		border-radius: 3px;
		background: linear-gradient(180deg, transparent, var(--color-ochre) 12%, var(--color-butter) 55%, var(--color-ochre) 88%, transparent);
	}

	:global(.dark) .summary::before {
		background: linear-gradient(180deg, transparent, var(--color-butter) 12%, var(--color-moonlight) 55%, var(--color-butter) 88%, transparent);
		box-shadow: 0 0 12px rgb(252 215 114 / 0.35);
	}

	.summary-text {
		font-size: clamp(1.1875rem, 2vw, 1.375rem);
		font-weight: 500;
		letter-spacing: -0.012em;
		line-height: 1.55;
		text-wrap: pretty;
	}

	/* Topics: words with a middle dot between, after each word so a wrapped line never starts with one */
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0;
		padding-left: clamp(1.1rem, 2.5vw, 1.5rem);
		color: var(--muted-foreground);
		font-size: 0.875rem;
	}

	.tags li:not(:last-child)::after {
		content: '·';
		margin: 0 0.55rem;
	}

	/* Chapters ----------------------------------------------------------------------------------------------- */

	.chapters {
		display: grid;
	}

	.chapters li {
		position: relative;
	}

	.chapters li + li::before {
		content: '';
		position: absolute;
		inset: 0 0 auto;
		height: 1px;
		background: linear-gradient(90deg, var(--border) 0 85%, transparent);
	}

	.chapters a,
	.chapter {
		display: flex;
		align-items: baseline;
		gap: 1.25rem;
		min-height: 3rem;
		padding: 0.75rem 0.25rem;
		font-size: 1rem;
		transition: color var(--dur-hover) ease;
	}

	.chapters a {
		cursor: pointer;
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

	/* Contents ----------------------------------------------------------------------------------------------- */

	/* Desktop: sticky beside the column. Inner padding keeps the focus rings inside the scroll box. */
	.toc {
		position: sticky;
		top: 6rem;
		display: grid;
		gap: 1rem;
		max-height: calc(100svh - 8rem);
		margin: -0.375rem;
		padding: 0.375rem;
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
		padding: 0.45rem 0.25rem 0.45rem 1rem;
		border-radius: 0.25rem;
		color: var(--muted-foreground);
		font-size: 0.8125rem;
		line-height: 1.45;
		text-wrap: balance;
		transition: color 200ms ease;
	}

	.toc-list a:focus-visible {
		outline-offset: 1px;
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

	/*
	 * Below lg: a disclosure before the body, same list, same current-section mark. The row stands on a brushed ink ground
	 * (the stroke under the reading hill on /blog, heavy under the title); between title and toggle the article runs as a
	 * trail of fireflies on a thread, one per section, and the section you are reading glows.
	 */
	/* Right under the metadata, on the reading measure */
	.toc-mobile {
		position: relative;
		max-width: 38rem;
		margin-top: 1.25rem;
	}

	.toc-mobile summary {
		position: relative;
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 1rem;
		min-height: 3.5rem;
		padding-block: 0.375rem 0.625rem;
		border-radius: 0.375rem;
		cursor: pointer;
		list-style: none;
	}

	.toc-mobile summary::-webkit-details-marker {
		display: none;
	}

	.toc-mobile summary::after {
		content: '';
		position: absolute;
		inset: auto -0.25rem -0.125rem;
		height: 0.5rem;
		background: var(--foreground);
		opacity: 0.7;
		mask: var(--ink-ground) center / 100% 100% no-repeat;
		scale: -1 1;
		pointer-events: none;
	}

	:global(.dark) .toc-mobile summary::after {
		background: var(--color-cream);
		opacity: 0.3;
	}

	.toc-head {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		font-family: var(--font-display);
		font-size: 1.0625rem;
		font-weight: 800;
		letter-spacing: -0.015em;
	}

	.trail {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 1rem;
		padding-inline: 0.125rem;
	}

	/* The thread: a dotted ink line from the first firefly to the last */
	.trail::before {
		content: '';
		position: absolute;
		inset: 50% 0.25rem auto;
		height: 1px;
		background: repeating-linear-gradient(90deg, color-mix(in oklab, var(--foreground) 32%, transparent) 0 2px, transparent 2px 6px);
	}

	.trail i {
		position: relative;
		width: 0.3125rem;
		height: 0.3125rem;
		border-radius: 50%;
		background: color-mix(in oklab, var(--color-ochre) 70%, var(--foreground));
		transition:
			scale var(--dur-state) cubic-bezier(0.3, 1.35, 0.5, 1),
			box-shadow var(--dur-state) ease,
			background-color var(--dur-state) ease;
	}

	:global(.dark) .trail i {
		background: color-mix(in oklab, var(--color-butter) 55%, var(--background));
	}

	.trail i.lit {
		scale: 1.6;
		background: #f1b73e;
		box-shadow:
			0 0 2px 1px rgb(226 169 59 / 0.9),
			0 0 8px 2px rgb(252 215 114 / 0.75);
	}

	:global(.dark) .trail i.lit {
		background: var(--color-moonlight);
		box-shadow:
			0 0 3px 1px var(--color-butter),
			0 0 10px 3px rgb(252 215 114 / 0.55);
	}

	/* The toggle: a small ink ring, lit while open */
	.toggle {
		display: grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		border: 1px solid color-mix(in oklab, var(--foreground) 28%, transparent);
		border-radius: 50%;
		transition:
			border-color var(--dur-hover) ease,
			background-color var(--dur-hover) ease;
	}

	.toc-mobile summary:hover .toggle,
	.toc-mobile[open] .toggle {
		border-color: var(--ink-lit);
	}

	.toc-mobile[open] .toggle {
		background: color-mix(in oklab, var(--color-butter) 22%, transparent);
	}

	:global(.dark) .toc-mobile[open] .toggle {
		background: color-mix(in oklab, var(--color-butter) 12%, transparent);
	}

	.toc-mobile :global(.chevron),
	.transcript :global(.chevron) {
		color: var(--muted-foreground);
		transition: rotate var(--dur-state) ease;
	}

	.toc-mobile[open] :global(.chevron),
	.transcript[open] :global(.chevron) {
		rotate: 180deg;
	}

	.toc-mobile[open] :global(.chevron) {
		color: var(--ink-lit);
	}

	.toc-mobile .toc-list {
		margin: 1rem 0 0.25rem 0.2rem;
	}

	.toc-mobile .toc-list a {
		font-size: 0.9375rem;
		padding-block: 0.6rem;
	}

	/* The list unfolds (where the browser can animate to `auto`) */
	@media (prefers-reduced-motion: no-preference) {
		@supports (interpolate-size: allow-keywords) {
			.toc-mobile {
				interpolate-size: allow-keywords;
			}

			.toc-mobile::details-content {
				block-size: 0;
				overflow: clip;
				transition:
					block-size var(--dur-state) ease,
					content-visibility var(--dur-state) allow-discrete;
			}

			.toc-mobile[open]::details-content {
				block-size: auto;
			}
		}
	}

	/* Transcript --------------------------------------------------------------------------------------------- */

	.transcript {
		position: relative;
	}

	.transcript summary {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: fit-content;
		min-height: 3rem;
		padding: 0 0.25rem;
		font-size: 1rem;
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

	.transcript-body {
		display: grid;
		gap: 0.85rem;
		max-height: 32rem;
		overflow-y: auto;
		margin-top: 0.5rem;
		padding: 0.25rem 1rem 0.5rem 1.25rem;
		border-left: 2px solid color-mix(in oklab, var(--color-butter) 60%, transparent);
		color: var(--muted-foreground);
		font-size: 1rem;
		line-height: 1.75;
		scrollbar-width: thin;
	}

	.transcript-body .time {
		display: inline-block;
		min-width: auto;
		margin-right: 0.6rem;
	}

	/* Links: a clean two-column list, the address in mono under each name, no rules ------------------------------ */

	.links {
		display: grid;
		gap: 0.5rem 2.5rem;
	}

	@media (min-width: 40rem) {
		.links {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.links a {
		display: grid;
		gap: 0.2rem;
		min-height: 2.75rem;
		padding: 0.5rem 0.25rem;
		margin-left: -0.25rem;
		border-radius: 0.25rem;
	}

	/* The arrow travels with the last word (never alone on a line, never adrift at the end of a wrapped name) */
	.links .link-name {
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.35;
		text-decoration: underline;
		text-decoration-color: transparent;
		text-decoration-thickness: 2px;
		text-underline-offset: 0.2em;
		transition: text-decoration-color var(--dur-state) ease;
	}

	.links a:hover .link-name {
		text-decoration-color: var(--color-ochre);
	}

	:global(.dark) .links a:hover .link-name {
		text-decoration-color: var(--color-butter);
	}

	.links .last {
		white-space: nowrap;
	}

	.links :global(.arrow) {
		display: inline-block;
		margin-left: 0.3rem;
		vertical-align: -0.1em;
		color: var(--muted-foreground);
		transition:
			translate var(--dur-state) cubic-bezier(0.3, 1.35, 0.5, 1),
			color var(--dur-state) ease;
	}

	.links a:hover :global(.arrow) {
		translate: 0.2rem -0.2rem;
		color: var(--ink-lit);
	}

	.host {
		color: var(--muted-foreground);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		overflow-wrap: anywhere;
	}

	/* Ending ------------------------------------------------------------------------------------------------- */

	.post-end {
		display: grid;
		gap: 1.75rem;
		margin-top: 0.5rem;
	}

	.generated {
		display: flex;
		align-items: baseline;
		gap: 0.85rem;
		color: var(--muted-foreground);
		font-size: 0.875rem;
	}

	.generated .firefly {
		width: 0.45rem;
		height: 0.45rem;
		translate: 0 -0.1em;
	}

	/* Back into the blog, and the neighbouring articles (newer / older) when there are any */
	.onward {
		display: flex;
		flex-wrap: wrap;
		align-items: start;
		justify-content: space-between;
		gap: 1rem 2.5rem;
	}

	.home {
		margin-left: -0.25rem;
		color: var(--foreground);
		font-size: 1rem;
		font-weight: 600;
	}

	.neighbour {
		display: grid;
		gap: 0.2rem;
		max-width: 22rem;
		padding: 0.35rem 0.25rem;
		border-radius: 0.25rem;
	}

	.neighbour-label {
		color: var(--muted-foreground);
		font-size: 0.8125rem;
	}

	.neighbour-title {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		line-height: 1.2;
		text-wrap: balance;
		text-decoration: underline;
		text-decoration-color: transparent;
		text-decoration-thickness: 2px;
		text-underline-offset: 0.2em;
		transition: text-decoration-color var(--dur-state) ease;
	}

	.neighbour:hover .neighbour-title {
		text-decoration-color: var(--ink-lit);
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

		/* Same timeline: the contents firefly lights up */
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

	@media (prefers-reduced-motion: reduce) {
		.toc-list a::before,
		.back :global(svg),
		.home :global(svg),
		.links :global(.arrow) {
			transition: none;
		}
	}

	/* Article body (mdsvex) ----------------------------------------------------------------------------------- */

	/* One paragraph style throughout (the summary above is the lede) */
	.prose-post {
		line-height: 1.8;
		text-wrap: pretty;
		hyphens: auto;
	}

	.prose-post :global(> * + *) {
		margin-top: 1.3em;
	}

	.prose-post :global(> :first-child) {
		margin-top: 0;
	}

	.prose-post :global(h2) {
		scroll-margin-top: 6rem;
		margin-top: 2.6em;
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 2.6vw, 1.85rem);
		font-weight: 900;
		letter-spacing: -0.035em;
		line-height: 1.2;
		text-wrap: balance;
		hyphens: manual;
	}

	/* A short brushed ink stroke over each section (not after a section break, which already marks the pause) */
	.prose-post :global(h2::before) {
		content: '';
		display: block;
		width: 3rem;
		height: 0.55rem;
		margin-bottom: 0.85rem;
		background: var(--ink-lit);
		mask: var(--ink-underline) center / 100% 100% no-repeat;
	}

	.prose-post :global(hr + h2) {
		margin-top: 0;
	}

	.prose-post :global(hr + h2::before) {
		display: none;
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

	.prose-post :global(p) {
		color: color-mix(in oklab, var(--foreground) 88%, var(--muted-foreground));
	}

	/* The end of the article: a firefly settles after the last word */
	.prose-post :global(> p:last-child::after) {
		content: '';
		display: inline-block;
		width: 0.42em;
		height: 0.42em;
		margin-left: 0.55em;
		border-radius: 50%;
		background: var(--color-moonlight);
		box-shadow:
			0 0 3px 1px var(--color-butter),
			0 0 12px 3px rgb(252 215 114 / 0.55);
		vertical-align: 0.08em;
	}

	:global(html:not(.dark)) .prose-post :global(> p:last-child::after) {
		background: #f1b73e;
		box-shadow:
			0 0 2px 1px rgb(226 169 59 / 0.9),
			0 0 10px 3px rgb(252 215 114 / 0.75);
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

	/* A real quotation: quiet, set in from a thin butter rule */
	.prose-post :global(blockquote) {
		position: relative;
		padding-left: 1.4em;
		color: var(--muted-foreground);
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

	/*
	 * Pull quote (section-breaks.ts): a sentence of the post set a step up from the body in the display face at regular
	 * weight (a voice, never a heading), a thin ochre stroke hanging in the gutter left of the column, so the words stay on
	 * the text edge.
	 */
	.prose-post :global(.pull-quote) {
		position: relative;
		max-width: 30ch;
		margin-block: 1.6em 1.7em;
		padding-left: 1.25rem;
		color: var(--foreground);
		font-family: var(--font-display);
		font-size: clamp(1.25rem, 1.9vw, 1.4375rem);
		font-weight: 400;
		letter-spacing: -0.012em;
		line-height: 1.38;
		text-wrap: balance;
		hyphens: manual;
	}

	.prose-post :global(.pull-quote::before) {
		content: '';
		position: absolute;
		inset: 0.3em auto 0.3em 0;
		width: 2px;
		border-radius: 2px;
		background: var(--color-ochre);
	}

	:global(.dark) .prose-post :global(.pull-quote::before) {
		background: var(--color-butter);
		box-shadow: 0 0 10px rgb(252 215 114 / 0.35);
	}

	@media (min-width: 64rem) {
		.prose-post :global(.pull-quote) {
			margin-left: -1.75rem;
			padding-left: 1.75rem;
		}
	}

	/*
	 * Section break (section-breaks.ts): a painted pause tied to the section it opens. Its art comes from the break style
	 * sheet as custom properties: a `scene` is a wide, shallow plate across the whole measure on a torn edge (box height
	 * from its ratio); an `object` is a cut-out painting at its own height (phones 85 %) and place in the column. On paper
	 * the paint stands on the page; at night a warm light spills from the painting's own light source. The image loads once
	 * the break nears the viewport (`data-near`).
	 */
	.prose-post :global(hr) {
		position: relative;
		isolation: isolate;
		height: var(--h-sm, 6rem);
		aspect-ratio: var(--box-ratio, auto);
		margin-block: 2.75em 2.4em;
		border: 0;
		overflow: visible;
	}

	.prose-post :global(hr::before),
	.prose-post :global(hr::after) {
		content: '';
		position: absolute;
		inset: 0 var(--right, auto) auto var(--x, 50%);
		height: 100%;
		aspect-ratio: var(--ratio, 4);
		translate: var(--shift, -50%) 0;
	}

	/* Night: the light behind, blurred past the painting's edges */
	:global(.dark) .prose-post :global(hr::before) {
		z-index: -1;
		background:
			radial-gradient(38% 52% at var(--glow, 50% 50%), rgb(252 215 114 / 0.26), transparent 75%),
			radial-gradient(60% 34% at 50% 88%, rgb(236 146 48 / 0.16), transparent 80%), radial-gradient(50% 50% at 50% 55%, rgb(251 243 221 / 0.06), transparent 80%);
		filter: blur(16px);
	}

	.prose-post :global(hr::after) {
		background: none center / contain no-repeat;
		mask: var(--edge, linear-gradient(#000, #000)) center / 100% 100% no-repeat;
	}

	.prose-post :global(hr[data-near]::after) {
		background-image: var(--art);
	}

	/* Night: a plate's sky dissolves into the page, its sides feather out, only the torn edge below stays; an ink cut-out gets a moonlit rim */
	:global(.dark) .prose-post :global(hr::after) {
		mask:
			var(--edge, linear-gradient(#000, #000)) center / 100% 100% no-repeat,
			var(--night-fade, linear-gradient(#000, #000)) center / 100% 100% no-repeat,
			var(--night-feather, linear-gradient(#000, #000)) center / 100% 100% no-repeat;
		mask-composite: intersect;
		filter: var(--rim, none);
	}

	/* From 40rem a cut-out stands at its full height */
	@media (min-width: 40rem) {
		.prose-post :global(hr) {
			height: var(--h, 7rem);
		}
	}

	/* The pause settles in as it scrolls into view (CSS scroll timeline; reduced motion: simply there) */
	@media (prefers-reduced-motion: no-preference) {
		@supports (animation-timeline: view()) {
			.prose-post :global(hr) {
				animation: settle linear both;
				animation-timeline: view();
				animation-range: entry 10% entry 90%;
			}
		}
	}

	@keyframes settle {
		from {
			opacity: 0;
			translate: 0 0.75rem;
		}
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
</style>
