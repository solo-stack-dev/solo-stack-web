<script lang="ts">
	import { page } from '$app/state';
	import { baseLocale, locales, localizeHref, type Locale } from '#lib/paraglide/runtime.js';
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// Absolute (Google requires it for hreflang). The prerender crawler follows these, so every locale variant gets built.
	const alternateHref = (locale: Locale) => new URL(localizeHref(page.url.pathname, { locale }), page.url.origin).href;

	// Blog posts exist in one language only and emit their own canonical/hreflang (src/routes/(site)/blog/[slug]);
	// the legal texts are German only and name the German URL as canonical (LegalPage.svelte).
	const SINGLE_LOCALE_ROUTES = new Set(['/(site)/blog/[slug]', '/(site)/impressum', '/(site)/datenschutz']);
	const ownAlternates = $derived(SINGLE_LOCALE_ROUTES.has(page.route.id ?? ''));

	// Console egg, loaded on idle
	const installConsoleEgg = () => import('#lib/components/site/console-egg.ts').then((module) => module.install()).catch(() => {});

	$effect(() => {
		if ('requestIdleCallback' in window) {
			const handle = requestIdleCallback(installConsoleEgg, { timeout: 4000 });
			return () => cancelIdleCallback(handle);
		}
		const timer = setTimeout(installConsoleEgg, 1500);
		return () => clearTimeout(timer);
	});
</script>

<svelte:head>
	<!-- Navbar crescent on a night tile; static/favicon.ico and apple-touch-icon.png are renders of the same SVG. -->
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
