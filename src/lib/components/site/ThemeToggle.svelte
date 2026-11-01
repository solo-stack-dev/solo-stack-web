<!--
	@component
	Theme button of the site navbar. The dropdown itself (ThemeMenu, bits-ui) loads on the first tap via LazyMenu.
-->
<script lang="ts">
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { m } from '#lib/paraglide/messages.js';
	import LazyMenu from './LazyMenu.svelte';
</script>

<LazyMenu load={() => import('./ThemeMenu.svelte')} label={m.site_theme_label()} haspopup="menu">
	<SunIcon class="size-5 dark:hidden" aria-hidden="true" />
	<MoonIcon class="hidden size-5 dark:block" aria-hidden="true" />
</LazyMenu>
