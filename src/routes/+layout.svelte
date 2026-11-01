<script lang="ts">
	import { page } from '$app/state';
	import { baseLocale, locales, localizeHref, type Locale } from '#lib/paraglide/runtime.js';
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// Absolute URL of the current page in another locale. Used for hreflang alternates, which
	// Google requires to be fully qualified. The prerender crawler also follows these links,
	// so every locale variant of a prerendered page gets built.
	const alternateHref = (locale: Locale) => new URL(localizeHref(page.url.pathname, { locale }), page.url.origin).href;

	// Blog posts exist in one language only and emit their own canonical/hreflang (src/routes/(site)/blog/[slug]).
	const ownAlternates = $derived(page.route.id === '/(site)/blog/[slug]');
</script>

<svelte:head>
	<!-- The navbar crescent on a night tile. static/favicon.ico and static/apple-touch-icon.png are renders of the same SVG. -->
	<link rel="icon" href="/favicon.ico" sizes="48x48" />
	<link rel="icon" href={favicon} type="image/svg+xml" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	{#if page.status === 200 && !ownAlternates}
		{#each locales as locale (locale)}
			<link rel="alternate" hreflang={locale} href={alternateHref(locale)} />
		{/each}
		<link rel="alternate" hreflang="x-default" href={alternateHref(baseLocale)} />
	{/if}
</svelte:head>

{@render children()}
