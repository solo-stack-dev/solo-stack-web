<!--
	Shell for every page but the homepage. Keep it generic (no page data) so new pages just drop into src/routes/(site)/.
	mode-watcher (default "system", stored in localStorage) sets `dark` on <html> before first paint. `data-site-surface`
	lets layout.css switch the html background and color-scheme to the theme while mounted.
-->
<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
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
</script>

<ModeWatcher defaultMode="system" themeColors={{ light: '#fdf9ee', dark: '#18191b' }} synchronousModeChanges />

<div class="site-surface flex min-h-svh flex-col bg-background text-foreground" data-site-surface>
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
	<PaperGrain opacity={0.05} />
</div>
