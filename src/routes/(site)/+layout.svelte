<!--
	Shell for every page but the homepage. Keep it generic (no page data) so new pages just drop into src/routes/(site)/.
	mode-watcher (default "system", stored in localStorage) sets `dark` on <html> before first paint. `data-site-surface`
	lets layout.css switch the html background and color-scheme to the theme while mounted.
	Paper grain: 5% fiber over the whole page; on article pages (long reading) only ~2%, with the full grain kept around the
	hero art at the top and the footer horizon at the bottom (two local patches that fade into the page).
-->
<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import { page } from '$app/state';
	import MobileMenu from '#lib/components/site/MobileMenu.svelte';
	import SiteFooter from '#lib/components/site/SiteFooter.svelte';
	import SiteNav from '#lib/components/site/SiteNav.svelte';
	import ThemeToggle from '#lib/components/site/ThemeToggle.svelte';
	import { useViewTransitions } from '#lib/components/site/view-transition.ts';
	import PaperGrain from '#lib/home/shared/PaperGrain.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	useViewTransitions();

	/** Long reading: a calmer surface behind the text */
	const reading = $derived(page.route.id === '/(site)/blog/[slug]');
</script>

<ModeWatcher defaultMode="system" themeColors={{ light: '#fdf9ee', dark: '#18191b' }} synchronousModeChanges />

<div class="site-surface flex min-h-svh flex-col text-foreground" data-site-surface>
	<a
		href="#main"
		class="fixed top-3 left-1/2 z-50 -translate-x-1/2 -translate-y-24 rounded-full bg-butter px-4 py-2 font-semibold text-night focus-visible:translate-y-0"
	>
		{m.site_nav_skip()}
	</a>

	<SiteNav variant="site">
		{#snippet actions()}
			<ThemeToggle />
			<MobileMenu />
		{/snippet}
	</SiteNav>

	<main id="main" tabindex="-1" class="flex-1 focus:outline-none">
		{@render children()}
	</main>

	<SiteFooter />

	<!-- Faint watercolor paper grain -->
	<PaperGrain opacity={reading ? 0.02 : 0.05} />
	{#if reading}
		<div class="grain-patch is-top" aria-hidden="true"><PaperGrain fixed={false} opacity={0.03} /></div>
		<div class="grain-patch is-bottom" aria-hidden="true"><PaperGrain fixed={false} opacity={0.03} /></div>
	{/if}
</div>

<style>
	.site-surface {
		position: relative;
	}

	.grain-patch {
		position: absolute;
		inset-inline: 0;
		pointer-events: none;
	}

	.is-top {
		top: 0;
		height: 52rem;
		mask: linear-gradient(#000 45%, transparent);
	}

	.is-bottom {
		bottom: 0;
		height: 44rem;
		mask: linear-gradient(transparent, #000 50%);
	}
</style>
