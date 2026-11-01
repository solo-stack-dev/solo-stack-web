<!--
	Layout for every page except the homepage (blog, stats, later contact and legal pages): the calm site shell with
	light/dark mode, the sticky navbar, and the footer. Pages render their own content into <main>; keep this layout
	generic (no page specific data), so new pages just drop into src/routes/(site)/.

	Theme: mode-watcher, default "system", the visitor's choice is remembered in localStorage. Its head script sets the
	`dark` class on <html> before the first paint (no flash). `data-site-surface` lets layout.css switch the html
	background and color-scheme from the homepage night to the theme while this layout is mounted.
-->
<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import MobileMenu from '#lib/components/site/MobileMenu.svelte';
	import SiteFooter from '#lib/components/site/SiteFooter.svelte';
	import SiteNav from '#lib/components/site/SiteNav.svelte';
	import ThemeToggle from '#lib/components/site/ThemeToggle.svelte';
	import PaperGrain from '#lib/home/shared/PaperGrain.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
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

	<!-- The watercolor paper of the brand, very faint: warm tooth on the light paper, a little grain in the night -->
	<PaperGrain opacity={0.05} />
</div>
