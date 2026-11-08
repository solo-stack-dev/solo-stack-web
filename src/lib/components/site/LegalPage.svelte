<!--
	@component
	Frame of the legal pages. The content locale controls language and canonical URL.
	Defaults to German for the untranslated imprint; privacy passes the current locale.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { baseLocale, localizeHref, type Locale } from '#lib/paraglide/runtime.js';

	let {
		title,
		path,
		locale = baseLocale,
		children
	}: { title: string; /** Unlocalized path, e.g. `/impressum`. */ path: string; locale?: Locale; children: Snippet } = $props();

	const canonical = $derived(new URL(localizeHref(path, { locale }), page.url.origin).href);
</script>

<svelte:head>
	<title>{title} · SOLO STACK</title>
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="SOLO STACK" />
	<meta property="og:title" content={title} />
	<meta property="og:url" content={canonical} />
</svelte:head>

<article class="mx-auto max-w-3xl px-4 pt-12 pb-24 sm:px-6 sm:pt-20 lg:px-8">
	<h1 class="font-display text-5xl leading-[0.9] font-black tracking-wordmark text-balance sm:text-6xl">{title}</h1>
	<div class="legal-text mt-12" lang={locale}>
		{@render children()}
	</div>
</article>

<style>
	.legal-text {
		line-height: 1.75;
		text-wrap: pretty;
		hyphens: auto;
		overflow-wrap: anywhere;
	}

	.legal-text :global(> * + *) {
		margin-top: 1.1em;
	}

	.legal-text :global(h2) {
		margin-top: 2.4em;
		font-family: var(--font-display);
		font-size: clamp(1.3rem, 2.4vw, 1.6rem);
		font-weight: 900;
		letter-spacing: -0.03em;
		line-height: 1.2;
		text-wrap: balance;
		hyphens: manual;
	}

	/* The site's brushed ink stroke over each section, as in the blog posts */
	.legal-text :global(h2::before) {
		content: '';
		display: block;
		width: 2.5rem;
		height: 0.5rem;
		margin-bottom: 0.75rem;
		background: var(--ink-lit);
		mask: var(--ink-underline) center / 100% 100% no-repeat;
	}

	.legal-text :global(> h2:first-child) {
		margin-top: 0;
	}

	.legal-text :global(h3) {
		margin-top: 1.8em;
		font-size: 1.15rem;
		font-weight: 700;
		line-height: 1.35;
	}

	.legal-text :global(h2 + *),
	.legal-text :global(h3 + *) {
		margin-top: 0.6em;
	}

	.legal-text :global(p),
	.legal-text :global(li) {
		color: color-mix(in oklab, var(--foreground) 88%, var(--muted-foreground));
	}

	.legal-text :global(a) {
		text-decoration: underline;
		text-decoration-color: var(--color-ochre);
		text-decoration-thickness: 2px;
		text-underline-offset: 0.2em;
		transition: text-decoration-color var(--dur-hover) ease;
	}

	.legal-text :global(a:hover) {
		text-decoration-color: currentColor;
	}

	.legal-text :global(strong) {
		color: var(--foreground);
		font-weight: 700;
	}

	.legal-text :global(ul),
	.legal-text :global(ol) {
		display: grid;
		gap: 0.4em;
		padding-left: 1.4em;
	}

	.legal-text :global(ul) {
		list-style: disc;
	}

	.legal-text :global(ol) {
		list-style: decimal;
	}
</style>
